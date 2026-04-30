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
  const { hash, id } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'expenses_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [expenses] = await pool.query<RowDataPacket[]>(
        `SELECT 
          ex.*,
          e.full_name as employee_name,
          e.employee_id as employee_number,
          d.name as department_name,
          ec.name as category_name,
          ec.code as category_code,
          a.username as reviewed_by_name
        FROM expenses ex
        INNER JOIN employees e ON ex.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN expense_categories ec ON ex.category_id = ec.id
        LEFT JOIN admins a ON ex.reviewed_by = a.id
        WHERE ex.id = ?`,
        [id]
      );

      if (!expenses || expenses.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      const [items] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM expense_items WHERE expense_id = ? ORDER BY item_date',
        [id]
      );

      return res.status(200).json({ expense: { ...expenses[0], items } });
    } catch (error) {
      console.error('Expense fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch expense' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'expenses_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT status FROM expenses WHERE id = ?', [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      if (existing[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending expenses can be deleted' });
      }

      await pool.query('DELETE FROM expense_items WHERE expense_id = ?', [id]);
      await pool.query('DELETE FROM expenses WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Expense deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

