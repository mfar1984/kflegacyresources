import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?', [hash]
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
      'SELECT id FROM admins WHERE username = ? LIMIT 1', [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'expenses_approve')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { id, action, review_remarks } = req.body;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const [adminRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM admins WHERE username = ?', [session.username]
      );

      if (!adminRows || adminRows.length === 0) {
        return res.status(401).json({ error: 'Admin not found' });
      }

      const reviewerId = adminRows[0].id;

      const [expenseRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM expenses WHERE id = ?', [id]
      );

      if (!expenseRows || expenseRows.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      if (expenseRows[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending expenses can be reviewed' });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await pool.query<ResultSetHeader>(
        `UPDATE expenses 
         SET status = ?, reviewed_by = ?, reviewed_date = NOW(), review_remarks = ?
         WHERE id = ?`,
        [newStatus, reviewerId, review_remarks || null, id]
      );

      return res.status(200).json({ 
        message: `Expense ${action}d successfully`,
        status: newStatus
      });
    } catch (error) {
      console.error('Expense approval error:', error);
      return res.status(500).json({ error: 'Failed to process expense' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

