import { query } from '@/lib/db';

/**
 * Get admin context (username, id, permissions) from session hash
 * Used for permission checking in API routes
 */
export async function getAdminContextFromHash(hash: string): Promise<{
  adminId: number;
  username: string;
  permissionNames: string[];
} | null> {
  if (!hash) return null;

  // 1) Verify session via admin_sessions.hash
  const sessions = await query(
    `SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1`,
    [hash]
  ) as { username: string; expires_at: string }[];

  if (!sessions || sessions.length === 0) return null;
  const { username, expires_at } = sessions[0];
  if (new Date(expires_at) <= new Date()) return null;

  // 2) Get admin id from admins table
  const admins = await query(
    `SELECT id FROM admins WHERE username = ? LIMIT 1`,
    [username]
  ) as { id: number }[];
  if (!admins || admins.length === 0) return null;
  const adminId = admins[0].id;

  // 3) Build permission names from roles → permissions
  const permissions = await query(`
    SELECT DISTINCT p.module, p.action
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
    WHERE ar.admin_id = ?
    ORDER BY p.module, p.action
  `, [adminId]) as { module: string; action: string }[];
  
  const permissionNames = permissions.map(p => `${p.module}_${p.action}`);

  return { adminId, username, permissionNames };
}

