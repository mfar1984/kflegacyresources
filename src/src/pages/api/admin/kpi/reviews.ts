import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

async function getUserId(username: string): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  return rows && rows.length ? Number(rows[0].id) : null;
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
  const { hash } = req.query as { hash?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { assignment_id, decision, score, remarks, reviewer_role, phase } = req.body as { assignment_id?: number; decision?: 'approve' | 'reject'; score?: number; remarks?: string; reviewer_role?: 'PPP' | 'PPK' | 'HR'; phase?: 'mid' | 'final' };
  if (!assignment_id || !decision) return res.status(422).json({ error: 'assignment_id and decision required' });

  if (decision === 'approve' && !hasPermission(userPermissions, 'kpi_reviews_approve')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (decision === 'reject' && !hasPermission(userPermissions, 'kpi_reviews_reject')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const reviewerId = await getUserId(session.username);
    if (!reviewerId) return res.status(401).json({ error: 'Unauthorized' });
    // Insert review record
    await pool.query<ResultSetHeader>(
      `INSERT INTO kpi_reviews (assignment_id, reviewer_admin_id, reviewer_role, phase, score, remarks, decision)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [assignment_id, reviewerId, reviewer_role || 'PPP', phase || 'final', typeof score === 'number' ? score : 0, remarks || null, decision]
    );
    // Update assignment status
    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    await pool.query<ResultSetHeader>(
      `UPDATE kpi_assignments SET status = ?, approved_at = CASE WHEN ? = 'approved' THEN NOW() ELSE approved_at END WHERE id = ?`,
      [newStatus, newStatus, assignment_id]
    );

    return res.status(200).json({ reviewed: true });
  } catch (error) {
    console.error('KPI review error:', error);
    return res.status(500).json({ error: 'Failed to review KPI' });
  }
}


