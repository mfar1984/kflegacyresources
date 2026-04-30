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
              // Get all roles with their permissions and user count
              const rolesRaw = await query(`
                SELECT id, name, description, created_at, updated_at
                FROM roles
                ORDER BY created_at DESC
              `) as Array<{
                id: number;
                name: string;
                description: string | null;
                created_at: string;
                updated_at: string;
              }>;

              // Get permissions and user count for each role
              const roles = await Promise.all(rolesRaw.map(async (role) => {
                const perms = await query(
                  'SELECT permission_id FROM role_permissions WHERE role_id = ?',
                  [role.id]
                ) as { permission_id: number }[];
                
                // Get user count for this role
                const userCountResult = await query(
                  'SELECT COUNT(DISTINCT admin_id) as user_count FROM admin_roles WHERE role_id = ?',
                  [role.id]
                ) as { user_count: number }[];
                
                return {
                  id: role.id,
                  name: role.name,
                  description: role.description || '',
                  permissions: perms.map(p => p.permission_id),
                  user_count: userCountResult[0]?.user_count || 0,
                  created_at: role.created_at,
                  updated_at: role.updated_at,
                };
              }));

              return res.status(200).json({ success: true, roles });
            }

    if (req.method === 'POST') {
      // Create new role
      const { name, description, permissions } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      const result = await query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [name, description || null]
      ) as { insertId: number };

      const roleId = result.insertId;

      // Insert permissions
      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const values = permissions.map(permId => `(${roleId}, ${permId})`).join(',');
        await query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`);
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Role created successfully',
        role_id: roleId 
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Roles API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

