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
    // Check permission
    if (!userPermissions.includes('holidays_view')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      const { year = 2025, mode = 'all', state } = req.query;

      let sql = `
        SELECT 
          id,
          date,
          day_name,
          name,
          name_en,
          type,
          state_codes,
          year
        FROM public_holidays
        WHERE year = ? AND is_active = TRUE
      `;
      const params: any[] = [year];

      // Filter by state if mode is 'single'
      if (mode === 'single' && state) {
        sql += ` AND (type = 'national' OR JSON_CONTAINS(state_codes, ?))`;
        params.push(JSON.stringify([state]));
      }

      sql += ` ORDER BY date ASC`;

      const holidays = await query(sql, params) as any[];

      // Parse state_codes JSON
      const parsedHolidays = holidays.map((h) => ({
        ...h,
        state_codes: h.state_codes ? JSON.parse(h.state_codes) : null,
      }));

      return res.status(200).json({ holidays: parsedHolidays });
    } catch (error) {
      console.error('Fetch holidays error:', error);
      return res.status(500).json({ error: 'Failed to fetch holidays' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

