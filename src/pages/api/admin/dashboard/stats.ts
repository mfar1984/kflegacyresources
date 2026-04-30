import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { hash, dateRange, startDate, endDate } = req.query as {
    hash?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
  };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // Calculate date range
  let dateFilter = '';
  let compareStartDate = '';
  let compareEndDate = '';

  if (startDate && endDate) {
    // Custom date range
    dateFilter = `BETWEEN '${startDate}' AND '${endDate}'`;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const compareStart = new Date(start.getTime() - diff);
    const compareEnd = new Date(start.getTime() - 1);
    compareStartDate = compareStart.toISOString().split('T')[0];
    compareEndDate = compareEnd.toISOString().split('T')[0];
  } else {
    // Preset ranges
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '3months' ? 90 : 30;
    dateFilter = `>= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
    compareStartDate = `DATE_SUB(NOW(), INTERVAL ${days * 2} DAY)`;
    compareEndDate = `DATE_SUB(NOW(), INTERVAL ${days + 1} DAY)`;
  }

  try {
    // Key Metrics
    const [employeesRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'active'"
    );
    const employees = employeesRows[0];

    const [pendingLeaveRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending'"
    );
    const pendingLeave = pendingLeaveRows[0];

    const [pendingClaimsRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM claims WHERE status = 'pending'"
    );
    const pendingClaims = pendingClaimsRows[0];

    const [pendingOvertimeRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM overtime_applications WHERE status = 'pending'"
    );
    const pendingOvertime = pendingOvertimeRows[0];

    const [pendingExpensesRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM expenses WHERE status = 'pending'"
    );
    const pendingExpenses = pendingExpensesRows[0];

    const [pendingKpiRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM kpi_assignments WHERE status NOT IN ('approved','rejected')"
    );
    const pendingKpi = pendingKpiRows[0];

    const [pendingProcurementRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM procurement_applications WHERE status = 'pending'"
    );
    const pendingProcurement = pendingProcurementRows[0];

    const [pendingApplicantsRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM career_applicants WHERE status = 'pending'"
    );
    const pendingApplicants = pendingApplicantsRows[0];

    const [openTicketsRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM helpdesk_tickets WHERE status IN ('open', 'in_progress')"
    );
    const openTickets = openTicketsRows[0];

    const [activeJobsRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM career_postings WHERE status = 'published'"
    );
    const activeJobs = activeJobsRows[0];

    const [departmentsRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM departments"
    );
    const departments = departmentsRows[0];

    const [publishedNewsRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM news WHERE status = 'published'"
    );
    const publishedNews = publishedNewsRows[0];

    const [subscribersRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = 1"
    );
    const subscribers = subscribersRows[0];

    // Pending Tasks Breakdown for Pie Chart
    const pendingTasks = {
      leave: Number(pendingLeave?.count || 0),
      claims: Number(pendingClaims?.count || 0),
      overtime: Number(pendingOvertime?.count || 0),
      expenses: Number(pendingExpenses?.count || 0),
      kpi: Number(pendingKpi?.count || 0),
      procurement: Number(pendingProcurement?.count || 0),
      applicants: Number(pendingApplicants?.count || 0)
    };

    // Monthly Trends (Last 6 months) for Line Chart
    const monthlyTrends = await pool.query<RowDataPacket[]>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'Leave' as type,
        COUNT(*) as count
      FROM leave_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')

      UNION ALL

      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'Claims' as type,
        COUNT(*) as count
      FROM claims
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')

      UNION ALL

      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'Overtime' as type,
        COUNT(*) as count
      FROM overtime_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')

      UNION ALL

      SELECT
        DATE_FORMAT(applied_date, '%Y-%m') as month,
        'Expenses' as type,
        COUNT(*) as count
      FROM expenses
      WHERE applied_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(applied_date, '%Y-%m')

      ORDER BY month ASC
    `);

    // Department Stats for Bar Chart
    const departmentStats = await pool.query<RowDataPacket[]>(`
      SELECT 
        d.name as department,
        COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      GROUP BY d.id, d.name
      ORDER BY employee_count DESC
      LIMIT 10
    `);

    // Financial Overview (Monthly amounts)
    const [financialTrends] = await pool.query<RowDataPacket[]>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'Claims' as type,
        SUM(total_amount) as amount
      FROM claims
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')

      UNION ALL

      SELECT
        DATE_FORMAT(applied_date, '%Y-%m') as month,
        'Expenses' as type,
        SUM(total_amount) as amount
      FROM expenses
      WHERE applied_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(applied_date, '%Y-%m')

      UNION ALL

      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'Overtime' as type,
        SUM(total_amount) as amount
      FROM overtime_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')

      ORDER BY month ASC
    `);

    // Leave Types Distribution
    const [leaveTypes] = await pool.query<RowDataPacket[]>(`
      SELECT
        lt.name as leave_type,
        COUNT(la.id) as count
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY lt.id, lt.name
      ORDER BY count DESC
    `);

    // Ticket Status Distribution
    const [ticketStats] = await pool.query<RowDataPacket[]>(`
      SELECT
        status,
        COUNT(*) as count
      FROM helpdesk_tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY status
      ORDER BY count DESC
    `);

    // Top Expense Categories
    const [expenseCategories] = await pool.query<RowDataPacket[]>(`
      SELECT
        ec.name as category,
        COUNT(e.id) as count,
        SUM(e.total_amount) as total_amount
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.applied_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY ec.id, ec.name
      ORDER BY total_amount DESC
      LIMIT 5
    `);

    // Comparison with Previous Period
    const [prevEmployees] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'active' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    const [prevPendingLeave] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    // Critical Alerts
    const [oldPendingLeave] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 3 DAY)"
    );

    const [oldPendingClaims] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM claims WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 3 DAY)"
    );

    const [oldPendingExpenses] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM expenses WHERE status = 'pending' AND applied_date < DATE_SUB(NOW(), INTERVAL 3 DAY)"
    );

    // Recent Activities (Last 10)
    const [recentActivitiesRows] = await pool.query<RowDataPacket[]>(`
      (SELECT
        'Leave' as module,
        COALESCE(e.full_name, 'Unknown') as user_name,
        CAST(la.status AS CHAR) as status,
        la.created_at as timestamp
      FROM leave_applications la
      LEFT JOIN employees e ON la.employee_id = e.id
      ORDER BY la.created_at DESC
      LIMIT 3)

      UNION ALL

      (SELECT
        'Claims' as module,
        COALESCE(e.full_name, 'Unknown') as user_name,
        CAST(c.status AS CHAR) as status,
        c.created_at as timestamp
      FROM claims c
      LEFT JOIN employees e ON c.employee_id = e.id
      ORDER BY c.created_at DESC
      LIMIT 3)

      UNION ALL

      (SELECT
        'Overtime' as module,
        COALESCE(e.full_name, 'Unknown') as user_name,
        CAST(oa.status AS CHAR) as status,
        oa.created_at as timestamp
      FROM overtime_applications oa
      LEFT JOIN employees e ON oa.employee_id = e.id
      ORDER BY oa.created_at DESC
      LIMIT 2)

      UNION ALL

      (SELECT
        'Expenses' as module,
        COALESCE(e.full_name, 'Unknown') as user_name,
        CAST(ex.status AS CHAR) as status,
        ex.applied_date as timestamp
      FROM expenses ex
      LEFT JOIN employees e ON ex.employee_id = e.id
      ORDER BY ex.applied_date DESC
      LIMIT 2)

      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Calculate comparisons
    const currentEmployees = Number(employees?.count || 0);
    const previousEmployees = Number(prevEmployees[0]?.count || 0);
    const employeeChange = currentEmployees - previousEmployees;
    const employeeChangePercent = previousEmployees > 0 ? ((employeeChange / previousEmployees) * 100).toFixed(1) : '0';

    const currentPendingApprovals = Object.values(pendingTasks).reduce((a, b) => a + b, 0);
    const previousPendingApprovals = Number(prevPendingLeave[0]?.count || 0);
    const approvalsChange = currentPendingApprovals - previousPendingApprovals;
    const approvalsChangePercent = previousPendingApprovals > 0 ? ((approvalsChange / previousPendingApprovals) * 100).toFixed(1) : '0';

    return res.status(200).json({
      keyMetrics: {
        totalEmployees: currentEmployees,
        pendingApprovals: currentPendingApprovals,
        openTickets: Number(openTickets?.count || 0),
        activeJobs: Number(activeJobs?.count || 0)
      },
      comparisons: {
        employees: {
          current: currentEmployees,
          previous: previousEmployees,
          change: employeeChange,
          changePercent: employeeChangePercent,
          trend: employeeChange >= 0 ? 'up' : 'down'
        },
        approvals: {
          current: currentPendingApprovals,
          previous: previousPendingApprovals,
          change: approvalsChange,
          changePercent: approvalsChangePercent,
          trend: approvalsChange >= 0 ? 'up' : 'down'
        }
      },
      alerts: {
        oldPendingLeave: Number(oldPendingLeave[0]?.count || 0),
        oldPendingClaims: Number(oldPendingClaims[0]?.count || 0),
        oldPendingExpenses: Number(oldPendingExpenses[0]?.count || 0)
      },
      pendingTasks,
      monthlyTrends: monthlyTrends[0],
      financialTrends,
      leaveTypes,
      ticketStats,
      expenseCategories,
      departmentStats: departmentStats[0],
      recentActivities: recentActivitiesRows,
      quickStats: {
        departments: Number(departments?.count || 0),
        publishedNews: Number(publishedNews?.count || 0),
        subscribers: Number(subscribers?.count || 0),
        newHires: 0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}

