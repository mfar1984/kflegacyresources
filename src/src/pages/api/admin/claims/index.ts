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
    if (!hasPermission(userPermissions, 'claims_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, status, claim_type, year } = req.query;
      let query = `
        SELECT 
          c.*,
          e.full_name as employee_name,
          e.employee_id as employee_number,
          d.name as department_name,
          ct.name as claim_type_name,
          ct.color as claim_type_color,
          ct.code as claim_type_code,
          a.username as reviewed_by_name,
          (SELECT COUNT(*) FROM claim_items WHERE claim_id = c.id) as items_count
        FROM claims c
        INNER JOIN employees e ON c.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN claim_types ct ON c.claim_type_id = ct.id
        LEFT JOIN admins a ON c.reviewed_by = a.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (employee_id) { query += ' AND c.employee_id = ?'; params.push(employee_id); }
      if (status) { query += ' AND c.status = ?'; params.push(status); }
      if (claim_type) { query += ' AND c.claim_type_id = ?'; params.push(claim_type); }
      if (year) { query += ' AND YEAR(c.claim_date) = ?'; params.push(year); }
      query += ' ORDER BY c.applied_date DESC';
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Claims fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'claims_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { employee_id, claim_type_id, claim_date, description, remarks, items } = req.body;
      if (!employee_id || !claim_type_id || !claim_date || !description || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const date = new Date();
      const yearMonth = date.toISOString().slice(0, 10).replace(/-/g, '');
      const [countResult] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM claims WHERE DATE(applied_date) = CURDATE()'
      );
      const sequence = String((countResult[0]?.count || 0) + 1).padStart(3, '0');
      const claim_number = `CLM-${yearMonth}-${sequence}`;

      const total_amount = items.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO claims 
         (claim_number, employee_id, claim_type_id, claim_date, total_amount, description, remarks, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [claim_number, employee_id, claim_type_id, claim_date, total_amount, description, remarks || null]
      );

      const claimId = result.insertId;
      for (const item of items) {
        await pool.query(
          `INSERT INTO claim_items (claim_id, item_date, description, category, amount, remarks)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [claimId, item.item_date, item.description, item.category || null, item.amount, item.remarks || null]
        );
      }

      return res.status(201).json({ message: 'Claim created successfully', id: claimId, claim_number });
    } catch (error) {
      console.error('Claim creation error:', error);
      return res.status(500).json({ error: 'Failed to create claim' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

