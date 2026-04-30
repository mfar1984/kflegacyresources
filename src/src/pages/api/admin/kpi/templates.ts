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
    if (!hasPermission(userPermissions, 'kpi_templates_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, code, title, description, unit, default_weight, owner_scope, is_active,
                created_at, updated_at
         FROM kpi_templates
         ORDER BY is_active DESC, title ASC`
      );
      return res.status(200).json({ templates: rows });
    } catch (error) {
      console.error('KPI templates fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch KPI templates' });
    }
  }

  if (req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_templates_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { code, title, description, unit, default_weight, owner_scope, is_active } = req.body;
      if (!code || !title || !unit) {
        return res.status(422).json({ error: 'code, title and unit are required' });
      }
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO kpi_templates (code, title, description, unit, default_weight, owner_scope, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [String(code).trim(), title, description || null, unit, Number(default_weight || 10), owner_scope || 'company', is_active ? 1 : 1]
      );
      return res.status(200).json({ id: result.insertId });
    } catch (error) {
      console.error('KPI template create error:', error);
      return res.status(500).json({ error: 'Failed to create KPI template' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


