import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?', [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

async function getUserPermissions(username: string): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ? LIMIT 1', [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userPermissions = await getUserPermissions(session.username);
  if (!hasPermission(userPermissions, 'overtime_approve')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { overtime_ids, action, review_remarks } = req.body;

    if (!overtime_ids || !Array.isArray(overtime_ids) || overtime_ids.length === 0) {
      return res.status(400).json({ error: 'overtime_ids array is required' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get admin ID
    const [adminRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ?', [session.username]
    );
    if (!adminRows || adminRows.length === 0) {
      return res.status(401).json({ error: 'Admin not found' });
    }
    const reviewerId = adminRows[0].id;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const results = {
        success: [] as number[],
        failed: [] as { id: number; reason: string }[],
        skipped: [] as { id: number; reason: string }[]
      };

      for (const overtimeId of overtime_ids) {
        try {
          // Get overtime application
          const [overtimeRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, status, hourly_rate, total_hours FROM overtime_applications WHERE id = ?',
            [overtimeId]
          );

          if (!overtimeRows || overtimeRows.length === 0) {
            results.failed.push({ id: overtimeId, reason: 'Not found' });
            continue;
          }

          const overtime = overtimeRows[0];

          if (overtime.status !== 'pending') {
            results.skipped.push({ id: overtimeId, reason: `Already ${overtime.status}` });
            continue;
          }

          if (action === 'approve') {
            // Get the overtime date
            const [dateCheck] = await connection.query<RowDataPacket[]>(
              `SELECT oa.overtime_date FROM overtime_applications oa WHERE oa.id = ?`,
              [overtimeId]
            );

            if (!dateCheck || dateCheck.length === 0) {
              results.failed.push({ id: overtimeId, reason: 'Date not found' });
              continue;
            }

            const overtimeDate = dateCheck[0].overtime_date;
            
            // Get company state from integrations (default to KL if not set)
            const [integrations] = await connection.query<RowDataPacket[]>(
              `SELECT holidays_include_states FROM integrations LIMIT 1`
            );
            
            let companyState = '14'; // Default: Kuala Lumpur
            if (integrations && integrations.length > 0 && integrations[0].holidays_include_states) {
              try {
                const states = JSON.parse(integrations[0].holidays_include_states);
                if (Array.isArray(states) && states.length > 0) {
                  companyState = states[0]; // Use first state
                }
              } catch (err) {
                console.warn('Failed to parse holidays_include_states:', err);
              }
            }
            
            // Auto-detect holiday and get appropriate rate
            let overtimeRateId = null;
            let rateMultiplier = 1.5;
            
            try {
              const holidayCheckResponse = await fetch(
                `http://localhost:3000/api/admin/holidays/check?date=${overtimeDate}&state=${companyState}`
              );
              
              if (holidayCheckResponse.ok) {
                const holidayData = await holidayCheckResponse.json();
                overtimeRateId = holidayData.overtime_rate_id;
                rateMultiplier = holidayData.overtime_multiplier;
              }
            } catch (err) {
              console.warn('Holiday check failed for bulk approve, using default rate:', err);
            }

            // If holiday check failed, fallback to manual detection
            if (!overtimeRateId) {
              const dateObj = new Date(overtimeDate);
              const dayOfWeek = dateObj.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const dayType = isWeekend ? 'weekend' : 'weekday';

              // Get appropriate overtime rate
              const [rateRows] = await connection.query<RowDataPacket[]>(
                `SELECT id, rate_multiplier FROM overtime_rates 
                 WHERE status = 'active' AND day_type = ?
                 LIMIT 1`,
                [dayType]
              );

              if (rateRows && rateRows.length > 0) {
                overtimeRateId = rateRows[0].id;
                rateMultiplier = parseFloat(rateRows[0].rate_multiplier);
              }
            }

            // Final fallback to default rate if still not found
            if (!overtimeRateId) {
              const [defaultRate] = await connection.query<RowDataPacket[]>(
                'SELECT id, rate_multiplier FROM overtime_rates WHERE is_default = 1 AND status = \'active\' LIMIT 1'
              );
              
              if (!defaultRate || defaultRate.length === 0) {
                results.failed.push({ id: overtimeId, reason: 'No active overtime rate found' });
                continue;
              }

              overtimeRateId = defaultRate[0].id;
              rateMultiplier = parseFloat(defaultRate[0].rate_multiplier);
            }

            // Calculate total amount
            const hourlyRate = parseFloat(overtime.hourly_rate);
            const totalHours = parseFloat(overtime.total_hours);
            const totalAmount = hourlyRate * rateMultiplier * totalHours;

            // Update overtime application
            await connection.query<ResultSetHeader>(
              `UPDATE overtime_applications 
               SET status = 'approved', overtime_rate_id = ?, total_amount = ?, 
                   reviewed_by = ?, reviewed_date = NOW(), review_remarks = ?
               WHERE id = ?`,
              [overtimeRateId, totalAmount, reviewerId, review_remarks || 'Bulk approved (auto-rate)', overtimeId]
            );
          } else {
            // Reject
            await connection.query<ResultSetHeader>(
              `UPDATE overtime_applications 
               SET status = 'rejected', reviewed_by = ?, reviewed_date = NOW(), review_remarks = ?
               WHERE id = ?`,
              [reviewerId, review_remarks || 'Bulk rejected', overtimeId]
            );
          }

          results.success.push(overtimeId);
        } catch (err) {
          console.error(`Error processing overtime ${overtimeId}:`, err);
          results.failed.push({ id: overtimeId, reason: 'Processing error' });
        }
      }

      await connection.commit();

      return res.status(200).json({
        message: `Bulk ${action} completed`,
        results
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Bulk approve error:', error);
    return res.status(500).json({ error: 'Failed to process bulk action' });
  }
}

