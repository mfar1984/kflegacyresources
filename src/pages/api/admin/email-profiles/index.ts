/**
 * API: Email Profiles Management
 * GET: List all email profiles
 * POST: Create/Update email profile
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getAllEmailProfiles, saveEmailProfile } from '@/lib/email-profiles';

// Helper: Verify admin session and get permissions
async function verifyAdminSession(hash: string) {
  if (!hash) {
    return { valid: false, username: null, adminId: null };
  }

  try {
    // Get session from admin_sessions table
    const sessions: any = await query(
      `SELECT username FROM admin_sessions WHERE hash = ? LIMIT 1`,
      [hash]
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { valid: false, username: null, adminId: null };
    }

    const { username } = sessions[0];

    // Get admin ID from admins table
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
      `
        SELECT DISTINCT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN admin_roles ar ON rp.role_id = ar.role_id
        JOIN admins a ON ar.admin_id = a.id
        WHERE a.id = ?
      `,
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
    // Verify session
    const hash = req.headers.authorization?.replace('Bearer ', '') || '';
    const { valid, username, adminId } = await verifyAdminSession(hash);

    if (!valid || !adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = await getUserPermissions(adminId);

    // Check permission
    if (!hasPermission(userPermissions, 'email_profiles_view')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    if (req.method === 'GET') {
      // Get all email profiles
      const profiles = await getAllEmailProfiles();
      
      // Remove sensitive data before sending
      const sanitizedProfiles = profiles.map(profile => ({
        ...profile,
        smtp_password: '********', // Hide password
      }));
      
      return res.status(200).json({
        success: true,
        profiles: sanitizedProfiles
      });
    }

    if (req.method === 'POST') {
      // Check edit permission
      if (!hasPermission(userPermissions, 'email_profiles_edit')) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      const {
        profile_key,
        profile_name,
        provider_type,
        email_address,
        from_name,
        reply_to,
        smtp_host,
        smtp_port,
        smtp_encryption,
        smtp_authentication,
        smtp_username,
        smtp_password,
        connection_timeout,
        max_retries,
        is_active
      } = req.body;

      // Validation
      if (!profile_key || !profile_name || !provider_type || !email_address || !from_name) {
        return res.status(400).json({
          error: 'Missing required fields: profile_key, profile_name, provider_type, email_address, from_name'
        });
      }

      if (!smtp_host || !smtp_port || !smtp_encryption || !smtp_username || !smtp_password) {
        return res.status(400).json({
          error: 'Missing required SMTP fields'
        });
      }

      // Auto-configure for Gmail
      let finalSmtpHost = smtp_host;
      let finalSmtpPort = smtp_port;
      let finalSmtpEncryption = smtp_encryption;

      if (provider_type === 'gmail') {
        finalSmtpHost = 'smtp.gmail.com';
        finalSmtpPort = 587;
        finalSmtpEncryption = 'tls';
      }

      // Save profile
      const profileId = await saveEmailProfile({
        profile_key,
        profile_name,
        provider_type,
        email_address,
        from_name,
        reply_to: reply_to || null,
        smtp_host: finalSmtpHost,
        smtp_port: parseInt(finalSmtpPort),
        smtp_encryption: finalSmtpEncryption,
        smtp_authentication: smtp_authentication !== false,
        smtp_username,
        smtp_password,
        connection_timeout: connection_timeout ? parseInt(connection_timeout) : 30,
        max_retries: max_retries ? parseInt(max_retries) : 3,
        is_active: is_active !== false,
        updated_by: username
      });

      return res.status(200).json({
        success: true,
        message: 'Email profile saved successfully',
        profile_id: profileId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[Email Profiles API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

