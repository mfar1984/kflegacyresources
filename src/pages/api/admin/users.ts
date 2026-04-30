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
  try {
    const hash = req.query.hash || req.body?.hash;
    if (!hash || typeof hash !== 'string') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isValid = await verifySessionFromDB(hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    if (req.method === 'GET') {
      // Get all users with their roles
      const usersRaw = await query(`
        SELECT id, username, status, created_at
        FROM admins
        ORDER BY created_at DESC
      `) as Array<{
        id: number;
        username: string;
        status: 'active' | 'suspended';
        created_at: string;
      }>;

      // Get roles for each user
      const users = await Promise.all(usersRaw.map(async (user) => {
        const roleIds = await query(
          'SELECT role_id FROM admin_roles WHERE admin_id = ?',
          [user.id]
        ) as { role_id: number }[];
        
        return {
          id: user.id,
          username: user.username,
          status: user.status,
          created_at: user.created_at,
          roles: roleIds.map(r => r.role_id),
        };
      }));

      return res.status(200).json({ success: true, users });
    }

    if (req.method === 'POST') {
      // Create new user
      const { username, password, roles } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }

      // Hash password with bcrypt
      const passwordHash = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [username.trim().toLowerCase(), passwordHash]
      ) as { insertId: number };

      const userId = result.insertId;

      // Insert roles
      if (roles && Array.isArray(roles) && roles.length > 0) {
        const values = roles.map(roleId => `(${userId}, ${roleId})`).join(',');
        await query(`INSERT INTO admin_roles (admin_id, role_id) VALUES ${values}`);
      }

      return res.status(201).json({ 
        success: true, 
        message: 'User created successfully',
        user_id: userId 
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

