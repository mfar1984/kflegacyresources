import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
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

async function getAdminId(username: string): Promise<number> {
  const [admins] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  return admins[0]?.id || 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (!hasPermission(userPermissions, 'payroll_approve')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to approve payroll periods' });
  }

  const connection = await pool.getConnection();

  try {
    const { period_id, remarks } = req.body;

    if (!period_id) {
      return res.status(400).json({ error: 'Period ID is required' });
    }

    await connection.beginTransaction();

    // Get period details
    const [periods] = await connection.query<RowDataPacket[]>(
      'SELECT id, period_name, status FROM payroll_periods WHERE id = ?',
      [period_id]
    );

    if (!periods || periods.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Payroll period not found' });
    }

    const period = periods[0];

    if (period.status !== 'processing') {
      await connection.rollback();
      return res.status(400).json({ error: 'Only processing periods can be approved' });
    }

    const adminId = await getAdminId(session.username);

    // Update period status to approved
    await connection.query<ResultSetHeader>(
      `UPDATE payroll_periods SET
        status = 'approved',
        approved_by = ?,
        approved_date = NOW(),
        remarks = ?
      WHERE id = ?`,
      [adminId, remarks || null, period_id]
    );

    // Update all payslips to approved
    await connection.query<ResultSetHeader>(
      `UPDATE payroll_records SET
        status = 'approved'
      WHERE payroll_period_id = ? AND status = 'draft'`,
      [period_id]
    );

    await connection.commit();

    return res.status(200).json({ 
      message: `Payroll period "${period.period_name}" approved successfully` 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Approve period error:', error);
    return res.status(500).json({ error: 'Failed to approve payroll period' });
  } finally {
    connection.release();
  }
}

