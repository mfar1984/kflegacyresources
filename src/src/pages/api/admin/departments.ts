import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string): Promise<{ valid: boolean; username?: string }> {
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

      return { valid: true, username: rows[0].username };
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

    // Format permissions as module_action (e.g., "users_view", "departments_view")
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await verifySession(hash);
  if (!session.valid || !session.username) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Get user permissions
  const userPermissions = await getUserPermissions(session.username);

  const connection = await pool.getConnection();

  try {
    // GET - Fetch all departments
    if (req.method === 'GET') {
      // Check permission
      if (!hasPermission(userPermissions, 'departments_view')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      const [departments] = await connection.query<RowDataPacket[]>(`
        SELECT 
          d.*,
          e.full_name as manager_name,
          (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.manager_id = e.id
        ORDER BY d.name ASC
      `);

      return res.status(200).json({ success: true, departments });
    }

    // POST - Create new department
    if (req.method === 'POST') {
      // Check permission
      if (!hasPermission(userPermissions, 'departments_create')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      const { code, name, description, status } = req.body;

      if (!code || !name) {
        return res.status(400).json({ message: 'Code and name are required' });
      }

      await connection.query<ResultSetHeader>(
        'INSERT INTO departments (code, name, description, status) VALUES (?, ?, ?, ?)',
        [code.toUpperCase(), name, description || null, status || 'active']
      );

      return res.status(201).json({
        success: true,
        message: 'Department created successfully'
      });
    }

    // PUT - Update department
    if (req.method === 'PUT') {
      // Check permission
      if (!hasPermission(userPermissions, 'departments_edit')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      const { id, code, name, description, manager_id, status } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Department ID is required' });
      }

      await connection.query<ResultSetHeader>(
        `UPDATE departments SET 
          code = ?, name = ?, description = ?, manager_id = ?, status = ?
        WHERE id = ?`,
        [code.toUpperCase(), name, description || null, manager_id || null, status, id]
      );

      return res.status(200).json({
        success: true,
        message: 'Department updated successfully'
      });
    }

    // DELETE - Delete department
    if (req.method === 'DELETE') {
      // Check permission
      if (!hasPermission(userPermissions, 'departments_delete')) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Department ID is required' });
      }

      // Check if department has employees
      const [employees] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
        [id]
      );

      if (employees[0].count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete department with existing employees. Please reassign employees first.' 
        });
      }

      await connection.query<ResultSetHeader>(
        'DELETE FROM departments WHERE id = ?',
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Department deleted successfully'
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Departments API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  } finally {
    connection.release();
  }
}

