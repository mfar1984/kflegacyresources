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
  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'payroll_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { year, month, status } = req.query;
      let query = `
        SELECT 
          pp.*,
          COUNT(DISTINCT pr.id) as record_count,
          a1.username as processed_by_name,
          a2.username as approved_by_name
        FROM payroll_periods pp
        LEFT JOIN payroll_records pr ON pp.id = pr.payroll_period_id
        LEFT JOIN admins a1 ON pp.processed_by = a1.id
        LEFT JOIN admins a2 ON pp.approved_by = a2.id
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
        query += ' AND pp.status = ?'; 
        params.push(status); 
      }
      
      query += ' GROUP BY pp.id ORDER BY pp.period_year DESC, pp.period_month DESC';
      
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Payroll periods fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch payroll periods' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'payroll_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { period_month, period_year, payment_date } = req.body;

      // Validate required fields
      if (!period_month || !period_year || !payment_date) {
        return res.status(400).json({ error: 'Month, year, and payment_date are required' });
      }

      // Check if period already exists
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM payroll_periods WHERE period_month = ? AND period_year = ?',
        [period_month, period_year]
      );

      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Payroll period for this month/year already exists' });
      }

      // Calculate start_date and end_date
      const monthNum = parseInt(period_month);
      const yearNum = parseInt(period_year);
      const startDate = new Date(yearNum, monthNum - 1, 1); // First day of month
      const endDate = new Date(yearNum, monthNum, 0); // Last day of month
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Generate period_name (e.g., "October 2025")
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const period_name = `${monthNames[monthNum - 1]} ${yearNum}`;

      // Insert payroll period
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO payroll_periods (
          period_name, period_month, period_year, 
          start_date, end_date, payment_date,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
        [period_name, monthNum, yearNum, startDateStr, endDateStr, payment_date]
      );

      return res.status(201).json({ 
        message: 'Payroll period created successfully', 
        id: result.insertId,
        period_name
      });
    } catch (error) {
      console.error('Payroll period creation error:', error);
      return res.status(500).json({ error: 'Failed to create payroll period' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

