import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash, employee_id } = req.query;
  const session = await verifySession(hash as string);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.employee_id !== parseInt(employee_id as string)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Get employee details for gender and marital status check
    const [employees] = await pool.query<RowDataPacket[]>(
      'SELECT gender, marital_status FROM employees WHERE id = ?',
      [employee_id]
    );

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employees[0];

    // Filter leave types based on employee gender and marital status
    let query = 'SELECT id, code, name as leave_type, days_per_year as max_days_per_year, requires_document, document_label, allow_half_days FROM leave_types WHERE status = ?';
    const params: any[] = ['active'];

    const gender = employee.gender; // 'Male' or 'Female'
    const maritalStatus = employee.marital_status; // 'married', 'single', etc (lowercase)

    // Paternity Leave: only for married males
    if (gender === 'Male' && maritalStatus === 'married') {
      // Show Paternity Leave, hide Maternity Leave
      query += ' AND name != ?';
      params.push('Maternity Leave');
    } else if (gender === 'Male' && maritalStatus !== 'married') {
      // Hide both Paternity and Maternity
      query += ' AND name NOT IN (?, ?)';
      params.push('Paternity Leave', 'Maternity Leave');
    }

    // Maternity Leave: only for married females
    if (gender === 'Female' && maritalStatus === 'married') {
      // Show Maternity Leave, hide Paternity Leave
      query += ' AND name != ?';
      params.push('Paternity Leave');
    } else if (gender === 'Female' && maritalStatus !== 'married') {
      // Hide both Maternity and Paternity
      query += ' AND name NOT IN (?, ?)';
      params.push('Maternity Leave', 'Paternity Leave');
    }

    // Other genders: hide both Paternity and Maternity
    if (gender !== 'Male' && gender !== 'Female') {
      query += ' AND name NOT IN (?, ?)';
      params.push('Paternity Leave', 'Maternity Leave');
    }

    query += ' ORDER BY name';

    const [types] = await pool.query<RowDataPacket[]>(query, params);

    return res.status(200).json({ types });
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return res.status(500).json({ error: 'Failed to fetch leave types' });
  }
}

