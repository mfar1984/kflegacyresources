import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const { hash } = req.query;

  // Verify session
  const session = await verifySession(hash as string);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user permissions
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    // Check permission
    if (!hasPermission(userPermissions, 'leave_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, status, leave_type, year } = req.query;

      let query = `
        SELECT 
          la.*,
          e.full_name as employee_name,
          e.employee_id as employee_number,
          d.name as department_name,
          lt.name as leave_type_name,
          lt.color as leave_type_color,
          lt.code as leave_type_code,
          a.username as reviewed_by_name
        FROM leave_applications la
        INNER JOIN employees e ON la.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN leave_types lt ON la.leave_type_id = lt.id
        LEFT JOIN admins a ON la.reviewed_by = a.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (employee_id) {
        query += ' AND la.employee_id = ?';
        params.push(employee_id);
      }

      if (status) {
        query += ' AND la.status = ?';
        params.push(status);
      }

      if (leave_type) {
        query += ' AND la.leave_type_id = ?';
        params.push(leave_type);
      }

      if (year) {
        query += ' AND YEAR(la.start_date) = ?';
        params.push(year);
      }

      query += ' ORDER BY la.applied_date DESC';

      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Leave applications fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch leave applications' });
    }
  }

  if (req.method === 'POST') {
    // Check permission
    if (!hasPermission(userPermissions, 'leave_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Parse form data
      const form = formidable({ 
        maxFileSize: 5 * 1024 * 1024, // 5MB
        uploadDir: path.join(process.cwd(), 'public/uploads/leave_documents'),
        keepExtensions: true,
        filename: (name, ext) => {
          return Date.now() + '-' + Math.random().toString(36).substring(7) + ext;
        }
      });

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'public/uploads/leave_documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const [fields, files] = await form.parse(req);
      
      const employee_id = fields.employee_id?.[0];
      const leave_type_id = fields.leave_type_id?.[0];
      const start_date = fields.start_date?.[0];
      const end_date = fields.end_date?.[0];
      const total_days = fields.total_days?.[0];
      const reason = fields.reason?.[0];
      const remarks = fields.remarks?.[0];
      const documentFile = files.document?.[0];

      // Validate required fields
      if (!employee_id || !leave_type_id || !start_date || !end_date || !total_days || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate application number (format: LA-YYYYMMDD-XXX)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = `LA-${dateStr}-`;
      
      // Get the highest sequence number for today
      const [maxResult] = await pool.query<RowDataPacket[]>(
        `SELECT application_number FROM leave_applications 
         WHERE application_number LIKE ? 
         ORDER BY application_number DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let sequence = 1;
      if (maxResult && maxResult.length > 0) {
        const lastNumber = maxResult[0].application_number;
        const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
        sequence = lastSeq + 1;
      }
      
      const application_number = `${prefix}${String(sequence).padStart(3, '0')}`;

      // Check if employee has sufficient balance
      const [balanceRows] = await pool.query<RowDataPacket[]>(
        `SELECT remaining_days FROM leave_balances 
         WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(?)`,
        [employee_id, leave_type_id, start_date]
      );

      if (balanceRows.length > 0 && balanceRows[0].remaining_days < total_days) {
        return res.status(400).json({ 
          error: 'Insufficient leave balance',
          remaining: balanceRows[0].remaining_days
        });
      }

      // Handle document upload
      let documentPath = null;
      if (documentFile) {
        documentPath = `/uploads/leave_documents/${path.basename(documentFile.filepath)}`;
      }

      // Insert leave application
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO leave_applications 
         (application_number, employee_id, leave_type_id, start_date, end_date, total_days, reason, remarks, document_path, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [application_number, employee_id, leave_type_id, start_date, end_date, total_days, reason, remarks || null, documentPath]
      );

      // Update pending_days in leave_balances (remaining_days is auto-calculated)
      const year = new Date(start_date).getFullYear();
      await pool.query<ResultSetHeader>(
        `UPDATE leave_balances 
         SET pending_days = pending_days + ?
         WHERE employee_id = ? 
           AND leave_type_id = ? 
           AND year = ?`,
        [total_days, employee_id, leave_type_id, year]
      );

      return res.status(201).json({
        message: 'Leave application created successfully',
        id: result.insertId,
        application_number
      });
    } catch (error) {
      console.error('Leave application creation error:', error);
      return res.status(500).json({ error: 'Failed to create leave application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

