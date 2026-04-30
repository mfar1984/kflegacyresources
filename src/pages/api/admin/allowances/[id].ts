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
    if (!hasPermission(userPermissions, 'allowances_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [allowances] = await pool.query<RowDataPacket[]>(
        `SELECT 
          ea.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.position as employee_position,
          d.name as department_name,
          creator.username as created_by_name,
          updater.username as updated_by_name
        FROM employee_allowances ea
        INNER JOIN employees e ON ea.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins creator ON ea.created_by = creator.id
        LEFT JOIN admins updater ON ea.updated_by = updater.id
        WHERE ea.id = ?`,
        [id]
      );

      if (!allowances || allowances.length === 0) {
        return res.status(404).json({ error: 'Allowance setup not found' });
      }

      return res.status(200).json(allowances[0]);
    } catch (error) {
      console.error('Allowance fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch allowance' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasPermission(userPermissions, 'allowances_update')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        housing_allowance,
        transport_allowance,
        meal_allowance,
        other_allowances,
        effective_date,
        remarks,
        status
      } = req.body;

      // Check if allowance exists
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id, employee_id FROM employee_allowances WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Allowance setup not found' });
      }

      const adminId = await getAdminId(session.username);

      await pool.query<ResultSetHeader>(
        `UPDATE employee_allowances SET
          housing_allowance = ?,
          transport_allowance = ?,
          meal_allowance = ?,
          other_allowances = ?,
          effective_date = ?,
          remarks = ?,
          status = ?,
          updated_by = ?
        WHERE id = ?`,
        [
          housing_allowance,
          transport_allowance,
          meal_allowance,
          other_allowances,
          effective_date,
          remarks || null,
          status,
          adminId,
          id
        ]
      );

      return res.status(200).json({ message: 'Allowance setup updated successfully' });
    } catch (error) {
      console.error('Allowance update error:', error);
      return res.status(500).json({ error: 'Failed to update allowance setup' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'allowances_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM employee_allowances WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Allowance setup not found' });
      }

      await pool.query<ResultSetHeader>(
        'DELETE FROM employee_allowances WHERE id = ?',
        [id]
      );

      return res.status(200).json({ message: 'Allowance setup deleted successfully' });
    } catch (error) {
      console.error('Allowance deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete allowance setup' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

