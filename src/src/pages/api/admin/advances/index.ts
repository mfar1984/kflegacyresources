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
    if (!hasPermission(userPermissions, 'advances_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, status } = req.query;
      
      let query = `
        SELECT 
          ea.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.position as employee_position,
          d.name as department_name,
          creator.username as created_by_name,
          approver.username as approved_by_name
        FROM employee_advances ea
        INNER JOIN employees e ON ea.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins creator ON ea.created_by = creator.id
        LEFT JOIN admins approver ON ea.approved_by = approver.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (employee_id) {
        query += ' AND ea.employee_id = ?';
        params.push(employee_id);
      }
      
      if (status) {
        query += ' AND ea.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY ea.created_at DESC';
      
      const [advances] = await pool.query<RowDataPacket[]>(query, params);
      
      return res.status(200).json(advances);
    } catch (error) {
      console.error('Advances fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch advances' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'advances_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        employee_id,
        advance_amount,
        repayment_months,
        start_date,
        remarks,
        status = 'pending'
      } = req.body;

      if (!employee_id || !advance_amount || !repayment_months || !start_date) {
        return res.status(400).json({ error: 'Employee ID, advance amount, repayment months, and start date are required' });
      }

      // Calculate monthly deduction (dynamic!)
      const monthly_deduction = parseFloat(advance_amount) / parseInt(repayment_months);

      // Generate unique advance number
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = `ADV-${dateStr}-`;
      
      const [maxResult] = await pool.query<RowDataPacket[]>(
        `SELECT advance_number FROM employee_advances 
         WHERE advance_number LIKE ? 
         ORDER BY advance_number DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let sequence = 1;
      if (maxResult && maxResult.length > 0) {
        const lastNumber = maxResult[0].advance_number;
        const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
        sequence = lastSeq + 1;
      }
      
      const advance_number = `${prefix}${String(sequence).padStart(3, '0')}`;

      const adminId = await getAdminId(session.username);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO employee_advances (
          advance_number, employee_id, advance_amount, repayment_months,
          monthly_deduction, remaining_balance, paid_months,
          start_date, remarks, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          advance_number,
          employee_id,
          advance_amount,
          repayment_months,
          monthly_deduction,
          advance_amount, // Initial remaining balance
          0, // Initial paid months
          start_date,
          remarks || null,
          status,
          adminId
        ]
      );

      return res.status(201).json({ 
        message: 'Advance created successfully',
        id: result.insertId,
        advance_number,
        monthly_deduction
      });
    } catch (error) {
      console.error('Advance creation error:', error);
      return res.status(500).json({ error: 'Failed to create advance' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

