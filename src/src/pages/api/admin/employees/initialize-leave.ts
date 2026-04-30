import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

async function verifySessionFromDB(hash: string): Promise<{ admin_id: number } | null> {
  try {
    const rows = await query(
      'SELECT a.id as admin_id, s.expires_at FROM admin_sessions s JOIN admins a ON s.username = a.username WHERE s.hash = ? LIMIT 1',
      [hash]
    ) as { admin_id: number; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      if (expires > new Date()) {
        return { admin_id: rows[0].admin_id };
      }
    }
    return null;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const { employee_id } = req.body;

  // Verify session
  const session = await verifySessionFromDB(hash as string);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!employee_id) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  try {
    const currentYear = new Date().getFullYear();

    // Check if employee exists
    const employees = await query(
      'SELECT id, employee_id, full_name FROM employees WHERE id = ? AND status = ?',
      [employee_id, 'active']
    ) as any[];

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found or inactive' });
    }

    const employee = employees[0];

    // Get all active leave types with days > 0
    const leaveTypes = await query(
      'SELECT id, code, name, days_per_year FROM leave_types WHERE status = ? AND days_per_year > 0',
      ['active']
    ) as Array<{ id: number; code: string; name: string; days_per_year: number }>;

    if (leaveTypes.length === 0) {
      return res.status(400).json({ error: 'No active leave types found' });
    }

    let initialized = 0;
    let updated = 0;
    let skipped = 0;

    // Create or update leave balance for each leave type
    for (const leaveType of leaveTypes) {
      // Check if balance already exists
      const existingBalances = await query(
        'SELECT id, total_days FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
        [employee_id, leaveType.id, currentYear]
      ) as any[];

      if (existingBalances.length > 0) {
        // Update if total_days is 0 or different
        if (existingBalances[0].total_days === 0 || existingBalances[0].total_days !== leaveType.days_per_year) {
          await query(
            'UPDATE leave_balances SET total_days = ?, updated_at = NOW() WHERE id = ?',
            [leaveType.days_per_year, existingBalances[0].id]
          );
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new balance
        await query(
          `INSERT INTO leave_balances (
            employee_id, leave_type_id, year, 
            total_days, used_days, carried_forward
          ) VALUES (?, ?, ?, ?, 0, 0)`,
          [employee_id, leaveType.id, currentYear, leaveType.days_per_year]
        );
        initialized++;
      }
    }

    console.log(`Leave balances for ${employee.employee_id}: ${initialized} created, ${updated} updated, ${skipped} skipped`);

    res.status(200).json({ 
      success: true, 
      message: 'Leave balances initialized successfully',
      stats: {
        total_leave_types: leaveTypes.length,
        initialized,
        updated,
        skipped
      },
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name
      }
    });
  } catch (error) {
    console.error('Initialize leave balances error:', error);
    res.status(500).json({ error: 'Failed to initialize leave balances' });
  }
}

