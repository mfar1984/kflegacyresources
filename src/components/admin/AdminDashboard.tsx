'use client';

import { useEffect, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts';

// Add spin animation
const spinStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;

interface DashboardStats {
  keyMetrics: {
    totalEmployees: number;
    pendingApprovals: number;
    openTickets: number;
    activeJobs: number;
  };
  comparisons?: {
    employees: {
      current: number;
      previous: number;
      change: number;
      changePercent: string;
      trend: 'up' | 'down';
    };
    approvals: {
      current: number;
      previous: number;
      change: number;
      changePercent: string;
      trend: 'up' | 'down';
    };
  };
  alerts?: {
    oldPendingLeave: number;
    oldPendingClaims: number;
    oldPendingExpenses: number;
  };
  pendingTasks: {
    leave: number;
    claims: number;
    overtime: number;
    expenses: number;
    kpi: number;
    procurement: number;
    applicants: number;
  };
  monthlyTrends: Array<{
    month: string;
    type: string;
    count: number;
  }>;
  financialTrends?: Array<{
    month: string;
    type: string;
    amount: number;
  }>;
  leaveTypes?: Array<{
    leave_type: string;
    count: number;
  }>;
  ticketStats?: Array<{
    status: string;
    count: number;
  }>;
  expenseCategories?: Array<{
    category: string;
    total_amount: number;
  }>;
  departmentStats: Array<{
    department: string;
    employee_count: number;
  }>;
  recentActivities: Array<{
    module: string;
    user_name: string;
    status: string;
    timestamp: string;
  }>;
  quickStats: {
    departments: number;
    publishedNews: number;
    subscribers: number;
    newHires: number;
  };
  lastUpdated?: string;
}

export default function AdminDashboard({ sessionHash }: { sessionHash: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchStats();
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard/stats?hash=${sessionHash}&dateRange=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert('PDF Export feature - Coming soon!');
  };

  const handleExportExcel = () => {
    alert('Excel Export feature - Coming soon!');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alert alert-danger" style={{ fontSize: '12px' }}>
        Failed to load dashboard statistics
      </div>
    );
  }

  // Prepare data for Pie Chart
  const pieData = [
    { name: 'Leave', value: stats.pendingTasks.leave, color: '#3b82f6' },
    { name: 'Claims', value: stats.pendingTasks.claims, color: '#10b981' },
    { name: 'Overtime', value: stats.pendingTasks.overtime, color: '#f59e0b' },
    { name: 'Expenses', value: stats.pendingTasks.expenses, color: '#ef4444' },
    { name: 'KPI', value: stats.pendingTasks.kpi, color: '#8b5cf6' },
    { name: 'Procurement', value: stats.pendingTasks.procurement, color: '#ec4899' },
    { name: 'Applicants', value: stats.pendingTasks.applicants, color: '#06b6d4' }
  ].filter(item => item.value > 0);

  // Prepare data for Line Chart (Group by month)
  const monthlyData: { [key: string]: any } = {};
  stats.monthlyTrends.forEach(item => {
    if (!monthlyData[item.month]) {
      monthlyData[item.month] = { month: item.month, Leave: 0, Claims: 0, Overtime: 0, Expenses: 0 };
    }
    monthlyData[item.month][item.type] = item.count;
  });
  const lineData = Object.values(monthlyData);

  // Prepare financial data
  const financialData: { [key: string]: any } = {};
  if (stats?.financialTrends) {
    stats.financialTrends.forEach(item => {
      if (!financialData[item.month]) {
        financialData[item.month] = { month: item.month, Claims: 0, Expenses: 0, Overtime: 0 };
      }
      financialData[item.month][item.type] = item.amount;
    });
  }
  const financialChartData = Object.values(financialData);

  return (
    <div>
      <style>{spinStyle}</style>
      {/* Header with Filters */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4 className="mb-0" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
              Dashboard
            </h4>
            <p className="mb-0 mt-1" style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Poppins' }}>
              Overview of your system metrics and activities
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'}`}
              style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', fontFamily: 'Poppins' }}
            >
              <i className={`bi bi-arrow-repeat ${autoRefresh ? 'spin' : ''}`}></i> Auto-refresh
            </button>
            <button
              onClick={fetchStats}
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', fontFamily: 'Poppins' }}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button
              onClick={handleExportPDF}
              className="btn btn-sm btn-outline-danger"
              style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', fontFamily: 'Poppins' }}
            >
              <i className="bi bi-file-pdf"></i> PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="btn btn-sm btn-outline-success"
              style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', fontFamily: 'Poppins' }}
            >
              <i className="bi bi-file-excel"></i> Excel
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="d-flex gap-3 align-items-center">
          <label style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Poppins', marginBottom: 0 }}>
            Date Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-select form-select-sm"
            style={{
              fontSize: '12px',
              width: '180px',
              padding: '8px 32px 8px 14px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontFamily: 'Poppins',
              backgroundPosition: 'right 10px center'
            }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
          </select>
          {stats?.lastUpdated && (
            <div className="ms-auto" style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Poppins' }}>
              Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Critical Alerts */}
      {stats?.alerts && (stats.alerts.oldPendingLeave > 0 || stats.alerts.oldPendingClaims > 0 || stats.alerts.oldPendingExpenses > 0) && (
        <div className="alert alert-warning border-0 shadow-sm mb-4" style={{ borderRadius: '8px' }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '20px' }}></i>
            <div>
              <strong style={{ fontSize: '12px', fontFamily: 'Poppins' }}>Critical Alerts</strong>
              <p className="mb-0" style={{ fontSize: '11px', fontFamily: 'Poppins' }}>
                {stats.alerts.oldPendingLeave > 0 && `${stats.alerts.oldPendingLeave} leave applications pending > 3 days. `}
                {stats.alerts.oldPendingClaims > 0 && `${stats.alerts.oldPendingClaims} claims pending > 3 days. `}
                {stats.alerts.oldPendingExpenses > 0 && `${stats.alerts.oldPendingExpenses} expenses pending > 3 days.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins' }}>
                    Total Employees
                  </p>
                  <h3 className="mb-0" style={{ fontSize: '28px', fontWeight: 700, color: '#0891b2', fontFamily: 'Poppins' }}>
                    {stats.keyMetrics.totalEmployees}
                  </h3>
                  {stats.comparisons?.employees && (
                    <div className="mt-1">
                      <span className={`badge ${stats.comparisons.employees.trend === 'up' ? 'bg-success' : 'bg-danger'}`}
                            style={{ fontSize: '10px', fontFamily: 'Poppins' }}>
                        <i className={`bi bi-arrow-${stats.comparisons.employees.trend}`}></i> {stats.comparisons.employees.changePercent}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, backgroundColor: '#e0f2fe' }}>
                  <i className="bi bi-people-fill" style={{ fontSize: 24, color: '#0891b2' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins' }}>
                    Pending Approvals
                  </p>
                  <h3 className="mb-0" style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', fontFamily: 'Poppins' }}>
                    {stats.keyMetrics.pendingApprovals}
                  </h3>
                  {stats.comparisons?.approvals && (
                    <div className="mt-1">
                      <span className={`badge ${stats.comparisons.approvals.trend === 'down' ? 'bg-success' : 'bg-danger'}`}
                            style={{ fontSize: '10px', fontFamily: 'Poppins' }}>
                        <i className={`bi bi-arrow-${stats.comparisons.approvals.trend}`}></i> {stats.comparisons.approvals.changePercent}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, backgroundColor: '#fef3c7' }}>
                  <i className="bi bi-hourglass-split" style={{ fontSize: 24, color: '#f59e0b' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins' }}>
                    Open Tickets
                  </p>
                  <h3 className="mb-0" style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626', fontFamily: 'Poppins' }}>
                    {stats.keyMetrics.openTickets}
              </h3>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, backgroundColor: '#fee2e2' }}>
                  <i className="bi bi-ticket-detailed-fill" style={{ fontSize: 24, color: '#dc2626' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Poppins' }}>
                    Active Job Postings
                  </p>
                  <h3 className="mb-0" style={{ fontSize: '28px', fontWeight: 700, color: '#059669', fontFamily: 'Poppins' }}>
                    {stats.keyMetrics.activeJobs}
                  </h3>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 48, height: 48, backgroundColor: '#d1fae5' }}>
                  <i className="bi bi-megaphone-fill" style={{ fontSize: 24, color: '#059669' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Monthly Trends Line Chart */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                Monthly Trends (Last 6 Months)
              </h6>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" style={{ fontSize: '11px' }} stroke="#6b7280" />
                  <YAxis style={{ fontSize: '11px' }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Leave" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Claims" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Overtime" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pending Tasks Pie Chart */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                Pending Tasks Breakdown
              </h6>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5" style={{ fontSize: '12px', color: '#6b7280' }}>
                  No pending tasks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview & Additional Charts */}
      {stats.financialTrends && financialChartData.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                  Financial Overview
                </h6>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialChartData}>
                    <defs>
                      <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOvertime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" style={{ fontSize: '11px' }} stroke="#6b7280" />
                    <YAxis style={{ fontSize: '11px' }} stroke="#6b7280" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="Claims" stroke="#3b82f6" fillOpacity={1} fill="url(#colorClaims)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                    <Area type="monotone" dataKey="Overtime" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOvertime)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Leave Types Distribution */}
          {stats.leaveTypes && stats.leaveTypes.length > 0 && (
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                    Leave Types
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.leaveTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ leave_type, percent }: any) => `${leave_type}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.leaveTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ticket Stats & Expense Categories */}
      <div className="row g-3 mb-4">
        {stats.ticketStats && stats.ticketStats.length > 0 && (
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                  Ticket Status Distribution
                </h6>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.ticketStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" style={{ fontSize: '11px' }} stroke="#6b7280" />
                    <YAxis dataKey="status" type="category" style={{ fontSize: '11px' }} stroke="#6b7280" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="count" fill="#0891b2" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {stats.expenseCategories && stats.expenseCategories.length > 0 && (
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                  Top Expense Categories
                </h6>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.expenseCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" style={{ fontSize: '11px' }} stroke="#6b7280" />
                    <YAxis dataKey="category" type="category" style={{ fontSize: '11px' }} stroke="#6b7280" width={100} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="total_amount" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Department Stats Bar Chart */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                Employees by Department
              </h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="department" style={{ fontSize: '11px' }} stroke="#6b7280" />
                  <YAxis style={{ fontSize: '11px' }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="employee_count" fill="#0891b2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats & Recent Activities */}
      <div className="row g-3">
        {/* Quick Stats */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                Quick Stats
              </h6>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>📊 Total Departments</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{stats.quickStats.departments}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>📰 Published News</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{stats.quickStats.publishedNews}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>📧 Newsletter Subscribers</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{stats.quickStats.subscribers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Poppins' }}>
                Recent Activities
              </h6>
              <div className="table-responsive">
                <table className="table table-sm" style={{ fontSize: '11px', marginBottom: 0 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ color: '#6b7280', fontWeight: 600, padding: '8px' }}>MODULE</th>
                      <th style={{ color: '#6b7280', fontWeight: 600, padding: '8px' }}>USER</th>
                      <th style={{ color: '#6b7280', fontWeight: 600, padding: '8px' }}>STATUS</th>
                      <th style={{ color: '#6b7280', fontWeight: 600, padding: '8px' }}>TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivities.map((activity, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px' }}>{activity.module}</td>
                        <td style={{ padding: '8px' }}>{activity.user_name || 'N/A'}</td>
                        <td style={{ padding: '8px' }}>
                          <span className={`badge ${
                            activity.status === 'approved' ? 'bg-success' :
                            activity.status === 'pending' ? 'bg-warning' :
                            activity.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
                          }`} style={{ fontSize: '10px' }}>
                            {activity.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>
                          {new Date(activity.timestamp).toLocaleString('en-MY', { 
                            day: '2-digit', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

