import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

// Helper function to get user permissions
async function getUserPermissions(username: string): Promise<string[]> {
  try {
    const permissionsResult = await query(`
      SELECT DISTINCT p.name
      FROM admin_sessions AS ses
      INNER JOIN admins AS a ON ses.username = a.username
      INNER JOIN admin_roles AS ar ON a.id = ar.admin_id
      INNER JOIN role_permissions AS rp ON ar.role_id = rp.role_id
      INNER JOIN permissions AS p ON rp.permission_id = p.id
      WHERE ses.username = ?
    `, [username]) as Array<{ name: string }>;
    return permissionsResult.map((row) => row.name);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Session hash is required' });
  }

  try {
    // Verify session
    const sessionResult = await query('SELECT username FROM admin_sessions WHERE hash = ?', [hash]) as Array<{ username: string }>;
    if (sessionResult.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const username = sessionResult[0].username;
    const permissions = await getUserPermissions(username);

    if (req.method === 'GET') {
      // Check permission
      if (!permissions.includes('leave_types_view')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const leaveTypes = await query('SELECT * FROM leave_types ORDER BY code ASC') as Array<any>;
      return res.status(200).json({ leaveTypes });
    }

    if (req.method === 'POST') {
      // Check permission
      if (!permissions.includes('leave_types_create')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { code, name, description, days_per_year, requires_document, document_label, is_paid, requires_approval, allow_half_days, carry_forward, color, status } = req.body;

      if (!code || !name) {
        return res.status(400).json({ error: 'Code and name are required' });
      }

      await query(
        `INSERT INTO leave_types 
        (code, name, description, days_per_year, requires_document, document_label, is_paid, requires_approval, allow_half_days, color, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code, 
          name, 
          description || null, 
          days_per_year || 0, 
          requires_document ? 1 : 0,
          requires_document ? (document_label || null) : null,
          is_paid ? 1 : 0,
          requires_approval ? 1 : 0,
          allow_half_days ? 1 : 0,
          color || '#3b82f6', 
          status || 'active'
        ]
      );

      return res.status(201).json({ message: 'Leave type created successfully' });
    }

    if (req.method === 'PUT') {
      // Check permission
      if (!permissions.includes('leave_types_edit')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { id, code, name, description, days_per_year, requires_document, document_label, is_paid, requires_approval, allow_half_days, carry_forward, color, status } = req.body;

      if (!id || !code || !name) {
        return res.status(400).json({ error: 'ID, code, and name are required' });
      }

      await query(
        `UPDATE leave_types 
        SET code = ?, name = ?, description = ?, days_per_year = ?, 
            requires_document = ?, document_label = ?, 
            is_paid = ?, requires_approval = ?, allow_half_days = ?, color = ?, status = ? 
        WHERE id = ?`,
        [
          code, 
          name, 
          description || null, 
          days_per_year || 0,
          requires_document ? 1 : 0,
          requires_document ? (document_label || null) : null,
          is_paid ? 1 : 0,
          requires_approval ? 1 : 0,
          allow_half_days ? 1 : 0,
          color, 
          status, 
          id
        ]
      );

      return res.status(200).json({ message: 'Leave type updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Check permission
      if (!permissions.includes('leave_types_delete')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      await query('DELETE FROM leave_types WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Leave type deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Leave types API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
