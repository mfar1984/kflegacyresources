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
    if (!hasPermission(userPermissions, 'bonuses_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [bonuses] = await pool.query<RowDataPacket[]>(
        `SELECT 
          eb.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.position as employee_position,
          d.name as department_name,
          pp.period_name,
          pp.period_month,
          pp.period_year,
          pp.payment_date,
          creator.username as created_by_name,
          approver.username as approved_by_name
        FROM employee_bonuses eb
        INNER JOIN employees e ON eb.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN payroll_periods pp ON eb.payroll_period_id = pp.id
        LEFT JOIN admins creator ON eb.created_by = creator.id
        LEFT JOIN admins approver ON eb.approved_by = approver.id
        WHERE eb.id = ?`,
        [id]
      );

      if (!bonuses || bonuses.length === 0) {
        return res.status(404).json({ error: 'Bonus not found' });
      }

      return res.status(200).json(bonuses[0]);
    } catch (error) {
      console.error('Bonus fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch bonus' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasPermission(userPermissions, 'bonuses_update')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        bonus_type,
        bonus_name,
        bonus_date,
        amount,
        remarks,
        status
      } = req.body;

      // Check if bonus exists and is still pending
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM employee_bonuses WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Bonus not found' });
      }

      if (existing[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending bonuses can be updated' });
      }

      const adminId = await getAdminId(session.username);

      await pool.query<ResultSetHeader>(
        `UPDATE employee_bonuses SET
          bonus_type = ?,
          bonus_name = ?,
          bonus_date = ?,
          amount = ?,
          remarks = ?,
          status = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          bonus_type,
          bonus_name,
          bonus_date,
          amount,
          remarks || null,
          status || 'pending',
          id
        ]
      );

      return res.status(200).json({ message: 'Bonus updated successfully' });
    } catch (error) {
      console.error('Bonus update error:', error);
      return res.status(500).json({ error: 'Failed to update bonus' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'bonuses_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Check if bonus exists and is still pending
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM employee_bonuses WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Bonus not found' });
      }

      if (existing[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending bonuses can be deleted' });
      }

      await pool.query<ResultSetHeader>(
        'DELETE FROM employee_bonuses WHERE id = ?',
        [id]
      );

      return res.status(200).json({ message: 'Bonus deleted successfully' });
    } catch (error) {
      console.error('Bonus deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete bonus' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

