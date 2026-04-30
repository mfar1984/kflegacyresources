import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

async function getUserPermissions(username: string): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_assignments_view')) return res.status(403).json({ error: 'Forbidden' });
    try {
      const { period_id, employee_id } = req.query as { period_id?: string; employee_id?: string };
      const where: string[] = [];
      const params: any[] = [];
      if (period_id) { where.push('a.period_id = ?'); params.push(Number(period_id)); }
      if (employee_id) { where.push('a.employee_id = ?'); params.push(Number(employee_id)); }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT a.*, t.code as template_code, t.title as template_title, t.unit,
                e.employee_id as employee_number, e.full_name as employee_name
         FROM kpi_assignments a
         INNER JOIN kpi_templates t ON a.template_id = t.id
         INNER JOIN employees e ON a.employee_id = e.id
         ${whereSql}
         ORDER BY e.full_name, t.title`
        , params);
      return res.status(200).json({ assignments: rows });
    } catch (error) {
      console.error('KPI assignments fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch KPI assignments' });
    }
  }

  if (req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_assignments_create')) return res.status(403).json({ error: 'Forbidden' });
    try {
      // Support single or bulk create
      const body = req.body as any;
      const items: Array<{ period_id: number; employee_id: number; template_id: number; target_value?: number; weight?: number; reviewer_admin_id?: number; }>
        = Array.isArray(body.items) ? body.items : [body];
      if (!items || items.length === 0) return res.status(422).json({ error: 'No assignments' });

      const created: number[] = [];
      for (const it of items) {
        const { period_id, employee_id, template_id, target_value = 0, weight = 10, reviewer_admin_id } = it || {};
        if (!period_id || !employee_id || !template_id) continue;
        try {
          const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO kpi_assignments (period_id, employee_id, template_id, target_value, weight, reviewer_admin_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'draft')
             ON DUPLICATE KEY UPDATE target_value = VALUES(target_value), weight = VALUES(weight), reviewer_admin_id = VALUES(reviewer_admin_id)`,
            [period_id, employee_id, template_id, Number(target_value), Number(weight), reviewer_admin_id || null]
          );
          if (result.insertId) created.push(result.insertId);
        } catch (err) {
          // continue other items
        }
      }
      return res.status(200).json({ created_ids: created });
    } catch (error) {
      console.error('KPI assignment create error:', error);
      return res.status(500).json({ error: 'Failed to create KPI assignments' });
    }
  }

  if (req.method === 'PUT') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_assignments_edit')) return res.status(403).json({ error: 'Forbidden' });
    try {
      const { id, target_value, weight, status, reviewer_admin_id } = req.body as { id?: number; target_value?: number; weight?: number; status?: string; reviewer_admin_id?: number };
      if (!id) return res.status(422).json({ error: 'id is required' });
      const fields: string[] = [];
      const params: any[] = [];
      if (typeof target_value === 'number') { fields.push('target_value = ?'); params.push(target_value); }
      if (typeof weight === 'number') { fields.push('weight = ?'); params.push(weight); }
      if (status) { fields.push('status = ?'); params.push(status); }
      if (typeof reviewer_admin_id !== 'undefined') { fields.push('reviewer_admin_id = ?'); params.push(reviewer_admin_id || null); }
      if (fields.length === 0) return res.status(422).json({ error: 'No fields to update' });
      params.push(id);
      await pool.query<ResultSetHeader>(`UPDATE kpi_assignments SET ${fields.join(', ')} WHERE id = ?`, params);
      return res.status(200).json({ updated: true });
    } catch (error) {
      console.error('KPI assignment update error:', error);
      return res.status(500).json({ error: 'Failed to update KPI assignment' });
    }
  }

  if (req.method === 'DELETE') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_assignments_delete')) return res.status(403).json({ error: 'Forbidden' });
    try {
      const { id } = req.query as { id?: string };
      if (!id) return res.status(422).json({ error: 'id is required' });
      const [result] = await pool.query<ResultSetHeader>('DELETE FROM kpi_assignments WHERE id = ? LIMIT 1', [Number(id)]);
      return res.status(200).json({ deleted: result.affectedRows > 0 });
    } catch (error) {
      console.error('KPI assignment delete error:', error);
      return res.status(500).json({ error: 'Failed to delete KPI assignment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


