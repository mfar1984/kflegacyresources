import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

// Helper: Verify admin session
async function verifyAdminSession(hash: string) {
  if (!hash) return { valid: false, adminId: null };

  try {
    const sessions: any = await query(
      `SELECT username FROM admin_sessions WHERE hash = ? LIMIT 1`,
      [hash]
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { valid: false, adminId: null };
    }

    const { username } = sessions[0];
    const admins: any = await query(
      `SELECT id FROM admins WHERE username = ? LIMIT 1`,
      [username]
    );

    if (!Array.isArray(admins) || admins.length === 0) {
      return { valid: false, adminId: null };
    }

    return { valid: true, adminId: admins[0].id };
  } catch (error) {
    console.error('Session verification error:', error);
    return { valid: false, adminId: null };
  }
}

async function getUserPermissions(adminId: number) {
  try {
    const permissions: any = await query(
      `SELECT DISTINCT p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN admin_roles ar ON rp.role_id = ar.role_id
       WHERE ar.admin_id = ?`,
      [adminId]
    );
    return Array.isArray(permissions) ? permissions.map((p: any) => p.name) : [];
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const hash = authHeader?.replace('Bearer ', '');

  const { valid, adminId } = await verifyAdminSession(hash || '');
  if (!valid || !adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userPermissions = await getUserPermissions(adminId);

  if (req.method === 'GET') {
    // Fetch custom holidays
    if (!userPermissions.includes('holidays_view')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      const { year = 2025 } = req.query;

      const customHolidays = await query(
        `SELECT 
          id,
          start_date,
          end_date,
          name,
          state_codes,
          notes,
          created_by,
          created_at
        FROM custom_holidays
        WHERE YEAR(start_date) = ? OR YEAR(end_date) = ?
        ORDER BY start_date ASC`,
        [year, year]
      ) as any[];

      // Parse state_codes JSON
      const parsed = customHolidays.map((h) => ({
        ...h,
        state_codes: h.state_codes ? JSON.parse(h.state_codes) : null,
      }));

      return res.status(200).json({ customHolidays: parsed });
    } catch (error) {
      console.error('Fetch custom holidays error:', error);
      return res.status(500).json({ error: 'Failed to fetch custom holidays' });
    }
  }

  if (req.method === 'POST') {
    // Create custom holiday
    if (!userPermissions.includes('holidays_custom_create')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      const { start_date, end_date, name, state_codes, notes } = req.body;

      if (!start_date || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const finalEndDate = end_date || start_date;
      const stateCodesJson = state_codes ? JSON.stringify(state_codes) : null;

      await query(
        `INSERT INTO custom_holidays 
         (start_date, end_date, name, state_codes, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [start_date, finalEndDate, name, stateCodesJson, notes, adminId]
      );

      return res.status(201).json({ success: true, message: 'Custom holiday created' });
    } catch (error) {
      console.error('Create custom holiday error:', error);
      return res.status(500).json({ error: 'Failed to create custom holiday' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

