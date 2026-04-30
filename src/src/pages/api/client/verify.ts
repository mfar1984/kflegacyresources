import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Find client with this token
    const clients = await query(
      `SELECT id, email, token_expires_at FROM client_users 
       WHERE email_verification_token = ? AND status = 'pending_verification'`,
      [token]
    ) as any[];

    if (!clients || clients.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired verification token' });
    }

    const client = clients[0];

    // Check if token expired
    const now = new Date();
    const expiresAt = new Date(client.token_expires_at);

    if (now > expiresAt) {
      return res.status(400).json({ error: 'Verification token has expired. Please register again.' });
    }

    // Update client status to active
    await query(
      `UPDATE client_users 
       SET status = 'active', email_verified = 1, email_verification_token = NULL, token_expires_at = NULL
       WHERE id = ?`,
      [client.id]
    );

    // Update all pending tickets from this client to 'open'
    await query(
      `UPDATE helpdesk_tickets 
       SET status = 'open' 
       WHERE client_id = ? AND status = 'pending'`,
      [client.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      email: client.email,
    });
  } catch (error: any) {
    console.error('Error in email verification:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

