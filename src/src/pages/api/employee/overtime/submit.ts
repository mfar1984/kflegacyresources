import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  if (session.user_type !== 'employee') return null;
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { employee_id, project_name, overtime_date, start_time, end_time, total_hours, reason, remarks } = req.body;

  if (session.employee_id !== parseInt(employee_id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!project_name || !overtime_date || !start_time || !end_time || !total_hours || !reason) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  try {
    // Get employee basic salary
    const [employees] = await pool.query<RowDataPacket[]>(
      `SELECT e.basic_salary FROM employees e WHERE e.id = ?`,
      [employee_id]
    );

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const basic_salary = parseFloat(employees[0].basic_salary);
    
    // Get company state from integrations (default to KL if not set)
    const [integrations] = await pool.query<RowDataPacket[]>(
      `SELECT holidays_include_states FROM integrations LIMIT 1`
    );
    
    let company_state = '14'; // Default: Kuala Lumpur
    if (integrations && integrations.length > 0 && integrations[0].holidays_include_states) {
      try {
        const states = JSON.parse(integrations[0].holidays_include_states);
        if (Array.isArray(states) && states.length > 0) {
          company_state = states[0]; // Use first state
        }
      } catch (err) {
        console.warn('Failed to parse holidays_include_states:', err);
      }
    }
    
    // Calculate hourly rate (26 days, 8 hours per day - Akta Kerja 1955)
    const hourly_rate = basic_salary / (26 * 8);

    // Auto-detect holiday and suggest overtime rate
    let suggested_rate_id = null;
    let suggested_multiplier = 1.5;
    
    try {
      const holidayCheckResponse = await fetch(
        `http://localhost:3000/api/admin/holidays/check?date=${overtime_date}&state=${company_state}`
      );
      
      if (holidayCheckResponse.ok) {
        const holidayData = await holidayCheckResponse.json();
        suggested_rate_id = holidayData.overtime_rate_id;
        suggested_multiplier = holidayData.overtime_multiplier;
      }
    } catch (err) {
      console.warn('Holiday check failed, using default rate:', err);
    }

    // Generate overtime number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const [lastOT] = await pool.query<RowDataPacket[]>(
      `SELECT overtime_number FROM overtime_applications WHERE overtime_number LIKE ? ORDER BY overtime_number DESC LIMIT 1`,
      [`OT-${dateStr}%`]
    );

    let sequence = 1;
    if (lastOT && lastOT.length > 0) {
      const lastNum = lastOT[0].overtime_number.split('-')[2];
      sequence = parseInt(lastNum) + 1;
    }
    const overtime_number = `OT-${dateStr}-${sequence.toString().padStart(3, '0')}`;

    // Calculate suggested amount based on auto-detected rate
    const suggested_amount = hourly_rate * parseFloat(total_hours) * suggested_multiplier;

    // Insert overtime with suggested rate (admin can override during approval)
    await pool.query<ResultSetHeader>(
      `INSERT INTO overtime_applications 
       (employee_id, project_name, overtime_number, overtime_date, start_time, end_time, total_hours, hourly_rate, overtime_rate_id, total_amount, reason, remarks, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [employee_id, project_name, overtime_number, overtime_date, start_time, end_time, total_hours, hourly_rate, suggested_rate_id, suggested_amount, reason, remarks || null]
    );

    return res.status(200).json({ 
      message: 'Overtime submitted successfully', 
      overtime_number,
      suggested_rate_id,
      suggested_multiplier,
      suggested_amount
    });
  } catch (error) {
    console.error('Error submitting overtime:', error);
    return res.status(500).json({ error: 'Failed to submit overtime' });
  }
}

