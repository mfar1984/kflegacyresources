import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
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
  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'payroll_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { year, month, status, employee_id, period_id } = req.query;
      
      let query = `
        SELECT 
          pr.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          d.name as department_name,
          pp.period_name,
          pp.period_month,
          pp.period_year,
          pp.payment_date
        FROM payroll_records pr
        INNER JOIN employees e ON pr.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN payroll_periods pp ON pr.payroll_period_id = pp.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (year) { 
        query += ' AND pp.period_year = ?'; 
        params.push(year); 
      }
      if (month) { 
        query += ' AND pp.period_month = ?'; 
        params.push(month); 
      }
      if (status) { 
        query += ' AND pr.status = ?'; 
        params.push(status); 
      }
      if (employee_id) { 
        query += ' AND pr.employee_id = ?'; 
        params.push(employee_id); 
      }
      if (period_id) { 
        query += ' AND pr.payroll_period_id = ?'; 
        params.push(period_id); 
      }
      
      query += ' ORDER BY pr.id DESC';
      
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Payroll records fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

