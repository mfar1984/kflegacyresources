import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getAdminContextFromHash } from '@/lib/auth-admin';

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

    if (req.method === 'PATCH') {
      const { status } = req.body;

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await query(
        'UPDATE client_users SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, clientId]
      );

      return res.status(200).json({ success: true, message: 'Status updated successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in client status API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

