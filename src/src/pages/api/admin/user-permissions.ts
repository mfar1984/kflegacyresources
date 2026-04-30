import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

async function verifySessionFromDB(hash: string): Promise<string | null> {
  try {
    const rows = await query(
      'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    ) as { username: string; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      if (expires > new Date()) {
        return rows[0].username;
      }
    }
    return null;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const hash = req.query.hash;
    if (!hash || typeof hash !== 'string') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const username = await verifySessionFromDB(hash);
    if (!username) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    // Get admin ID from username
    const admins = await query(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    ) as { id: number }[];

    if (!admins || admins.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const adminId = admins[0].id;

    // Get all permissions for this admin through their roles
    const permissions = await query(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]) as { module: string; action: string }[];

    // Get user's roles
    const userRoles = await query(`
      SELECT r.name, r.slug
      FROM roles r
      INNER JOIN admin_roles ar ON r.id = ar.role_id
      WHERE ar.admin_id = ?
    `, [adminId]) as { name: string; slug: string }[];

    // Format permissions as module_action (e.g., "users_view", "dashboard_view")
    const permissionNames = permissions.map(p => `${p.module}_${p.action}`);

    // Check if user is Staff (has Staff role and no admin roles)
    const isStaff = userRoles.some(r => r.slug === 'staff');
    const isAdmin = userRoles.some(r => r.slug === 'super-admin' || r.slug === 'administrator');
    const isHR = userRoles.some(r => r.slug === 'hr-admin');

    return res.status(200).json({ 
      success: true, 
      permissions: permissionNames,
      adminId: adminId,
      roles: userRoles,
      userRole: isStaff && !isAdmin && !isHR ? 'staff' : isHR ? 'hr' : 'admin'
    });
  } catch (error) {
    console.error('User permissions API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

