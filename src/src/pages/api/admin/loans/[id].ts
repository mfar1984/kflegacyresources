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
  const { hash, id } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'loans_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [loans] = await pool.query<RowDataPacket[]>(
        `SELECT 
          el.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.position as employee_position,
          d.name as department_name,
          creator.username as created_by_name,
          approver.username as approved_by_name
        FROM employee_loans el
        INNER JOIN employees e ON el.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins creator ON el.created_by = creator.id
        LEFT JOIN admins approver ON el.approved_by = approver.id
        WHERE el.id = ?`,
        [id]
      );

      if (!loans || loans.length === 0) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      return res.status(200).json(loans[0]);
    } catch (error) {
      console.error('Loan fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch loan' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasPermission(userPermissions, 'loans_update')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        loan_amount,
        total_installments,
        start_date,
        remarks,
        status
      } = req.body;

      // Check if loan exists and is still pending
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM employee_loans WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (existing[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending loans can be updated' });
      }

      // Recalculate monthly installment
      const monthly_installment = parseFloat(loan_amount) / parseInt(total_installments);

      await pool.query<ResultSetHeader>(
        `UPDATE employee_loans SET
          loan_amount = ?,
          monthly_installment = ?,
          remaining_balance = ?,
          total_installments = ?,
          start_date = ?,
          remarks = ?,
          status = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          loan_amount,
          monthly_installment,
          loan_amount, // Reset remaining balance
          total_installments,
          start_date,
          remarks || null,
          status || 'pending',
          id
        ]
      );

      return res.status(200).json({ message: 'Loan updated successfully', monthly_installment });
    } catch (error) {
      console.error('Loan update error:', error);
      return res.status(500).json({ error: 'Failed to update loan' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'loans_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Check if loan exists and is still pending
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM employee_loans WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (existing[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending loans can be deleted' });
      }

      await pool.query<ResultSetHeader>(
        'DELETE FROM employee_loans WHERE id = ?',
        [id]
      );

      return res.status(200).json({ message: 'Loan deleted successfully' });
    } catch (error) {
      console.error('Loan deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete loan' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

