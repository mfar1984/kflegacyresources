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
    if (!hasPermission(userPermissions, 'loans_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, status } = req.query;
      
      let query = `
        SELECT 
          el.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.position as employee_position,
          d.name as department_name,
          creator.username as created_by_name,
          approver.username as approved_by_name
        FROM employee_loans el
        INNER JOIN employees e ON el.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins creator ON el.created_by = creator.id
        LEFT JOIN admins approver ON el.approved_by = approver.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (employee_id) {
        query += ' AND el.employee_id = ?';
        params.push(employee_id);
      }
      
      if (status) {
        query += ' AND el.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY el.created_at DESC';
      
      const [loans] = await pool.query<RowDataPacket[]>(query, params);
      
      return res.status(200).json(loans);
    } catch (error) {
      console.error('Loans fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch loans' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'loans_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        employee_id,
        loan_amount,
        total_installments,
        start_date,
        remarks,
        status = 'pending'
      } = req.body;

      if (!employee_id || !loan_amount || !total_installments || !start_date) {
        return res.status(400).json({ error: 'Employee ID, loan amount, total installments, and start date are required' });
      }

      // Calculate monthly installment
      const monthly_installment = parseFloat(loan_amount) / parseInt(total_installments);

      // Generate unique loan number
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = `LON-${dateStr}-`;
      
      const [maxResult] = await pool.query<RowDataPacket[]>(
        `SELECT loan_number FROM employee_loans 
         WHERE loan_number LIKE ? 
         ORDER BY loan_number DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let sequence = 1;
      if (maxResult && maxResult.length > 0) {
        const lastNumber = maxResult[0].loan_number;
        const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
        sequence = lastSeq + 1;
      }
      
      const loan_number = `${prefix}${String(sequence).padStart(3, '0')}`;

      const adminId = await getAdminId(session.username);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO employee_loans (
          loan_number, employee_id, loan_amount, monthly_installment,
          remaining_balance, total_installments, paid_installments,
          start_date, remarks, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          loan_number,
          employee_id,
          loan_amount,
          monthly_installment,
          loan_amount, // Initial remaining balance
          total_installments,
          0, // Initial paid installments
          start_date,
          remarks || null,
          status,
          adminId
        ]
      );

      return res.status(201).json({ 
        message: 'Loan created successfully',
        id: result.insertId,
        loan_number,
        monthly_installment
      });
    } catch (error) {
      console.error('Loan creation error:', error);
      return res.status(500).json({ error: 'Failed to create loan' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

