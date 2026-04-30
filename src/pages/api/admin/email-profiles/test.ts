/**
 * API: Test Email Profile Connection
 * POST: Test SMTP connection for a specific email profile
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { testEmailProfile } from '@/lib/email-profiles';

// Helper: Verify admin session and get permissions
async function verifyAdminSession(hash: string) {
  if (!hash) {
    return { valid: false, username: null, adminId: null };
  }

  try {
    const sessions: any = await query(
      `SELECT username FROM admin_sessions WHERE hash = ? LIMIT 1`,
      [hash]
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { valid: false, username: null, adminId: null };
    }

    const { username } = sessions[0];

    const admins: any = await query(
      `SELECT id FROM admins WHERE username = ? LIMIT 1`,
      [username]
    );

    if (!Array.isArray(admins) || admins.length === 0) {
      return { valid: false, username, adminId: null };
    }

    return { valid: true, username, adminId: admins[0].id };
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return { valid: false, username: null, adminId: null };
  }
}

async function getUserPermissions(adminId: number) {
  try {
    const permissions: any = await query(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN admin_roles ar ON rp.role_id = ar.role_id
       JOIN admins a ON ar.admin_id = a.id
       WHERE a.id = ?`,
      [adminId]
    );
    return Array.isArray(permissions) ? permissions.map((p: any) => p.name) : [];
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const hash = req.headers.authorization?.replace('Bearer ', '') || '';
    const { valid, username, adminId } = await verifyAdminSession(hash);
    
    if (!valid || !adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = await getUserPermissions(adminId);

    if (!hasPermission(userPermissions, 'email_profiles_test')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    if (req.method === 'POST') {
      const { profile_key, test_email } = req.body;

      if (!profile_key) {
        return res.status(400).json({
          error: 'Missing required field: profile_key'
        });
      }

      if (!test_email) {
        return res.status(400).json({
          error: 'Missing required field: test_email'
        });
      }

      // Test connection and send test email
      const result = await testEmailProfile(profile_key, test_email);

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[Test Email Profile API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

