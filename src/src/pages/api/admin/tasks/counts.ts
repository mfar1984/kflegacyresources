import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { hash } = req.query as { hash?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [[ot]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as c FROM overtime_applications WHERE status = \'pending\'');
    const [[lv]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as c FROM leave_applications WHERE status = \'pending\'');
    const [[cl]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as c FROM claims WHERE status = \'pending\'');
    const [[ex]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as c FROM expenses WHERE status = \'pending\'');
    // KPI: conservative count — assignments not approved/rejected (acts as pending)
    const [[kpi]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as c FROM kpi_assignments WHERE status NOT IN ('approved','rejected')");
    // Applicants: count pending job applications
    const [[app]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as c FROM career_applicants WHERE status = 'pending'");
    // Procurement: count pending supplier registrations
    const [[proc]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as c FROM procurement_applications WHERE status = 'pending'");

    return res.status(200).json({
      overtime: Number(ot?.c || 0),
      leave: Number(lv?.c || 0),
      claims: Number(cl?.c || 0),
      expenses: Number(ex?.c || 0),
      kpi: Number(kpi?.c || 0),
      applicants: Number(app?.c || 0),
      procurement: Number(proc?.c || 0),
    });
  } catch (error) {
    console.error('Tasks counts error:', error);
    return res.status(500).json({ error: 'Failed to fetch counts' });
  }
}


