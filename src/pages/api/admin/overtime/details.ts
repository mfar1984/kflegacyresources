import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash, employee_id, month } = req.query;
  
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userPermissions = await getUserPermissions(session.username);
  if (!hasPermission(userPermissions, 'overtime_view')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!employee_id || !month) {
    return res.status(400).json({ error: 'employee_id and month are required' });
  }

  try {
    // Get employee info
    const [employees] = await pool.query<RowDataPacket[]>(
      `SELECT e.id, e.full_name, e.employee_id as employee_number, e.basic_salary, 
              COALESCE(d.name, 'N/A') as department, e.position
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ? LIMIT 1`,
      [employee_id]
    );

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employees[0];

    // Get all overtime applications for this employee in this month
    const [applications] = await pool.query<RowDataPacket[]>(
      `SELECT 
        oa.id,
        oa.overtime_number,
        oa.project_name,
        oa.overtime_date,
        oa.start_time,
        oa.end_time,
        oa.total_hours,
        oa.hourly_rate,
        oa.overtime_rate_id,
        oa.total_amount,
        oa.reason,
        oa.remarks,
        oa.status,
        oa.applied_date,
        oa.reviewed_by,
        oa.reviewed_date,
        oa.review_remarks,
        oa.payment_date,
        otr.name as rate_name,
        otr.rate_multiplier,
        reviewer.username as reviewer_name
      FROM overtime_applications oa
      LEFT JOIN overtime_rates otr ON oa.overtime_rate_id = otr.id
      LEFT JOIN admins reviewer ON oa.reviewed_by = reviewer.id
      WHERE oa.employee_id = ?
        AND DATE_FORMAT(oa.overtime_date, '%Y-%m') = ?
      ORDER BY oa.overtime_date DESC, oa.overtime_number DESC`,
      [employee_id, month]
    );

    // Calculate summary for this specific employee + month
    const summary = {
      total_applications: applications.length,
      total_hours: applications.reduce((sum: number, app: any) => sum + parseFloat(app.total_hours || 0), 0),
      total_amount: applications.reduce((sum: number, app: any) => sum + parseFloat(app.total_amount || 0), 0),
      status_counts: {
        pending: applications.filter((app: any) => app.status === 'pending').length,
        approved: applications.filter((app: any) => app.status === 'approved').length,
        rejected: applications.filter((app: any) => app.status === 'rejected').length,
        paid: applications.filter((app: any) => app.status === 'paid').length,
        cancelled: applications.filter((app: any) => app.status === 'cancelled').length
      }
    };

    return res.status(200).json({
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        employee_number: employee.employee_number,
        basic_salary: parseFloat(employee.basic_salary),
        department: employee.department,
        position: employee.position
      },
      month,
      summary,
      applications: applications.map((app: any) => ({
        id: app.id,
        overtime_number: app.overtime_number,
        project_name: app.project_name,
        overtime_date: app.overtime_date,
        start_time: app.start_time,
        end_time: app.end_time,
        total_hours: parseFloat(app.total_hours),
        hourly_rate: parseFloat(app.hourly_rate),
        overtime_rate_id: app.overtime_rate_id,
        rate_name: app.rate_name,
        rate_multiplier: app.rate_multiplier ? parseFloat(app.rate_multiplier) : null,
        total_amount: parseFloat(app.total_amount),
        reason: app.reason,
        remarks: app.remarks,
        status: app.status,
        applied_date: app.applied_date,
        reviewed_by: app.reviewed_by,
        reviewer_name: app.reviewer_name,
        reviewed_date: app.reviewed_date,
        review_remarks: app.review_remarks,
        payment_date: app.payment_date
      }))
    });
  } catch (error) {
    console.error('Overtime details error:', error);
    return res.status(500).json({ error: 'Failed to fetch overtime details' });
  }
}

