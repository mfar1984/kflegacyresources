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
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Session hash is required' });
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
      // Check permission
      if (!permissions.includes('overtime_view')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const rates = await query('SELECT * FROM overtime_rates ORDER BY code ASC') as Array<any>;
      return res.status(200).json({ rates, overtimeRates: rates });
    }

    if (req.method === 'POST') {
      // Check permission
      if (!permissions.includes('overtime_create')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { code, name, description, rate_multiplier, is_default, status } = req.body;

      if (!code || !name || !rate_multiplier) {
        return res.status(400).json({ error: 'Code, name, and rate multiplier are required' });
      }

      // If this rate is set as default, unset all other defaults
      if (is_default) {
        await query('UPDATE overtime_rates SET is_default = 0');
      }

      await query(
        'INSERT INTO overtime_rates (code, name, description, rate_multiplier, is_default, status) VALUES (?, ?, ?, ?, ?, ?)',
        [code, name, description || null, rate_multiplier, is_default ? 1 : 0, status || 'active']
      );

      return res.status(201).json({ message: 'Overtime rate created successfully' });
    }

    if (req.method === 'PUT') {
      // Check permission
      if (!permissions.includes('overtime_update')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { id, code, name, description, rate_multiplier, is_default, status } = req.body;

      if (!id || !code || !name || !rate_multiplier) {
        return res.status(400).json({ error: 'ID, code, name, and rate multiplier are required' });
      }

      // If this rate is set as default, unset all other defaults
      if (is_default) {
        await query('UPDATE overtime_rates SET is_default = 0 WHERE id != ?', [id]);
      }

      await query(
        'UPDATE overtime_rates SET code = ?, name = ?, description = ?, rate_multiplier = ?, is_default = ?, status = ? WHERE id = ?',
        [code, name, description || null, rate_multiplier, is_default ? 1 : 0, status, id]
      );

      return res.status(200).json({ message: 'Overtime rate updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Check permission
      if (!permissions.includes('overtime_delete')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      await query('DELETE FROM overtime_rates WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Overtime rate deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Overtime rates API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
