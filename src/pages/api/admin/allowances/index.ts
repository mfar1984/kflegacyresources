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
    if (!hasPermission(userPermissions, 'allowances_view')) {
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
          updater.username as updated_by_name
        FROM employee_allowances ea
        INNER JOIN employees e ON ea.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN admins creator ON ea.created_by = creator.id
        LEFT JOIN admins updater ON ea.updated_by = updater.id
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
      
      const [allowances] = await pool.query<RowDataPacket[]>(query, params);
      
      return res.status(200).json(allowances);
    } catch (error) {
      console.error('Allowances fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch allowances' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'allowances_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const {
        employee_id,
        housing_allowance = 0,
        transport_allowance = 0,
        meal_allowance = 0,
        other_allowances = 0,
        effective_date,
        remarks,
        status = 'active'
      } = req.body;

      if (!employee_id || !effective_date) {
        return res.status(400).json({ error: 'Employee ID and effective date are required' });
      }

      // Check if employee already has an active allowance setup
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM employee_allowances WHERE employee_id = ? AND status = "active"',
        [employee_id]
      );

      if (existing && existing.length > 0) {
        return res.status(400).json({ 
          error: 'Employee already has an active allowance setup. Please update the existing one or set it to inactive first.' 
        });
      }

      const adminId = await getAdminId(session.username);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO employee_allowances (
          employee_id, housing_allowance, transport_allowance, meal_allowance,
          other_allowances, effective_date, remarks, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          housing_allowance,
          transport_allowance,
          meal_allowance,
          other_allowances,
          effective_date,
          remarks || null,
          status,
          adminId
        ]
      );

      return res.status(201).json({ 
        message: 'Allowance setup created successfully',
        id: result.insertId
      });
    } catch (error) {
      console.error('Allowance creation error:', error);
      return res.status(500).json({ error: 'Failed to create allowance setup' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

