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

    if (req.method === 'DELETE') {
      if (!context.permissionNames.includes('helpdesk_clients_delete')) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      // Delete client (CASCADE will delete related tickets and replies)
      await query('DELETE FROM client_users WHERE id = ?', [clientId]);

      return res.status(200).json({ success: true, message: 'Client deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in client delete API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

