import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?', [hash]
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
      'SELECT id FROM admins WHERE username = ? LIMIT 1', [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'claims_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT c.*, e.full_name as employee_name, e.employee_id as employee_number,
          d.name as department_name, ct.name as claim_type_name, ct.color as claim_type_color,
          a.username as reviewed_by_name
        FROM claims c
        INNER JOIN employees e ON c.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN claim_types ct ON c.claim_type_id = ct.id
        LEFT JOIN admins a ON c.reviewed_by = a.id
        WHERE c.id = ?`, [id]
      );
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Claim not found' });
      }
      
      const [items] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM claim_items WHERE claim_id = ? ORDER BY item_date', [id]
      );
      
      return res.status(200).json({ ...rows[0], items });
    } catch (error) {
      console.error('Claim fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch claim' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'claims_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT status FROM claims WHERE id = ?', [id]
      );
      if (!existingRows || existingRows.length === 0) {
        return res.status(404).json({ error: 'Claim not found' });
      }
      if (existingRows[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending claims can be deleted' });
      }
      await pool.query<ResultSetHeader>('DELETE FROM claims WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Claim deleted successfully' });
    } catch (error) {
      console.error('Claim deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete claim' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

