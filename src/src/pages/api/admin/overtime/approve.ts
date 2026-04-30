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
  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'overtime_approve')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const { id, action, overtime_rate_id, review_remarks } = req.body;
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      // If approving, overtime_rate_id is required
      if (action === 'approve' && !overtime_rate_id) {
        return res.status(400).json({ error: 'Overtime rate is required when approving' });
      }

      const [adminRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM admins WHERE username = ?', [session.username]
      );
      if (!adminRows || adminRows.length === 0) {
        return res.status(401).json({ error: 'Admin not found' });
      }
      const reviewerId = adminRows[0].id;

      const [overtimeRows] = await pool.query<RowDataPacket[]>(
        `SELECT status, hourly_rate, total_hours, overtime_date
         FROM overtime_applications WHERE id = ?`, [id]
      );
      if (!overtimeRows || overtimeRows.length === 0) {
        return res.status(404).json({ error: 'Overtime application not found' });
      }
      if (overtimeRows[0].status !== 'pending') {
        return res.status(400).json({ error: 'Only pending overtime applications can be reviewed' });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      let updateQuery = '';
      let updateParams: any[] = [];
      let warningMessage = '';

      if (action === 'approve') {
        // Get rate multiplier and day_type
        const [rateRows] = await pool.query<RowDataPacket[]>(
          'SELECT rate_multiplier, day_type FROM overtime_rates WHERE id = ?', [overtime_rate_id]
        );
        if (!rateRows || rateRows.length === 0) {
          return res.status(404).json({ error: 'Overtime rate not found' });
        }

        const rateMultiplier = parseFloat(rateRows[0].rate_multiplier);
        const selectedDayType = rateRows[0].day_type;
        const hourlyRate = parseFloat(overtimeRows[0].hourly_rate);
        const totalHours = parseFloat(overtimeRows[0].total_hours);
        const totalAmount = hourlyRate * rateMultiplier * totalHours;

        // Validate if selected rate matches the date
        const overtimeDate = overtimeRows[0].overtime_date;
        
        // Get company state from integrations (default to KL if not set)
        const [integrations] = await pool.query<RowDataPacket[]>(
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
        
        try {
          const holidayCheckResponse = await fetch(
            `http://localhost:3000/api/admin/holidays/check?date=${overtimeDate}&state=${companyState}`
          );
          
          if (holidayCheckResponse.ok) {
            const holidayData = await holidayCheckResponse.json();
            const suggestedDayType = holidayData.overtime_type;
            
            if (selectedDayType !== suggestedDayType) {
              warningMessage = `⚠️ Rate mismatch: Selected rate is for "${selectedDayType}" but date is "${suggestedDayType}". ${holidayData.holiday_name ? `(${holidayData.holiday_name})` : ''}`;
            }
          }
        } catch (err) {
          console.warn('Holiday validation check failed:', err);
        }

        updateQuery = `UPDATE overtime_applications 
         SET status = ?, overtime_rate_id = ?, total_amount = ?, reviewed_by = ?, reviewed_date = NOW(), review_remarks = ?
         WHERE id = ?`;
        updateParams = [newStatus, overtime_rate_id, totalAmount, reviewerId, review_remarks || null, id];
      } else {
        // For rejection, just update status and review info
        updateQuery = `UPDATE overtime_applications 
         SET status = ?, reviewed_by = ?, reviewed_date = NOW(), review_remarks = ?
         WHERE id = ?`;
        updateParams = [newStatus, reviewerId, review_remarks || null, id];
      }

      await pool.query<ResultSetHeader>(updateQuery, updateParams);

      return res.status(200).json({ 
        message: `Overtime application ${action}d successfully`,
        status: newStatus,
        warning: warningMessage || null
      });
    } catch (error) {
      console.error('Overtime approval error:', error);
      return res.status(500).json({ error: 'Failed to process overtime application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

