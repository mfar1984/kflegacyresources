import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
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
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash, id } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    if (!hasPermission(userPermissions, 'payroll_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const [records] = await pool.query<RowDataPacket[]>(
        `SELECT 
          pr.*,
          e.employee_id as employee_number,
          e.full_name as employee_name,
          e.ic_number,
          e.epf_number,
          e.socso_number,
          e.tax_number,
          e.bank_name,
          e.bank_account_number,
          d.name as department_name,
          pp.period_name,
          pp.period_month,
          pp.period_year,
          pp.start_date,
          pp.end_date,
          pp.payment_date
        FROM payroll_records pr
        INNER JOIN employees e ON pr.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        INNER JOIN payroll_periods pp ON pr.payroll_period_id = pp.id
        WHERE pr.id = ?`,
        [id]
      );

      if (!records || records.length === 0) {
        return res.status(404).json({ error: 'Payroll record not found' });
      }

      // Compute EPF base: basic + allowances + bonus + commission (exclude overtime)
      const r: any = records[0];
      // If bonuses/commissions were approved after processing, reflect latest approved sums for display
      let latestBonus = 0;
      let latestCommission = 0;
      try {
        const [bRows] = await pool.query<RowDataPacket[]>(
          `SELECT COALESCE(SUM(amount),0) as total
           FROM employee_bonuses WHERE employee_id = ? AND payroll_period_id = ? AND status = 'approved'`,
          [r.employee_id, r.payroll_period_id]
        );
        latestBonus = Number(bRows?.[0]?.total || 0);
        const [cRows] = await pool.query<RowDataPacket[]>(
          `SELECT COALESCE(SUM(amount),0) as total
           FROM employee_commissions WHERE employee_id = ? AND payroll_period_id = ? AND status = 'approved'`,
          [r.employee_id, r.payroll_period_id]
        );
        latestCommission = Number(cRows?.[0]?.total || 0);
      } catch {}

      const bonus_amount = latestBonus || Number(r.bonus_amount || 0);
      const commission_amount = latestCommission || Number(r.commission_amount || 0);
      const toNum = (v: any) => (v == null ? 0 : typeof v === 'number' ? v : parseFloat(String(v)) || 0);
      const epfBase = toNum(r.basic_salary) + toNum(r.housing_allowance) + toNum(r.transport_allowance) + toNum(r.meal_allowance) + toNum(r.other_allowances) + toNum(bonus_amount) + toNum(commission_amount);
      const computed_epf_employee = epfBase * 0.11;
      const computed_epf_employer = epfBase * 0.13;

      // Recompute totals for display so payslip shows correct numbers without needing to re-process
      const computed_gross_salary = toNum(r.basic_salary) + toNum(r.housing_allowance) + toNum(r.transport_allowance) + toNum(r.meal_allowance) + toNum(r.other_allowances) + toNum(r.overtime_amount) + toNum(bonus_amount) + toNum(commission_amount);
      const computed_total_deductions = computed_epf_employee + toNum(r.socso_employee) + toNum(r.eis_employee) + toNum(r.tax_deduction) + toNum(r.loan_deduction) + toNum(r.advance_deduction) + toNum(r.other_deductions);
      const computed_net_salary = computed_gross_salary - computed_total_deductions;

      const adjusted = {
        ...r,
        bonus_amount,
        commission_amount,
        gross_salary: computed_gross_salary,
        epf_employee: computed_epf_employee,
        epf_employer: computed_epf_employer,
        total_deductions: computed_total_deductions,
        net_salary: computed_net_salary
      };

      return res.status(200).json({ record: adjusted });
    } catch (error) {
      console.error('Payroll record fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch payroll record' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasPermission(userPermissions, 'payroll_delete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Check if payroll record exists and get its status and period_id
      const [records] = await pool.query<RowDataPacket[]>(
        'SELECT id, status, payroll_period_id FROM payroll_records WHERE id = ?',
        [id]
      );

      if (!records || records.length === 0) {
        return res.status(404).json({ error: 'Payroll record not found' });
      }

      const payroll_period_id = records[0].payroll_period_id;

      // Only allow deletion of draft or cancelled payslips
      if (records[0].status !== 'draft' && records[0].status !== 'cancelled') {
        return res.status(400).json({ error: 'Only draft or cancelled payslips can be deleted' });
      }

      // Delete the payroll record
      await pool.query<ResultSetHeader>(
        'DELETE FROM payroll_records WHERE id = ?',
        [id]
      );

      // Check if there are any remaining payroll records for this period
      const [remaining] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM payroll_records WHERE payroll_period_id = ?',
        [payroll_period_id]
      );

      // If no payslips remain, revert period status back to "draft" so it can be processed again
      if (remaining[0].count === 0) {
        await pool.query<ResultSetHeader>(
          `UPDATE payroll_periods 
           SET status = 'draft', 
               total_employees = 0,
               total_gross_salary = 0,
               total_deductions = 0,
               total_net_salary = 0,
               processed_date = NULL,
               processed_by = NULL
           WHERE id = ?`,
          [payroll_period_id]
        );

        return res.status(200).json({ 
          message: 'Payroll record deleted successfully. Period status reverted to draft (no payslips remaining).',
          periodReverted: true
        });
      }

      return res.status(200).json({ message: 'Payroll record deleted successfully' });
    } catch (error) {
      console.error('Payroll record deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete payroll record' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

