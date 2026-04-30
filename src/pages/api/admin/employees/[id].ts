import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Employee ID is required' });
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

    // GET - Fetch single employee with documents
    if (req.method === 'GET') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_view')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      const [employees] = await connection.query<RowDataPacket[]>(
        `SELECT 
          e.*,
          d.name as department_name,
          d.code as department_code,
          a.username as created_by_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins a ON e.created_by = a.id
        WHERE e.id = ?`,
        [id]
      );

      if (employees.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Get employee documents
      const [documents] = await connection.query<RowDataPacket[]>(
        `SELECT 
          ed.*,
          a.username as uploaded_by_name
        FROM employee_documents ed
        LEFT JOIN admins a ON ed.uploaded_by = a.id
        WHERE ed.employee_id = ?
        ORDER BY ed.uploaded_at DESC`,
        [id]
      );

      return res.status(200).json({
        success: true,
        employee: employees[0],
        documents
      });
    }

    // PUT - Update employee
    if (req.method === 'PUT') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_edit')) {
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

      // Handle profile photo
      let profilePhotoPath = getField('existing_profile_photo');
      if (files.profile_photo && files.profile_photo.length > 0) {
        const file = files.profile_photo[0] as File;
        profilePhotoPath = `/uploads/employees/${path.basename(file.filepath)}`;
        
        // Delete old photo if exists
        const oldPhoto = getField('existing_profile_photo');
        if (oldPhoto) {
          try {
            await fs.unlink(path.join(process.cwd(), 'public', oldPhoto));
          } catch (err) {
            console.error('Error deleting old photo:', err);
          }
        }
      }

      await connection.query<ResultSetHeader>(
        `UPDATE employees SET
          full_name = ?, email = ?, phone = ?, ic_number = ?, date_of_birth = ?, gender = ?,
          nationality = ?, marital_status = ?, address = ?, postcode = ?, city = ?, state = ?, country = ?,
          emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relationship = ?,
          position = ?, department_id = ?, employment_type = ?, join_date = ?, confirmation_date = ?,
          resign_date = ?, basic_salary = ?, allowances = ?, bank_name = ?, bank_account_number = ?,
          epf_number = ?, socso_number = ?, tax_number = ?, status = ?, profile_photo = ?, notes = ?
        WHERE id = ?`,
        [
          getField('full_name'),
          getField('email'),
          getField('phone'),
          getField('ic_number'),
          getDateField('date_of_birth'),
          getField('gender'),
          getField('nationality'),
          getField('marital_status'),
          getField('address'),
          getField('postcode'),
          getField('city'),
          getField('state'),
          getField('country'),
          getField('emergency_contact_name'),
          getField('emergency_contact_phone'),
          getField('emergency_contact_relationship'),
          getField('position'),
          getField('department_id'),
          getField('employment_type'),
          getDateField('join_date'),
          getDateField('confirmation_date'),
          getDateField('resign_date'),
          getField('basic_salary'),
          getField('allowances'),
          getField('bank_name'),
          getField('bank_account_number'),
          getField('epf_number'),
          getField('socso_number'),
          getField('tax_number'),
          getField('status'),
          profilePhotoPath,
          getField('notes'),
          id
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully'
      });
    }

    // DELETE - Delete employee
    if (req.method === 'DELETE') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_delete')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      // Get employee details first
      const [employees] = await connection.query<RowDataPacket[]>(
        'SELECT profile_photo FROM employees WHERE id = ?',
        [id]
      );

      if (employees.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Delete profile photo if exists
      if (employees[0].profile_photo) {
        try {
          await fs.unlink(path.join(process.cwd(), 'public', employees[0].profile_photo));
        } catch (err) {
          console.error('Error deleting photo:', err);
        }
      }

      // Delete employee documents files
      const [documents] = await connection.query<RowDataPacket[]>(
        'SELECT file_path FROM employee_documents WHERE employee_id = ?',
        [id]
      );

      for (const doc of documents) {
        try {
          await fs.unlink(path.join(process.cwd(), 'public', doc.file_path));
        } catch (err) {
          console.error('Error deleting document:', err);
        }
      }

      // Delete from database (CASCADE will delete documents)
      await connection.query<ResultSetHeader>(
        'DELETE FROM employees WHERE id = ?',
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Employee API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  } finally {
    connection.release();
  }
}

