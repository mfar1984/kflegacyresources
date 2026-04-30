import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Verify client session
async function verifyClientSession(sessionHash: string) {
  if (!sessionHash) return null;

  const sessions = await query(
    `SELECT s.client_id, c.* 
     FROM admin_sessions s
     JOIN client_users c ON s.client_id = c.id
     WHERE s.hash = ? AND s.user_type = 'client' AND s.expires_at > NOW()`,
    [sessionHash]
  ) as any[];

  return sessions && sessions.length > 0 ? sessions[0] : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session hash from cookie or query
    const sessionHash = req.cookies.session_token || (req.query.hash as string) || '';
    const client = await verifyClientSession(sessionHash);

    if (!client) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    if (req.method === 'GET') {
      // Get client profile
      const clients = await query(
        `SELECT id, company_name, contact_person, email, phone, address, status, created_at 
         FROM client_users WHERE id = ?`,
        [client.client_id]
      ) as any[];

      if (!clients || clients.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.status(200).json({ profile: clients[0] });
    }

    if (req.method === 'PATCH') {
      // Update client profile
      const { company_name, contact_person, phone, address, current_password, new_password } = req.body;

      // If changing password, verify current password
      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ error: 'Current password is required to set new password' });
        }

        const clients = await query(
          `SELECT password_hash FROM client_users WHERE id = ?`,
          [client.client_id]
        ) as any[];

        if (!clients || clients.length === 0) {
          return res.status(404).json({ error: 'Profile not found' });
        }

        const isPasswordValid = await bcrypt.compare(current_password, clients[0].password_hash);
        if (!isPasswordValid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(new_password, 10);

        await query(
          `UPDATE client_users 
           SET password_hash = ? 
           WHERE id = ?`,
          [newPasswordHash, client.client_id]
        );
      }

      // Update other fields
      const updates: string[] = [];
      const values: any[] = [];

      if (company_name) {
        updates.push('company_name = ?');
        values.push(company_name);
      }
      if (contact_person) {
        updates.push('contact_person = ?');
        values.push(contact_person);
      }
      if (phone) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (address !== undefined) {
        updates.push('address = ?');
        values.push(address);
      }

      if (updates.length > 0) {
        values.push(client.client_id);
        await query(
          `UPDATE client_users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in client profile API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

