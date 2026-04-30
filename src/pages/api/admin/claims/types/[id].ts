import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

// Helper function to get user permissions
async function getUserPermissions(username: string): Promise<string[]> {
  try {
    const permissionsResult = await query(`
      SELECT DISTINCT p.name
      FROM admin_sessions AS ses
      INNER JOIN admins AS a ON ses.username = a.username
      INNER JOIN admin_roles AS ar ON a.id = ar.admin_id
      INNER JOIN role_permissions AS rp ON ar.role_id = rp.role_id
      INNER JOIN permissions AS p ON rp.permission_id = p.id
      WHERE ses.username = ?
    `, [username]) as Array<{ name: string }>;
    return permissionsResult.map((row) => row.name);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash, id } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Session hash is required' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Claim type ID is required' });
  }

  try {
    // Verify session
    const sessionResult = await query('SELECT username FROM admin_sessions WHERE hash = ?', [hash]) as Array<{ username: string }>;
    if (sessionResult.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const username = sessionResult[0].username;
    const permissions = await getUserPermissions(username);

    if (req.method === 'GET') {
      if (!permissions.includes('claims_view') && !permissions.includes('claim_view')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const claimType = await query('SELECT * FROM claim_types WHERE id = ?', [id]) as Array<any>;
      if (claimType.length === 0) {
        return res.status(404).json({ error: 'Claim type not found' });
      }

      return res.status(200).json({ claimType: claimType[0] });
    }

    if (req.method === 'PUT') {
      if (!permissions.includes('claim_update')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { code, name, description, requires_receipt, max_amount, color, status } = req.body;

      if (!code || !name) {
        return res.status(400).json({ error: 'Code and name are required' });
      }

      await query(
        'UPDATE claim_types SET code = ?, name = ?, description = ?, requires_receipt = ?, max_amount = ?, color = ?, status = ? WHERE id = ?',
        [code, name, description || null, requires_receipt ? 1 : 0, max_amount || null, color, status, id]
      );

      return res.status(200).json({ message: 'Claim type updated successfully' });
    }

    if (req.method === 'DELETE') {
      if (!permissions.includes('claim_delete')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await query('DELETE FROM claim_types WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Claim type deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Claim type API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

