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

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userPermissions = await getUserPermissions(session.username);
  if (!hasPermission(userPermissions, 'overtime_view')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { month, status, employee_id } = req.query;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    // Month filter (default: current month)
    if (month) {
      conditions.push("DATE_FORMAT(overtime_date, '%Y-%m') = ?");
      params.push(month);
    } else {
      // Default to current month
      conditions.push("DATE_FORMAT(overtime_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')");
    }

    // Status filter
    if (status && status !== 'all') {
      conditions.push('oa.status = ?');
      params.push(status);
    }

    // Employee filter
    if (employee_id) {
      conditions.push('oa.employee_id = ?');
      params.push(employee_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get summary grouped by employee + month
    const [summaries] = await pool.query<RowDataPacket[]>(
      `SELECT 
        oa.employee_id,
        MAX(e.full_name) as employee_name,
        MAX(e.employee_id) as employee_code,
        DATE_FORMAT(oa.overtime_date, '%Y-%m') as month,
        MAX(DATE_FORMAT(oa.overtime_date, '%M %Y')) as month_display,
        COUNT(*) as total_applications,
        SUM(oa.total_hours) as total_hours,
        SUM(oa.total_amount) as total_amount,
        SUM(CASE WHEN oa.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN oa.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN oa.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN oa.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN oa.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        MIN(oa.overtime_date) as earliest_date,
        MAX(oa.overtime_date) as latest_date
      FROM overtime_applications oa
      INNER JOIN employees e ON oa.employee_id = e.id
      ${whereClause}
      GROUP BY oa.employee_id, DATE_FORMAT(oa.overtime_date, '%Y-%m')
      ORDER BY month DESC, employee_name ASC`,
      params
    );

    // Get overall stats
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_applications,
        COUNT(DISTINCT employee_id) as total_employees,
        SUM(total_hours) as total_hours,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_amount
      FROM overtime_applications oa
      ${whereClause}`,
      params
    );

    return res.status(200).json({
      summaries: summaries.map(s => ({
        employee_id: s.employee_id,
        employee_name: s.employee_name,
        employee_code: s.employee_code,
        month: s.month,
        month_display: s.month_display,
        total_applications: parseInt(s.total_applications),
        total_hours: parseFloat(s.total_hours || 0),
        total_amount: parseFloat(s.total_amount || 0),
        status_breakdown: {
          pending: parseInt(s.pending_count),
          approved: parseInt(s.approved_count),
          rejected: parseInt(s.rejected_count),
          paid: parseInt(s.paid_count),
          cancelled: parseInt(s.cancelled_count)
        },
        date_range: {
          earliest: s.earliest_date,
          latest: s.latest_date
        }
      })),
      stats: stats[0] ? {
        total_applications: parseInt(stats[0].total_applications),
        total_employees: parseInt(stats[0].total_employees),
        total_hours: parseFloat(stats[0].total_hours || 0),
        total_amount: parseFloat(stats[0].total_amount || 0),
        pending_count: parseInt(stats[0].pending_count),
        pending_amount: parseFloat(stats[0].pending_amount || 0)
      } : null
    });
  } catch (error) {
    console.error('Overtime summary error:', error);
    return res.status(500).json({ error: 'Failed to fetch overtime summary' });
  }
}

