import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifyEmployeeSession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  if (s.user_type !== 'employee') return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store');

  const { hash, period_id } = req.query as { hash?: string; period_id?: string };
  const session = await verifyEmployeeSession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // If no period_id, prefer open period covering today; else return all open for employee
    const params: any[] = [session.employee_id];
    let where = 'a.employee_id = ?';
    if (period_id) {
      where += ' AND a.period_id = ?';
      params.push(Number(period_id));
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT a.id, a.period_id, a.template_id, a.target_value, a.weight, a.status,
              t.code as template_code, t.title as template_title, t.unit,
              p.name as period_name, p.start_date, p.end_date, p.status as period_status,
              (
                SELECT au.actual_value FROM kpi_updates au 
                WHERE au.assignment_id = a.id 
                ORDER BY au.update_date DESC LIMIT 1
              ) as latest_actual
       FROM kpi_assignments a
       INNER JOIN kpi_templates t ON a.template_id = t.id
       INNER JOIN kpi_periods p ON a.period_id = p.id
       WHERE ${where}
       ORDER BY p.start_date DESC, t.title ASC`,
      params
    );

    // Compute progress (% achieved) per item
    const toNum = (v: any) => (v == null ? 0 : typeof v === 'number' ? v : parseFloat(String(v)) || 0);
    const items = rows.map(r => {
      const actual = toNum(r.latest_actual);
      const target = toNum(r.target_value);
      let scoreItem = 0;
      if (r.unit === 'boolean') {
        scoreItem = actual ? 100 : 0;
      } else {
        scoreItem = target > 0 ? Math.min(actual / target, 1) * 100 : 0;
      }
      return { ...r, progress_percent: Number(scoreItem.toFixed(2)) };
    });

    return res.status(200).json({ assignments: items });
  } catch (error) {
    console.error('Employee KPI list error:', error);
    return res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
}


