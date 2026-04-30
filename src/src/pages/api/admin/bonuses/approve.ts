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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (!hasPermission(userPermissions, 'bonuses_approve')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { id, action, remarks } = req.body;

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Bonus ID and valid action (approve/reject) are required' });
    }

    // Get bonus details
    const [bonuses] = await pool.query<RowDataPacket[]>(
      'SELECT id, status FROM employee_bonuses WHERE id = ?',
      [id]
    );

    if (!bonuses || bonuses.length === 0) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    const bonus = bonuses[0];

    if (bonus.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bonuses can be approved/rejected' });
    }

    const adminId = await getAdminId(session.username);
    const newStatus = action === 'approve' ? 'approved' : 'cancelled';

    // Update bonus status
    await pool.query<ResultSetHeader>(
      `UPDATE employee_bonuses SET
        status = ?,
        approved_by = ?,
        remarks = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [newStatus, adminId, remarks || null, id]
    );

    return res.status(200).json({ 
      message: `Bonus ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Bonus approval error:', error);
    return res.status(500).json({ error: 'Failed to process bonus approval' });
  }
}

