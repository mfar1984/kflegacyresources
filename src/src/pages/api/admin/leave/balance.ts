import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
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
  const { hash, employee_id, year } = req.query;

  // Verify session
  const session = await verifySession(hash as string);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user permissions
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    // Check permission - allow both leave_view and leave_balance
    if (!hasPermission(userPermissions, 'leave_view') && !hasPermission(userPermissions, 'leave_balance')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const currentYear = year || new Date().getFullYear();

      let query = `
        SELECT 
          lb.*,
          lt.name as leave_type_name,
          lt.code as leave_type_code,
          lt.color as leave_type_color,
          e.full_name as employee_name,
          e.employee_id as employee_number
        FROM leave_balances lb
        INNER JOIN leave_types lt ON lb.leave_type_id = lt.id
        INNER JOIN employees e ON lb.employee_id = e.id
        WHERE lb.year = ?
      `;

      const params: any[] = [currentYear];

      if (employee_id) {
        query += ' AND lb.employee_id = ?';
        params.push(employee_id);
      }

      query += ' ORDER BY e.full_name, lt.name';

      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Leave balance fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch leave balances' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

