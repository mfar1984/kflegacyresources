import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

async function verifySessionFromDB(hash: string): Promise<boolean> {
  try {
    const rows = await query(
      'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    ) as { username: string; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      return expires > new Date();
    }
    return false;
  } catch (err) {
    console.error('Session verification error:', err);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const hash = req.query.hash || req.body?.hash;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const isValid = await verifySessionFromDB(hash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, message: 'Invalid role ID' });
  }

  const roleId = parseInt(id as string, 10);
  if (isNaN(roleId)) {
    return res.status(400).json({ success: false, message: 'Invalid role ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single role with permissions
      const roles = await query(
        'SELECT * FROM roles WHERE id = ? LIMIT 1',
        [roleId]
      ) as Array<{
        id: number;
        name: string;
        description: string | null;
        created_at: string;
        updated_at: string;
      }>;

      if (roles.length === 0) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }

      const permissions = await query(
        'SELECT permission_id FROM role_permissions WHERE role_id = ?',
        [roleId]
      ) as { permission_id: number }[];

      return res.status(200).json({ 
        success: true, 
        role: {
          ...roles[0],
          permissions: permissions.map(p => p.permission_id)
        }
      });
    }

    if (req.method === 'PUT') {
      // Update role
      const { name, description, permissions } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      await query(
        'UPDATE roles SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || null, roleId]
      );

      // Update permissions
      if (permissions && Array.isArray(permissions)) {
        await query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
        
        if (permissions.length > 0) {
          const values = permissions.map((permId: number) => `(${roleId}, ${permId})`).join(',');
          await query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Role updated successfully' 
      });
    }

    if (req.method === 'DELETE') {
      // Delete role
      await query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
      await query('DELETE FROM roles WHERE id = ?', [roleId]);

      return res.status(200).json({ 
        success: true, 
        message: 'Role deleted successfully' 
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Role API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
