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
    if (!hasPermission(userPermissions, 'kpi_competencies_view')) return res.status(403).json({ error: 'Forbidden' });
    const { period_id, employee_id, phase } = req.query as { period_id?: string; employee_id?: string; phase?: string };
    if (!period_id || !employee_id) return res.status(422).json({ error: 'period_id and employee_id required' });
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cs.id, cs.competency_id, c.code, c.title, cs.score, cs.phase, cs.reviewer_admin_id
       FROM kpi_competency_scores cs
       INNER JOIN kpi_competencies c ON cs.competency_id = c.id
       WHERE cs.period_id = ? AND cs.employee_id = ? ${phase ? 'AND cs.phase = ?' : ''}
       ORDER BY c.title`,
      phase ? [Number(period_id), Number(employee_id), String(phase)] : [Number(period_id), Number(employee_id)]
    );
    return res.status(200).json({ scores: rows });
  }
  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'kpi_competencies_edit') && !hasPermission(userPermissions, 'kpi_competencies_create')) return res.status(403).json({ error: 'Forbidden' });
    const { period_id, employee_id, phase, items } = req.body as { period_id?: number; employee_id?: number; phase?: 'mid' | 'final'; items?: Array<{ competency_id: number; score: number }> };
    if (!period_id || !employee_id || !items) return res.status(422).json({ error: 'period_id, employee_id and items required' });
    const [adminRows] = await pool.query<RowDataPacket[]>(`SELECT id FROM admins WHERE username = ? LIMIT 1`, [session.username]);
    const reviewerId = (adminRows as any[])[0]?.id || null;
    for (const it of items) {
      await pool.query<ResultSetHeader>(
        `INSERT INTO kpi_competency_scores (period_id, employee_id, competency_id, phase, score, reviewer_admin_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE score = VALUES(score), reviewer_admin_id = VALUES(reviewer_admin_id), reviewed_at = NOW()`,
        [period_id, employee_id, it.competency_id, phase || 'final', Number(it.score || 0), reviewerId]
      );
    }
    return res.status(200).json({ saved: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}


