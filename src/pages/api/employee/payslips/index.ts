import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifyEmployee(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0] as any;
  if (new Date(s.expires_at) < new Date()) return null;
  if (s.user_type !== 'employee') return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Avoid stale cached responses
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Handler', 'employee/payslips/index');

  const { hash } = req.query as { hash?: string };
  if ((req.query as any).debug === '1') {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
        [String(hash || '')]
      );
      const r = rows?.[0] || null;
      return res.status(200).json({ raw: r, now: new Date().toISOString() });
    } catch (e) {
      return res.status(200).json({ raw: null, error: 'query_failed' });
    }
  }
  const session = await verifyEmployee(String(hash || ''));
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: no-session' });
  }

  // If employee_id is provided, it must match session to allow backward-compat calls
  const employeeIdParam = (req.query as any).employee_id ? parseInt(String((req.query as any).employee_id), 10) : null;
  if (employeeIdParam && employeeIdParam !== Number(session.employee_id)) {
    return res.status(401).json({ error: 'Unauthorized: mismatch' });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         pr.id,
         pp.period_name,
         pp.start_date,
         pp.end_date,
         pr.gross_salary,
         pr.net_salary,
         pr.status
       FROM payroll_records pr
       INNER JOIN payroll_periods pp ON pr.payroll_period_id = pp.id
       WHERE pr.employee_id = ?
       ORDER BY pp.payment_date DESC, pp.period_year DESC, pp.period_month DESC`,
      [Number(session.employee_id)]
    );
    return res.status(200).json({ payslips: rows });
  } catch (error) {
    console.error('Employee payslips fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch payslips' });
  }
}
