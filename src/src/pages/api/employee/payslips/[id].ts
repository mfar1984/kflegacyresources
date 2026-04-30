import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifyEmployeeSession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0] as any;
  if (new Date(s.expires_at) < new Date()) return null;
  if (s.user_type !== 'employee') return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store');

  const { id, hash } = req.query as { id?: string; hash?: string };

  const session = await verifyEmployeeSession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [records] = await pool.query<RowDataPacket[]>(
      `SELECT 
         pr.*,
         e.employee_id AS employee_number,
         e.full_name AS employee_name,
         e.ic_number,
         e.bank_name,
         e.bank_account_number,
         d.name AS department_name,
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
       WHERE pr.id = ? AND pr.employee_id = ?
       LIMIT 1`,
      [Number(id), Number(session.employee_id)]
    );

    if (!records || records.length === 0) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    const r: any = records[0];

    // Pull latest approved bonus/commission for this employee/period for display
    let latestBonus = 0;
    let latestCommission = 0;
    try {
      const [bRows] = await pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(amount),0) AS total
         FROM employee_bonuses WHERE employee_id = ? AND payroll_period_id = ? AND status = 'approved'`,
        [r.employee_id, r.payroll_period_id]
      );
      latestBonus = Number((bRows?.[0] as any)?.total || 0);
      const [cRows] = await pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(amount),0) AS total
         FROM employee_commissions WHERE employee_id = ? AND payroll_period_id = ? AND status = 'approved'`,
        [r.employee_id, r.payroll_period_id]
      );
      latestCommission = Number((cRows?.[0] as any)?.total || 0);
    } catch {}

    const toNum = (v: any) => (v == null ? 0 : typeof v === 'number' ? v : parseFloat(String(v)) || 0);

    const bonus_amount = latestBonus || toNum(r.bonus_amount);
    const commission_amount = latestCommission || toNum(r.commission_amount);

    // Recompute view-only figures to keep display correct
    const epfBase = toNum(r.basic_salary) + toNum(r.housing_allowance) + toNum(r.transport_allowance) + toNum(r.meal_allowance) + toNum(r.other_allowances) + bonus_amount + commission_amount;
    const computed_epf_employee = epfBase * 0.11;
    const computed_epf_employer = epfBase * 0.13;
    const computed_gross_salary = toNum(r.basic_salary) + toNum(r.housing_allowance) + toNum(r.transport_allowance) + toNum(r.meal_allowance) + toNum(r.other_allowances) + toNum(r.overtime_amount) + bonus_amount + commission_amount;
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
    console.error('Employee payslip record error:', error);
    return res.status(500).json({ error: 'Failed to fetch payslip' });
  }
}


