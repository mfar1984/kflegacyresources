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

    // POST - Upload document
    if (req.method === 'POST') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_document_upload')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      const form = formidable({
        uploadDir: path.join(process.cwd(), 'public', 'uploads', 'employees', 'documents'),
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        filename: (name, ext) => {
          return `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        },
      });

      // Ensure upload directory exists
      await fs.mkdir(path.join(process.cwd(), 'public', 'uploads', 'employees', 'documents'), { recursive: true });

      const [fields, files] = await form.parse(req);

      const getField = (name: string) => {
        const value = fields[name];
        return value ? (Array.isArray(value) ? value[0] : value) : null;
      };

      if (!files.document || files.document.length === 0) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = files.document[0] as File;
      const filePath = `/uploads/employees/documents/${path.basename(file.filepath)}`;
      const fileSize = file.size;
      const documentType = getField('document_type');
      const documentName = getField('document_name') || file.originalFilename || 'Untitled';

      await connection.query<ResultSetHeader>(
        `INSERT INTO employee_documents (employee_id, document_type, document_name, file_path, file_size, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, documentType, documentName, filePath, fileSize, session.adminId]
      );

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully'
      });
    }

    // DELETE - Delete document
    if (req.method === 'DELETE') {
      // Check permission
      if (!hasPermission(userPermissions, 'employees_document_delete')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      const { documentId } = req.query;

      if (!documentId || typeof documentId !== 'string') {
        return res.status(400).json({ message: 'Document ID is required' });
      }

      // Get document details
      const [documents] = await connection.query<RowDataPacket[]>(
        'SELECT file_path FROM employee_documents WHERE id = ? AND employee_id = ?',
        [documentId, id]
      );

      if (documents.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Delete file
      try {
        await fs.unlink(path.join(process.cwd(), 'public', documents[0].file_path));
      } catch (err) {
        console.error('Error deleting file:', err);
      }

      // Delete from database
      await connection.query<ResultSetHeader>(
        'DELETE FROM employee_documents WHERE id = ? AND employee_id = ?',
        [documentId, id]
      );

      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Employee documents API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  } finally {
    connection.release();
  }
}

