import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  const userId = parseInt(id as string, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single user with roles
      const users = await query(
        'SELECT id, username, created_at FROM admins WHERE id = ? LIMIT 1',
        [userId]
      ) as Array<{
        id: number;
        username: string;
        created_at: string;
      }>;

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const roleIds = await query(
        'SELECT role_id FROM admin_roles WHERE admin_id = ?',
        [userId]
      ) as { role_id: number }[];

      return res.status(200).json({ 
        success: true, 
        user: {
          ...users[0],
          roles: roleIds.map(r => r.role_id)
        }
      });
    }

    if (req.method === 'PUT') {
      // Update user
      const { username, password, roles } = req.body;

      if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
      }

      // Update password only if provided
      if (password && password.trim()) {
        const passwordHash = await bcrypt.hash(password, 10);

        await query(
          'UPDATE admins SET password_hash = ? WHERE id = ?',
          [passwordHash, userId]
        );
      }

      // Update roles
      if (roles && Array.isArray(roles)) {
        await query('DELETE FROM admin_roles WHERE admin_id = ?', [userId]);
        
        if (roles.length > 0) {
          const values = roles.map((roleId: number) => `(${userId}, ${roleId})`).join(',');
          await query(`INSERT INTO admin_roles (admin_id, role_id) VALUES ${values}`);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'User updated successfully' 
      });
    }

    if (req.method === 'DELETE') {
      // Delete user
      await query('DELETE FROM admin_roles WHERE admin_id = ?', [userId]);
      await query('DELETE FROM admin_sessions WHERE username = (SELECT username FROM admins WHERE id = ? LIMIT 1)', [userId]);
      await query('DELETE FROM admins WHERE id = ?', [userId]);

      return res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

