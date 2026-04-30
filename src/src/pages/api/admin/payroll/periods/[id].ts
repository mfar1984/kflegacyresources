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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash, id } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'payroll_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Check if payroll period exists and get its status
      const [periods] = await pool.query<RowDataPacket[]>(
        'SELECT id, status, period_name FROM payroll_periods WHERE id = ?',
        [id]
      );

      if (!periods || periods.length === 0) {
        return res.status(404).json({ error: 'Payroll period not found' });
      }

      const periodStatus = periods[0].status;
      const periodName = periods[0].period_name;

      // Only allow deletion of draft or processing periods (not approved/paid/closed - financial records)
      if (periodStatus !== 'draft' && periodStatus !== 'processing') {
        return res.status(400).json({ 
          error: 'Only draft or processing payroll periods can be deleted. Approved, paid, or closed periods cannot be deleted for audit purposes.' 
        });
      }

      // CASCADE DELETE: First, delete all payroll records for this period
      const [deleteRecords] = await pool.query<ResultSetHeader>(
        'DELETE FROM payroll_records WHERE payroll_period_id = ?',
        [id]
      );

      const deletedRecordsCount = deleteRecords.affectedRows;

      // Then delete the payroll period
      await pool.query<ResultSetHeader>(
        'DELETE FROM payroll_periods WHERE id = ?',
        [id]
      );

      return res.status(200).json({ 
        message: `Payroll period "${periodName}" and ${deletedRecordsCount} payslip(s) deleted successfully`,
        deletedRecords: deletedRecordsCount
      });
    } catch (error) {
      console.error('Payroll period deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete payroll period' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

