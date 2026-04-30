import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { hash, period_id } = req.query as { hash?: string; period_id?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (!period_id) return res.status(422).json({ error: 'period_id required' });
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT e.employee_id as employee_number, e.full_name, r.final_score, r.grade, r.bonus_amount
       FROM kpi_employee_results r
       INNER JOIN employees e ON r.employee_id = e.id
       WHERE r.period_id = ?
       ORDER BY e.full_name`,
      [Number(period_id)]
    );
    const header = ['employee_number','full_name','final_score','grade','bonus_amount'];
    const lines = [header.join(',')].concat((rows as any[]).map(r => [r.employee_number, r.full_name, Number(r.final_score || 0).toFixed(2), r.grade || '', Number(r.bonus_amount || 0).toFixed(2)].join(',')));
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="kpi-results-${period_id}.csv"`);
    return res.status(200).send(csv);
  } catch (e) {
    console.error('KPI results export error:', e);
    return res.status(500).json({ error: 'Failed to export results' });
  }
}


