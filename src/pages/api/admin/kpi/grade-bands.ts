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
  const [admins] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  if (!admins || admins.length === 0) return [];
  const adminId = (admins as any)[0].id;
  const [perms] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT p.module, p.action
     FROM permissions p
     INNER JOIN role_permissions rp ON p.id = rp.permission_id
     INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
     WHERE ar.admin_id = ?`,
    [adminId]
  );
  return (perms as any[]).map(p => `${p.module}_${p.action}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query as { hash?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_grades_view')) return res.status(403).json({ error: 'Forbidden' });
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, min_score, max_score, grade, description, bonus_type, bonus_value FROM kpi_grade_bands ORDER BY min_score DESC`);
    return res.status(200).json({ grade_bands: rows });
  }
  if (req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_grades_create')) return res.status(403).json({ error: 'Forbidden' });
    const { min_score, max_score, grade, description, bonus_type, bonus_value } = req.body || {};
    if (min_score == null || max_score == null || !grade) return res.status(422).json({ error: 'min_score, max_score, grade required' });
    await pool.query<ResultSetHeader>(
      `INSERT INTO kpi_grade_bands (min_score, max_score, grade, description, bonus_type, bonus_value) VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(min_score), Number(max_score), grade, description || null, bonus_type || 'fixed', Number(bonus_value || 0)]
    );
    return res.status(200).json({ created: true });
  }
  if (req.method === 'PUT') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_grades_edit')) return res.status(403).json({ error: 'Forbidden' });
    const { id, min_score, max_score, grade, description, bonus_type, bonus_value } = req.body || {};
    if (!id) return res.status(422).json({ error: 'id required' });
    await pool.query<ResultSetHeader>(
      `UPDATE kpi_grade_bands SET min_score = ?, max_score = ?, grade = ?, description = ?, bonus_type = ?, bonus_value = ? WHERE id = ?`,
      [Number(min_score), Number(max_score), grade, description || null, bonus_type || 'fixed', Number(bonus_value || 0), Number(id)]
    );
    return res.status(200).json({ updated: true });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_grades_delete')) return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.query as { id?: string };
    if (!id) return res.status(422).json({ error: 'id required' });
    await pool.query<ResultSetHeader>(`DELETE FROM kpi_grade_bands WHERE id = ? LIMIT 1`, [Number(id)]);
    return res.status(200).json({ deleted: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}


