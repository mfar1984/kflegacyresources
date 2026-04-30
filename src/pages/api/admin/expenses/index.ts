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
    if (!hasPermission(userPermissions, 'expenses_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, status, category, year, month } = req.query;
      let query = `
        SELECT 
          ex.*,
          e.full_name as employee_name,
          e.employee_id as employee_number,
          d.name as department_name,
          ec.name as category_name,
          ec.color as category_color,
          ec.code as category_code,
          a.username as reviewed_by_name
        FROM expenses ex
        INNER JOIN employees e ON ex.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN expense_categories ec ON ex.category_id = ec.id
        LEFT JOIN admins a ON ex.reviewed_by = a.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (employee_id) { query += ' AND ex.employee_id = ?'; params.push(employee_id); }
      if (status) { query += ' AND ex.status = ?'; params.push(status); }
      if (category) { query += ' AND ex.category_id = ?'; params.push(category); }
      if (year) { query += ' AND YEAR(ex.expense_date) = ?'; params.push(year); }
      if (month) { query += ' AND MONTH(ex.expense_date) = ?'; params.push(month); }
      query += ' ORDER BY ex.applied_date DESC';
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Expenses fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'expenses_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { 
        employee_id, 
        category_id, 
        expense_date, 
        vendor_name, 
        invoice_number, 
        description, 
        tax_amount, 
        payment_method, 
        payment_reference, 
        remarks, 
        items 
      } = req.body;
      
      if (!employee_id || !category_id || !expense_date || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate expense number (format: EXP-YYYYMMDD-XXX)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = `EXP-${dateStr}-`;
      
      // Get the highest sequence number for today
      const [maxResult] = await pool.query<RowDataPacket[]>(
        `SELECT expense_number FROM expenses 
         WHERE expense_number LIKE ? 
         ORDER BY expense_number DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let sequence = 1;
      if (maxResult && maxResult.length > 0) {
        const lastNumber = maxResult[0].expense_number;
        const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
        sequence = lastSeq + 1;
      }
      
      const expense_number = `${prefix}${String(sequence).padStart(3, '0')}`;

      const total_amount = items.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO expenses 
         (expense_number, employee_id, category_id, expense_date, vendor_name, invoice_number, 
          total_amount, tax_amount, payment_method, payment_reference, description, remarks, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          expense_number, 
          employee_id, 
          category_id, 
          expense_date, 
          vendor_name || null, 
          invoice_number || null, 
          total_amount, 
          tax_amount || 0, 
          payment_method, 
          payment_reference || null, 
          description, 
          remarks || null
        ]
      );

      const expenseId = result.insertId;
      for (const item of items) {
        const quantity = parseFloat(item.quantity) || 1;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const totalPrice = item.amount || (quantity * unitPrice);
        
        await pool.query(
          `INSERT INTO expense_items (expense_id, item_date, description, quantity, unit_price, total_price, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            expenseId, 
            item.item_date, 
            item.description, 
            quantity, 
            unitPrice, 
            totalPrice, 
            item.remarks || null
          ]
        );
      }

      return res.status(201).json({ message: 'Expense created successfully', id: expenseId, expense_number });
    } catch (error) {
      console.error('Expense creation error:', error);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

