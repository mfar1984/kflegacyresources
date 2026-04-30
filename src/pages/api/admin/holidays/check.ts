import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

/**
 * Check if a date is a public holiday
 * This API is used by Overtime Management to auto-detect holidays
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Resolve state: use query param if provided, otherwise default from integrations.holidays_include_states[0], else KL '14'
    let resolvedState = (req.query.state as string) || '';
    if (!resolvedState) {
      try {
        const rows = await query(`SELECT holidays_include_states FROM integrations LIMIT 1`, []) as any[];
        if (rows && rows.length > 0 && rows[0].holidays_include_states) {
          try {
            const arr = JSON.parse(rows[0].holidays_include_states);
            if (Array.isArray(arr) && arr.length > 0) {
              resolvedState = String(arr[0]);
            }
          } catch {}
        }
      } catch {}
      if (!resolvedState) resolvedState = '14';
    }

    // Check public holidays (national or specific state)
    const publicHolidays = await query(
      `SELECT id, name, type 
       FROM public_holidays 
       WHERE date = ? 
       AND is_active = TRUE
       AND (
         type = 'national' 
         OR (type = 'regional' AND JSON_CONTAINS(state_codes, ?))
       )
       LIMIT 1`,
      [date, JSON.stringify([resolvedState])]
    ) as any[];

    // Check custom holidays
    const customHolidays = await query(
      `SELECT id, name 
       FROM custom_holidays 
       WHERE ? BETWEEN start_date AND end_date
       AND (
         state_codes IS NULL 
         OR JSON_CONTAINS(state_codes, ?)
       )
       LIMIT 1`,
      [date, JSON.stringify([resolvedState])]
    ) as any[];

    const isHoliday = publicHolidays.length > 0 || customHolidays.length > 0;
    const holidayName = publicHolidays[0]?.name || customHolidays[0]?.name || null;
    const holidayType = publicHolidays[0]?.type || 'custom';

    // Check if it's weekend (Saturday/Sunday) using local timezone
    const utcDate = new Date(date as string);
    const local = new Date(utcDate.getTime() + (new Date().getTimezoneOffset() * -60000));
    const dayOfWeek = local.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Determine overtime multiplier type
    let overtimeType = 'weekday';
    if (isHoliday && isWeekend) {
      overtimeType = 'public_holiday_weekend';
    } else if (isHoliday) {
      overtimeType = 'public_holiday';
    } else if (isWeekend) {
      overtimeType = 'weekend';
    }

    // Get overtime rate from database based on day_type
    const overtimeRates = await query(
      `SELECT id, code, name, rate_multiplier 
       FROM overtime_rates 
       WHERE day_type = ? AND status = 'active' 
       LIMIT 1`,
      [overtimeType]
    ) as any[];

    const overtimeRate = overtimeRates[0] || null;
    const multiplier = overtimeRate?.rate_multiplier || 1.5;

    return res.status(200).json({
      date,
      state: resolvedState,
      is_holiday: isHoliday,
      is_weekend: isWeekend,
      holiday_name: holidayName,
      holiday_type: holidayType,
      overtime_type: overtimeType,
      overtime_multiplier: parseFloat(multiplier),
      overtime_rate_id: overtimeRate?.id || null,
      overtime_rate_name: overtimeRate?.name || 'Overtime (Weekday)',
    });
  } catch (error) {
    console.error('Check holiday error:', error);
    return res.status(500).json({ error: 'Failed to check holiday' });
  }
}

