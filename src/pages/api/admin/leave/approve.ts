import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

// Session verification helper
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

// Get user permissions helper
async function getUserPermissions(username: string): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    if (!admins || admins.length === 0) {
      return [];
    }

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

  // Verify session
  const session = await verifySession(hash as string);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user permissions
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'POST') {
    // Check permission
    if (!hasPermission(userPermissions, 'leave_approve')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { id, action, review_remarks } = req.body;

      // Validate action
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
      }

      // Get reviewer admin ID
      const [adminRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM admins WHERE username = ?',
        [session.username]
      );

      if (!adminRows || adminRows.length === 0) {
        return res.status(401).json({ error: 'Admin not found' });
      }

      const reviewerId = adminRows[0].id;

      // Check if leave application exists and is pending
      const [leaveRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, status, employee_id, leave_type_id, total_days, start_date FROM leave_applications WHERE id = ?',
        [id]
      );

      if (!leaveRows || leaveRows.length === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }

      if (leaveRows[0].status !== 'pending') {
        return res.status(400).json({ 
          error: 'Only pending leave applications can be approved or rejected' 
        });
      }

      const leave = leaveRows[0];
      const year = new Date(leave.start_date).getFullYear();

      // Update leave application status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await pool.query<ResultSetHeader>(
        `UPDATE leave_applications 
         SET status = ?, reviewed_by = ?, reviewed_date = NOW(), review_remarks = ?
         WHERE id = ?`,
        [newStatus, reviewerId, review_remarks || null, id]
      );

      // Update leave balance (remaining_days is auto-calculated)
      if (action === 'approve') {
        // Approved: decrease pending_days and increase used_days
        await pool.query<ResultSetHeader>(
          `UPDATE leave_balances 
           SET pending_days = pending_days - ?,
               used_days = used_days + ?
           WHERE employee_id = ? 
             AND leave_type_id = ? 
             AND year = ?`,
          [leave.total_days, leave.total_days, leave.employee_id, leave.leave_type_id, year]
        );
      } else if (action === 'reject') {
        // Rejected: decrease pending_days only
        await pool.query<ResultSetHeader>(
          `UPDATE leave_balances 
           SET pending_days = pending_days - ?
           WHERE employee_id = ? 
             AND leave_type_id = ? 
             AND year = ?`,
          [leave.total_days, leave.employee_id, leave.leave_type_id, year]
        );
      }

      return res.status(200).json({ 
        message: `Leave application ${action}d successfully`,
        status: newStatus
      });
    } catch (error) {
      console.error('Leave approval error:', error);
      return res.status(500).json({ error: 'Failed to process leave application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

