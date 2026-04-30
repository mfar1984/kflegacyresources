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
  const { id, hash } = req.query;

  // Verify session
  const session = await verifySession(hash as string);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user permissions
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    // Check permission
    if (!hasPermission(userPermissions, 'leave_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          la.*,
          e.full_name as employee_name,
          e.employee_id as employee_number,
          e.email as employee_email,
          d.name as department_name,
          lt.name as leave_type_name,
          lt.color as leave_type_color,
          lt.code as leave_type_code,
          lt.requires_document,
          a.username as reviewed_by_name
        FROM leave_applications la
        INNER JOIN employees e ON la.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN leave_types lt ON la.leave_type_id = lt.id
        LEFT JOIN admins a ON la.reviewed_by = a.id
        WHERE la.id = ?`,
        [id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Leave application fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch leave application' });
    }
  }

  if (req.method === 'PUT') {
    // Check permission
    if (!hasPermission(userPermissions, 'leave_update')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        leave_type_id,
        start_date,
        end_date,
        total_days,
        reason,
        remarks,
        status
      } = req.body;

      // Check if leave can be updated (only pending leaves can be updated)
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT status FROM leave_applications WHERE id = ?',
        [id]
      );

      if (!existingRows || existingRows.length === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }

      if (existingRows[0].status !== 'pending') {
        return res.status(400).json({ 
          error: 'Only pending leave applications can be updated' 
        });
      }

      // Update leave application
      await pool.query<ResultSetHeader>(
        `UPDATE leave_applications 
         SET leave_type_id = ?, start_date = ?, end_date = ?, total_days = ?, 
             reason = ?, remarks = ?, status = ?
         WHERE id = ?`,
        [leave_type_id, start_date, end_date, total_days, reason, remarks || null, status || 'pending', id]
      );

      return res.status(200).json({ message: 'Leave application updated successfully' });
    } catch (error) {
      console.error('Leave application update error:', error);
      return res.status(500).json({ error: 'Failed to update leave application' });
    }
  }

  if (req.method === 'DELETE') {
    // Check permission
    if (!hasPermission(userPermissions, 'leave_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Check if leave can be deleted (only pending leaves can be deleted)
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT status, employee_id, leave_type_id, total_days, start_date FROM leave_applications WHERE id = ?',
        [id]
      );

      if (!existingRows || existingRows.length === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }

      if (existingRows[0].status !== 'pending') {
        return res.status(400).json({ 
          error: 'Only pending leave applications can be deleted' 
        });
      }

      const leave = existingRows[0];
      const year = new Date(leave.start_date).getFullYear();

      // Update pending_days in leave_balances before deleting
      await pool.query<ResultSetHeader>(
        `UPDATE leave_balances 
         SET pending_days = pending_days - ?
         WHERE employee_id = ? 
           AND leave_type_id = ? 
           AND year = ?`,
        [leave.total_days, leave.employee_id, leave.leave_type_id, year]
      );

      // Delete leave application
      await pool.query<ResultSetHeader>(
        'DELETE FROM leave_applications WHERE id = ?',
        [id]
      );

      return res.status(200).json({ message: 'Leave application deleted successfully' });
    } catch (error) {
      console.error('Leave application deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete leave application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

