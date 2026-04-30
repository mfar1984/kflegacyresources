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
    return res.status(400).json({ error: 'Expense category ID is required' });
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
      if (!permissions.includes('expenses_view')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const category = await query('SELECT * FROM expense_categories WHERE id = ?', [id]) as Array<any>;
      if (category.length === 0) {
        return res.status(404).json({ error: 'Expense category not found' });
      }

      return res.status(200).json({ category: category[0] });
    }

    if (req.method === 'PUT') {
      if (!permissions.includes('expenses_update')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { code, name, description, requires_approval, approval_threshold, color, status } = req.body;

      if (!code || !name) {
        return res.status(400).json({ error: 'Code and name are required' });
      }

      await query(
        'UPDATE expense_categories SET code = ?, name = ?, description = ?, requires_approval = ?, approval_threshold = ?, color = ?, status = ? WHERE id = ?',
        [code, name, description || null, requires_approval ? 1 : 0, approval_threshold || null, color, status, id]
      );

      return res.status(200).json({ message: 'Expense category updated successfully' });
    }

    if (req.method === 'DELETE') {
      if (!permissions.includes('expenses_delete')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await query('DELETE FROM expense_categories WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Expense category deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Expense category API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

