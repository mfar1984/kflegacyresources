import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
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
  const adminId = (admins as any[])[0].id;
  const [permissions] = await pool.query<RowDataPacket[]>(`
    SELECT DISTINCT p.module, p.action
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
    WHERE ar.admin_id = ?
    ORDER BY p.module, p.action
  `, [adminId]);
  return (permissions as any[]).map(p => `${p.module}_${p.action}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');

  const { hash, period_id } = req.query as { hash?: string; period_id?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);
  if (!hasPermission(userPermissions, 'kpi_reviews_view')) return res.status(403).json({ error: 'Forbidden' });

  try {
    const where: string[] = [];
    const params: any[] = [];
    if (period_id) { where.push('r.period_id = ?'); params.push(Number(period_id)); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.id, r.employee_id, e.full_name as employee_name, r.final_score, r.grade, r.bonus_amount
       FROM kpi_employee_results r
       INNER JOIN employees e ON r.employee_id = e.id
       ${whereSql}
       ORDER BY r.final_score DESC`
      , params);
    return res.status(200).json({ results: rows });
  } catch (error) {
    console.error('KPI results fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch KPI results' });
  }
}


