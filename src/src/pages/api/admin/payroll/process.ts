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

async function getAdminId(username: string): Promise<number> {
  const [admins] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  return admins[0]?.id || 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'POST') {
    if (!hasPermission(userPermissions, 'payroll_process')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { period_id } = req.body;

      if (!period_id) {
        return res.status(400).json({ error: 'Period ID is required' });
      }

      // Get period details
      const [periods] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM payroll_periods WHERE id = ? AND status = "draft"',
        [period_id]
      );

      if (!periods || periods.length === 0) {
        return res.status(400).json({ error: 'Period not found or already processed' });
      }

      const period = periods[0];

      // Get all active employees
      const [employees] = await connection.query<RowDataPacket[]>(
        `SELECT 
          id, employee_id, full_name, basic_salary, allowances,
          epf_number, socso_number, tax_number,
          bank_name, bank_account_number
        FROM employees 
        WHERE status = 'active'`
      );

      if (!employees || employees.length === 0) {
        return res.status(400).json({ error: 'No active employees found' });
      }

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      // Generate payslips for each employee
      for (const employee of employees) {
        // Generate payslip number: PS-YYYYMM-XXX
        const yearMonth = `${period.period_year}${String(period.period_month).padStart(2, '0')}`;
        const prefix = `PS-${yearMonth}-`;
        
        const [maxResult] = await connection.query<RowDataPacket[]>(
          `SELECT payslip_number FROM payroll_records 
           WHERE payslip_number LIKE ? 
           ORDER BY payslip_number DESC LIMIT 1`,
          [`${prefix}%`]
        );
        
        let sequence = 1;
        if (maxResult && maxResult.length > 0) {
          const lastNumber = maxResult[0].payslip_number;
          const lastSeq = parseInt(lastNumber.split('-').pop() || '0');
          sequence = lastSeq + 1;
        }
        
        const payslip_number = `${prefix}${String(sequence).padStart(3, '0')}`;

        // Calculate salary components
        const basic_salary = parseFloat(employee.basic_salary) || 0;
        const allowances = parseFloat(employee.allowances) || 0;

        // Get approved overtime for this period
        const [overtimes] = await connection.query<RowDataPacket[]>(
          `SELECT SUM(total_hours * hourly_rate * otr.rate_multiplier) as total_overtime
           FROM overtime_applications oa
           LEFT JOIN overtime_rates otr ON oa.overtime_rate_id = otr.id
           WHERE oa.employee_id = ? 
             AND oa.status = 'approved'
             AND oa.overtime_date BETWEEN ? AND ?`,
          [employee.id, period.start_date, period.end_date]
        );
        const overtime_amount = parseFloat(overtimes[0]?.total_overtime) || 0;

        // ============ FETCH ALLOWANCES ============
        const [allowancesResult] = await connection.query<RowDataPacket[]>(
          `SELECT housing_allowance, transport_allowance, meal_allowance, other_allowances
           FROM employee_allowances
           WHERE employee_id = ? AND status = 'active'
           LIMIT 1`,
          [employee.id]
        );
        const housing = parseFloat(allowancesResult[0]?.housing_allowance) || 0;
        const transport = parseFloat(allowancesResult[0]?.transport_allowance) || 0;
        const meal = parseFloat(allowancesResult[0]?.meal_allowance) || 0;
        const other = parseFloat(allowancesResult[0]?.other_allowances) || 0;

        // ============ FETCH BONUSES FOR PERIOD ============
        const [bonusesResult] = await connection.query<RowDataPacket[]>(
          `SELECT SUM(amount) as total
           FROM employee_bonuses
           WHERE employee_id = ? AND payroll_period_id = ? AND status = 'approved'`,
          [employee.id, period_id]
        );
        let bonus = parseFloat(bonusesResult[0]?.total) || 0;

        // ============ FETCH KPI BONUS (from kpi_employee_results) ==========
        const [kpiBonusRows] = await connection.query<RowDataPacket[]>(
          `SELECT bonus_amount FROM kpi_employee_results WHERE period_id = ? AND employee_id = ? LIMIT 1`,
          [period_id, employee.id]
        );
        const kpi_bonus = parseFloat(kpiBonusRows[0]?.bonus_amount) || 0;
        bonus += kpi_bonus;

        // ============ FETCH COMMISSIONS FOR PERIOD ============
        const [commissionsResult] = await connection.query<RowDataPacket[]>(
          `SELECT SUM(amount) as total
           FROM employee_commissions
           WHERE employee_id = ? AND payroll_period_id = ? AND status = 'approved'`,
          [employee.id, period_id]
        );
        const commission = parseFloat(commissionsResult[0]?.total) || 0;

        // ============ FETCH ACTIVE LOAN ============
        const [loansResult] = await connection.query<RowDataPacket[]>(
          `SELECT id, monthly_installment, remaining_balance, paid_installments
           FROM employee_loans
           WHERE employee_id = ? AND status = 'active'
           LIMIT 1`,
          [employee.id]
        );
        const loan = loansResult[0] || null;
        const loan_deduction = loan ? parseFloat(loan.monthly_installment) : 0;

        // ============ FETCH ACTIVE ADVANCE ============
        const [advancesResult] = await connection.query<RowDataPacket[]>(
          `SELECT id, monthly_deduction, remaining_balance, paid_months
           FROM employee_advances
           WHERE employee_id = ? AND status = 'active'
           LIMIT 1`,
          [employee.id]
        );
        const advance = advancesResult[0] || null;
        const advance_deduction = advance ? parseFloat(advance.monthly_deduction) : 0;

        // Total wages for statutory contributions (exclude overtime)
        // EPF should include basic + allowances + bonus + commission (EXCLUDE overtime)
        const epf_base = basic_salary + housing + transport + meal + other + bonus + commission;
        const total_wages = basic_salary + housing + transport + meal + other; // keep for SOCSO/EIS as before

        // Calculate EPF (11% employee, 13% employer) based on epf_base
        const epf_employee = epf_base * 0.11;
        const epf_employer = epf_base * 0.13;

        // Calculate SOCSO (0.5% employee, 1.75% employer from basic + allowances)
        const socso_employee = total_wages * 0.005;
        const socso_employer = total_wages * 0.0175;

        // Calculate EIS (0.2% each from basic + allowances)
        const eis_employee = total_wages * 0.002;
        const eis_employer = total_wages * 0.002;

        // Tax deduction (simplified - actual calculation is complex)
        const tax_deduction = 0;

        // Insert payroll record
        await connection.query<ResultSetHeader>(
          `INSERT INTO payroll_records (
            payroll_period_id, employee_id, payslip_number,
            basic_salary, housing_allowance, transport_allowance, 
            meal_allowance, other_allowances, overtime_amount,
            bonus_amount, commission_amount,
            epf_employee, socso_employee, eis_employee,
            tax_deduction, loan_deduction, advance_deduction, other_deductions,
            epf_employer, socso_employer, eis_employer,
            payment_method, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
          [
            period_id,
            employee.id,
            payslip_number,
            basic_salary,
            housing,
            transport,
            meal,
            other,
            overtime_amount,
            bonus,
            commission,
            epf_employee,
            socso_employee,
            eis_employee,
            tax_deduction,
            loan_deduction,
            advance_deduction,
            0, // other_deductions
            epf_employer,
            socso_employer,
            eis_employer,
            'bank_transfer'
          ]
        );

        // ============ UPDATE LOAN BALANCE ============
        if (loan && loan_deduction > 0) {
          const newBalance = parseFloat(loan.remaining_balance) - loan_deduction;
          const newPaid = parseInt(loan.paid_installments) + 1;
          const newStatus = newBalance <= 0.01 ? 'completed' : 'active';
          
          await connection.query<ResultSetHeader>(
            `UPDATE employee_loans 
             SET remaining_balance = ?, paid_installments = ?, status = ?
             WHERE id = ?`,
            [Math.max(0, newBalance), newPaid, newStatus, loan.id]
          );
        }

        // ============ UPDATE ADVANCE BALANCE ============
        if (advance && advance_deduction > 0) {
          const newBalance = parseFloat(advance.remaining_balance) - advance_deduction;
          const newPaid = parseInt(advance.paid_months) + 1;
          const newStatus = newBalance <= 0.01 ? 'completed' : 'active';
          
          await connection.query<ResultSetHeader>(
            `UPDATE employee_advances 
             SET remaining_balance = ?, paid_months = ?, status = ?
             WHERE id = ?`,
            [Math.max(0, newBalance), newPaid, newStatus, advance.id]
          );
        }

        // Calculate totals (gross, net are auto-calculated by MySQL)
        const gross = basic_salary + housing + transport + meal + other + overtime_amount + bonus + commission;
        const deductions = epf_employee + socso_employee + eis_employee + tax_deduction + loan_deduction + advance_deduction;
        const net = gross - deductions;

        totalGross += gross;
        totalDeductions += deductions;
        totalNet += net;
      }

      // Get admin ID
      const adminId = await getAdminId(session.username);

      // Update payroll period
      await connection.query<ResultSetHeader>(
        `UPDATE payroll_periods SET
          status = 'processing',
          total_employees = ?,
          total_gross_salary = ?,
          total_deductions = ?,
          total_net_salary = ?,
          processed_by = ?,
          processed_date = NOW()
        WHERE id = ?`,
        [employees.length, totalGross, totalDeductions, totalNet, adminId, period_id]
      );

      await connection.commit();

      return res.status(200).json({ 
        message: 'Payroll processed successfully',
        total_employees: employees.length,
        total_payslips: employees.length
      });
    } catch (error) {
      await connection.rollback();
      console.error('Payroll processing error:', error);
      return res.status(500).json({ error: 'Failed to process payroll' });
    } finally {
      connection.release();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

