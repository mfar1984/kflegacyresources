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
  const { hash, id } = req.query as { hash?: string; id?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'kpi_templates_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, code, title, description, unit, default_weight, owner_scope, is_active,
                created_at, updated_at
         FROM kpi_templates WHERE id = ? LIMIT 1`,
        [Number(id)]
      );
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ template: rows[0] });
    } catch (error) {
      console.error('KPI template fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch KPI template' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasPermission(userPermissions, 'kpi_templates_edit')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { code, title, description, unit, default_weight, owner_scope, is_active } = req.body;
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE kpi_templates SET 
           code = COALESCE(?, code),
           title = COALESCE(?, title),
           description = COALESCE(?, description),
           unit = COALESCE(?, unit),
           default_weight = COALESCE(?, default_weight),
           owner_scope = COALESCE(?, owner_scope),
           is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [code, title, description, unit, default_weight, owner_scope, typeof is_active === 'boolean' ? (is_active ? 1 : 0) : null, Number(id)]
      );
      return res.status(200).json({ affectedRows: result.affectedRows });
    } catch (error) {
      console.error('KPI template update error:', error);
      return res.status(500).json({ error: 'Failed to update KPI template' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'kpi_templates_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM kpi_templates WHERE id = ? LIMIT 1',
        [Number(id)]
      );
      return res.status(200).json({ affectedRows: result.affectedRows });
    } catch (error) {
      console.error('KPI template delete error:', error);
      return res.status(500).json({ error: 'Failed to delete KPI template' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


