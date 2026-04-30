import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
const Holidays = require('date-holidays');

// Helper: Verify admin session (same as index.ts)
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

// Get day name from date
function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const hash = authHeader?.replace('Bearer ', '');

  const { valid, adminId } = await verifyAdminSession(hash || '');
  if (!valid || !adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userPermissions = await getUserPermissions(adminId);

  // Check permission
  if (!userPermissions.includes('holidays_sync')) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  try {
    const { year = 2025, state = null } = req.body;

    // Initialize holidays library
    const hd = new Holidays('MY', state || undefined);
    const holidays = hd.getHolidays(year);

    let synced = 0;

    for (const holiday of holidays) {
      const date = holiday.date.slice(0, 10); // YYYY-MM-DD
      const dayName = getDayName(date);
      const name = holiday.name;
      
      // Determine if national or regional based on holiday type from npm package
      // National holidays: celebrated across all Malaysia (New Year, CNY, Deepavali, Christmas, etc.)
      // Regional holidays: state-specific (Gawai Dayak for Sarawak, Pesta Kaamatan for Sabah, etc.)
      let type: 'national' | 'regional' = 'national';
      let stateCodes = null;
      
      // Check if this is a regional/state-specific holiday
      // date-holidays marks regional holidays with specific state info
      if (holiday.type === 'public' && state) {
        // If we're syncing for a specific state, we get both national and regional
        // We need to check if this holiday is celebrated nationwide or just in this state
        
        // Get holidays for all of Malaysia (no state filter)
        const hdNational = new Holidays('MY');
        const nationalHolidays = hdNational.getHolidays(year);
        
        // Check if this holiday exists in national list
        const isNational = nationalHolidays.some((nh: any) => 
          nh.date.slice(0, 10) === date && nh.name === name
        );
        
        if (isNational) {
          // This is a national holiday celebrated everywhere
          type = 'national';
          stateCodes = null;
        } else {
          // This is regional/state-specific
          type = 'regional';
          stateCodes = JSON.stringify([state]);
        }
      } else if (!state) {
        // Syncing all states - these are all national holidays
        type = 'national';
        stateCodes = null;
      }

      // Insert or update
      await query(
        `INSERT INTO public_holidays 
         (date, day_name, name, name_en, type, state_codes, year, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE
         day_name = VALUES(day_name),
         name = VALUES(name),
         type = VALUES(type),
         state_codes = VALUES(state_codes),
         is_active = TRUE`,
        [date, dayName, name, name, type, stateCodes, year]
      );

      synced++;
    }

    // Update last sync time in integrations
    await query(
      `UPDATE integrations SET holidays_last_sync = NOW() WHERE id = 1`
    );

    return res.status(200).json({
      success: true,
      synced,
      year,
      state: state || 'all',
    });
  } catch (error) {
    console.error('Sync holidays error:', error);
    return res.status(500).json({ error: 'Failed to sync holidays' });
  }
}

