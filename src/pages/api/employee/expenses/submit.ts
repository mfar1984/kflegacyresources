import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ?', [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  if (new Date(sessions[0].expires_at) < new Date()) return null;
  if (sessions[0].user_type !== 'employee') return null;
  return sessions[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const session = await verifySession(req.query.hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const connection = await pool.getConnection();
  
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'expenses');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const form = formidable({ uploadDir, keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);
    
    const employee_id = fields.employee_id?.[0];
    const category_id = fields.category_id?.[0];
    const expense_date = fields.expense_date?.[0];
    const vendor_name = fields.vendor_name?.[0] || '';
    const invoice_number = fields.invoice_number?.[0] || '';
    const description = fields.description?.[0];
    const tax_amount = fields.tax_amount?.[0] || '0.00';
    const payment_method = fields.payment_method?.[0] || 'bank_transfer';
    const payment_reference = fields.payment_reference?.[0] || '';
    const remarks = fields.remarks?.[0] || '';
    const itemsStr = fields.items?.[0];
    const receiptFile = Array.isArray(files.receipt) ? files.receipt[0] : files.receipt;
    
    if (session.employee_id !== parseInt(employee_id!)) return res.status(403).json({ error: 'Forbidden' });
    if (!category_id || !expense_date || !description || !itemsStr || !receiptFile) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }
    
    const items = JSON.parse(itemsStr);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one expense item is required' });
    }
    
    // Calculate total
    const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
    const total_amount = itemsTotal + parseFloat(tax_amount);
    
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [lastExp] = await connection.query<RowDataPacket[]>(
      `SELECT expense_number FROM expenses WHERE expense_number LIKE ? ORDER BY expense_number DESC LIMIT 1`,
      [`EXP-${dateStr}%`]
    );
    
    let sequence = 1;
    if (lastExp && lastExp.length > 0) {
      sequence = parseInt(lastExp[0].expense_number.split('-')[2]) + 1;
    }
    const expense_number = `EXP-${dateStr}-${sequence.toString().padStart(3, '0')}`;
    
    const fileName = `${Date.now()}-${receiptFile.originalFilename}`;
    const newPath = path.join(uploadDir, fileName);
    fs.renameSync(receiptFile.filepath, newPath);
    const receipt_url = `/uploads/expenses/${fileName}`;
    
    await connection.beginTransaction();
    
    // Insert main expense
    const [expenseResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO expenses (
        employee_id, category_id, expense_number, expense_date, 
        vendor_name, invoice_number, description, total_amount, tax_amount,
        payment_method, payment_reference, remarks, receipt_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        employee_id, category_id, expense_number, expense_date,
        vendor_name, invoice_number, description, total_amount, tax_amount,
        payment_method, payment_reference, remarks, receipt_url
      ]
    );
    
    const expense_id = expenseResult.insertId;
    
    // Insert expense items
    for (const item of items) {
      await connection.query<ResultSetHeader>(
        `INSERT INTO expense_items (
          expense_id, item_date, description, quantity, unit_price, total_price, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          expense_id,
          item.item_date,
          item.description,
          item.quantity,
          item.unit_price,
          item.total_price,
          item.remarks || ''
        ]
      );
    }
    
    await connection.commit();
    
    return res.status(200).json({ message: 'Expense submitted successfully', expense_number });
  } catch (error) {
    await connection.rollback();
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to submit expense' });
  } finally {
    connection.release();
  }
}
