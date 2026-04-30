import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getAdminContextFromHash } from '@/lib/auth-admin';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/email-helpdesk';

function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hash, id } = req.query;
    const sessionHash = (hash as string) || '';
    const clientId = parseInt(id as string);

    const context = await getAdminContextFromHash(sessionHash);
    if (!context) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!context.permissionNames.includes('helpdesk_clients_edit')) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    if (req.method === 'POST') {
      // Get client details
      const clientRows = await query(
        'SELECT email, company_name, contact_person FROM client_users WHERE id = ?',
        [clientId]
      ) as { email: string; company_name: string; contact_person: string }[];

      if (clientRows.length === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const client = clientRows[0];

      // Generate new password
      const newPassword = generateRandomPassword();
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await query(
        'UPDATE client_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [passwordHash, clientId]
      );

      // Send email with new credentials
      await sendPasswordResetEmail(client.email, client.contact_person, newPassword);

      return res.status(200).json({ success: true, message: 'Password reset successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in reset password API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

