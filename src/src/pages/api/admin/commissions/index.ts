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
  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'commissions_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, period_id, status, year, month } = req.query;
      
      let query = `
        SELECT 
          ec.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.position as employee_position,
          d.name as department_name,
          pp.period_name,
          pp.period_month,
          pp.period_year,
          creator.username as created_by_name,
          approver.username as approved_by_name
        FROM employee_commissions ec
        INNER JOIN employees e ON ec.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN payroll_periods pp ON ec.payroll_period_id = pp.id
        LEFT JOIN admins creator ON ec.created_by = creator.id
        LEFT JOIN admins approver ON ec.approved_by = approver.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (employee_id) {
        query += ' AND ec.employee_id = ?';
        params.push(employee_id);
      }
      
      if (period_id) {
        query += ' AND ec.payroll_period_id = ?';
        params.push(period_id);
      }
      
      if (status) {
        query += ' AND ec.status = ?';
        params.push(status);
      }
      
      if (year) {
        query += ' AND pp.period_year = ?';
        params.push(year);
      }
      
      if (month) {
        query += ' AND pp.period_month = ?';
        params.push(month);
      }
      
      query += ' ORDER BY ec.created_at DESC';
      
      const [commissions] = await pool.query<RowDataPacket[]>(query, params);
      
      return res.status(200).json(commissions);
    } catch (error) {
      console.error('Commissions fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch commissions' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'commissions_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        employee_id,
        payroll_period_id,
        commission_type,
        commission_name,
        commission_date,
        amount,
        remarks,
        status = 'pending'
      } = req.body;

      if (!employee_id || !payroll_period_id || !commission_type || !amount) {
        return res.status(400).json({ error: 'Employee ID, period, commission type, and amount are required' });
      }

      // Use provided commission_name or generate default based on type
      const finalCommissionName = commission_name || `${commission_type.charAt(0).toUpperCase() + commission_type.slice(1)} Commission`;
      
      // Use provided commission_date or current date
      const finalCommissionDate = commission_date || new Date().toISOString().split('T')[0];

      // Generate unique commission number
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = `COM-${dateStr}-`;
      
      const [maxResult] = await pool.query<RowDataPacket[]>(
        `SELECT commission_number FROM employee_commissions 
         WHERE commission_number LIKE ? 
         ORDER BY commission_number DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let sequence = 1;
      if (maxResult && maxResult.length > 0) {
        const lastNumber = maxResult[0].commission_number;
        const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
        sequence = lastSeq + 1;
      }
      
      const commission_number = `${prefix}${String(sequence).padStart(3, '0')}`;

      const adminId = await getAdminId(session.username);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO employee_commissions (
          commission_number, employee_id, payroll_period_id, commission_type,
          commission_name, commission_date, amount, remarks, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          commission_number,
          employee_id,
          payroll_period_id,
          commission_type,
          finalCommissionName,
          finalCommissionDate,
          amount,
          remarks || null,
          status,
          adminId
        ]
      );

      return res.status(201).json({ 
        message: 'Commission created successfully',
        id: result.insertId,
        commission_number
      });
    } catch (error) {
      console.error('Commission creation error:', error);
      return res.status(500).json({ error: 'Failed to create commission' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

