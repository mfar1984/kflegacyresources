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
      SELECT DISTINCT p.module, p.action FROM permissions p
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

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'overtime_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, status, year, month } = req.query;
      let query = `
        SELECT 
          ot.*,
          e.full_name as employee_name,
          e.employee_id as employee_number,
          d.name as department_name,
          COALESCE(otr.name, 'Pending Rate Assignment') as rate_name,
          COALESCE(otr.rate_multiplier, 0) as rate_multiplier,
          CASE 
            WHEN ot.overtime_rate_id IS NULL THEN 0
            ELSE (ot.total_hours * ot.hourly_rate * otr.rate_multiplier)
          END as total_amount,
          a.username as reviewed_by_name
        FROM overtime_applications ot
        INNER JOIN employees e ON ot.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN overtime_rates otr ON ot.overtime_rate_id = otr.id
        LEFT JOIN admins a ON ot.reviewed_by = a.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (employee_id) { query += ' AND ot.employee_id = ?'; params.push(employee_id); }
      if (status) { query += ' AND ot.status = ?'; params.push(status); }
      if (year) { query += ' AND YEAR(ot.overtime_date) = ?'; params.push(year); }
      if (month) { query += ' AND MONTH(ot.overtime_date) = ?'; params.push(month); }
      query += ' ORDER BY ot.applied_date DESC';
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Overtime fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch overtime applications' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'overtime_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        employee_id, project_name, overtime_date, start_time, end_time,
        total_hours, overtime_rate_id, hourly_rate, reason, remarks
      } = req.body;

      if (!employee_id || !project_name || !overtime_date || !start_time || !end_time || !total_hours || !overtime_rate_id || !hourly_rate || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate overtime number (format: OT-YYYYMMDD-XXX)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = `OT-${dateStr}-`;
      
      // Get the highest sequence number for today
      const [maxResult] = await pool.query<RowDataPacket[]>(
        `SELECT overtime_number FROM overtime_applications 
         WHERE overtime_number LIKE ? 
         ORDER BY overtime_number DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let sequence = 1;
      if (maxResult && maxResult.length > 0) {
        const lastNumber = maxResult[0].overtime_number;
        const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
        sequence = lastSeq + 1;
      }
      
      const overtime_number = `${prefix}${String(sequence).padStart(3, '0')}`;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO overtime_applications 
         (overtime_number, employee_id, project_name, overtime_date, start_time, end_time, total_hours, overtime_rate_id, hourly_rate, reason, remarks, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [overtime_number, employee_id, project_name, overtime_date, start_time, end_time, total_hours, overtime_rate_id, hourly_rate, reason, remarks || null]
      );

      return res.status(201).json({
        message: 'Overtime application created successfully',
        id: result.insertId,
        overtime_number
      });
    } catch (error) {
      console.error('Overtime creation error:', error);
      return res.status(500).json({ error: 'Failed to create overtime application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

