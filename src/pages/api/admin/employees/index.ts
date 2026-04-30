import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { hasPermission } from '@/lib/permissions';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function verifySession(hash: string): Promise<{ valid: boolean; adminId?: number }> {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
        [hash]
      );

      if (rows.length === 0) {
        return { valid: false };
      }

      const expires = new Date(rows[0].expires_at);
      if (expires <= new Date()) {
        return { valid: false };
      }

      // Get admin ID
      const [adminRows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM admins WHERE username = ? LIMIT 1',
        [rows[0].username]
      );

      return { 
        valid: true, 
        adminId: adminRows.length > 0 ? adminRows[0].id : undefined 
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return { valid: false };
  }
}

async function getUserPermissions(username: string): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    // Get admin ID from username
    const [admins] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    if (!admins || admins.length === 0) {
      return [];
    }

    const adminId = admins[0].id;

    // Get all permissions for this admin through their roles
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]);

    // Format permissions as module_action
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

// Generate unique employee ID
async function generateEmployeeId(departmentCode: string): Promise<string> {
  const connection = await pool.getConnection();
  try {
    const year = new Date().getFullYear();
    
    // Get the last employee ID for this department and year
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT employee_id FROM employees 
       WHERE employee_id LIKE ? 
       ORDER BY employee_id DESC LIMIT 1`,
      [`ANSR-${year}-${departmentCode}-%`]
    );

    let sequence = 1;
    if (rows.length > 0) {
      const lastId = rows[0].employee_id;
      const lastSeq = parseInt(lastId.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `ANSR-${year}-${departmentCode}-${sequence.toString().padStart(3, '0')}`;
  } finally {
    connection.release();
  }
}

// Generate QR Code data (can be enhanced with actual QR image generation)
function generateQRCode(employeeId: string): string {
  const hash = crypto.createHash('sha256').update(employeeId + Date.now()).digest('hex');
  return hash.substring(0, 32);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await verifySession(hash);
  if (!session.valid) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  const connection = await pool.getConnection();

  try {
    // Get username from session for permission check
    const [sessionRows] = await connection.query<RowDataPacket[]>(
      'SELECT username FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    );
    
    const username = sessionRows.length > 0 ? sessionRows[0].username : '';
    const userPermissions = await getUserPermissions(username);

    // GET - Fetch all employees
    if (req.method === 'GET') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_view')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      const [employees] = await connection.query<RowDataPacket[]>(`
        SELECT 
          e.*,
          d.name as department_name,
          d.code as department_code,
          a.username as created_by_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins a ON e.created_by = a.id
        ORDER BY e.created_at DESC
      `);

      return res.status(200).json({ success: true, employees });
    }

    // POST - Create new employee
    if (req.method === 'POST') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_create')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      const form = formidable({
        uploadDir: path.join(process.cwd(), 'public', 'uploads', 'employees'),
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        filename: (name, ext) => {
          return `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        },
      });

      // Ensure upload directory exists
      await fs.mkdir(path.join(process.cwd(), 'public', 'uploads', 'employees'), { recursive: true });

      const [fields, files] = await form.parse(req);

      const getField = (name: string) => {
        const value = fields[name];
        return value ? (Array.isArray(value) ? value[0] : value) : null;
      };

      // Helper for date fields - convert empty string to null
      const getDateField = (name: string) => {
        const value = getField(name);
        return (value && value !== '') ? value : null;
      };

      // Get department code for employee ID generation
      const departmentId = getField('department_id');
      const [deptRows] = await connection.query<RowDataPacket[]>(
        'SELECT code FROM departments WHERE id = ?',
        [departmentId]
      );

      if (deptRows.length === 0) {
        return res.status(400).json({ message: 'Invalid department' });
      }

      const departmentCode = deptRows[0].code;
      const employeeId = await generateEmployeeId(departmentCode);
      const qrCode = generateQRCode(employeeId);

      // Handle profile photo
      let profilePhotoPath = null;
      if (files.profile_photo && files.profile_photo.length > 0) {
        const file = files.profile_photo[0] as File;
        profilePhotoPath = `/uploads/employees/${path.basename(file.filepath)}`;
      }

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO employees (
          employee_id, full_name, email, phone, ic_number, date_of_birth, gender,
          nationality, marital_status, address, postcode, city, state, country,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
          position, department_id, employment_type, join_date, confirmation_date,
          basic_salary, allowances, bank_name, bank_account_number,
          epf_number, socso_number, tax_number, status, profile_photo, qr_code,
          notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          getField('full_name'),
          getField('email'),
          getField('phone'),
          getField('ic_number'),
          getDateField('date_of_birth'),
          getField('gender'),
          getField('nationality') || 'Malaysian',
          getField('marital_status') || 'single',
          getField('address'),
          getField('postcode'),
          getField('city'),
          getField('state'),
          getField('country') || 'Malaysia',
          getField('emergency_contact_name'),
          getField('emergency_contact_phone'),
          getField('emergency_contact_relationship'),
          getField('position'),
          departmentId,
          getField('employment_type'),
          getDateField('join_date'),
          getDateField('confirmation_date'),
          getField('basic_salary'),
          getField('allowances') || 0,
          getField('bank_name'),
          getField('bank_account_number'),
          getField('epf_number'),
          getField('socso_number'),
          getField('tax_number'),
          getField('status') || 'active',
          profilePhotoPath,
          qrCode,
          getField('notes'),
          session.adminId
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        employeeId: result.insertId,
        employee_id: employeeId,
        qr_code: qrCode
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Employees API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  } finally {
    connection.release();
  }
}

