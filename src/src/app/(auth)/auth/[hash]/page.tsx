"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGroupsManager from "@/components/admin/RoleGroupsManager";
import UsersManagement from "@/components/admin/UsersManagement";
import ProjectRecordsManagement from "@/components/admin/ProjectRecordsManagement";
import CareerManagement from "@/components/admin/CareerManagement";
import ApplicantsManagement from "@/components/admin/ApplicantsManagement";
import ArchiveManagement from "@/components/admin/ArchiveManagement";
import NewsManagement from "@/components/admin/NewsManagement";
import AchievementAwardsManagement from "@/components/admin/AchievementAwardsManagement";
import CertificatesManagement from "@/components/admin/CertificatesManagement";
import DownloadsManagement from "@/components/admin/DownloadsManagement";
import ProcurementManagement from "@/components/admin/ProcurementManagement";
import NewsSubscribersManagement from "@/components/admin/NewsSubscribersManagement";
import HelpdeskManagement from "@/components/admin/HelpdeskManagement";
import HelpdeskClientList from "@/components/admin/HelpdeskClientList";
import ClientHelpdesk from "@/components/client/ClientHelpdesk";
import NotificationBell from "@/components/NotificationBell";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import DepartmentManagement from "@/components/admin/DepartmentManagement";
import LeaveManagement from "@/components/admin/LeaveManagement";
import ClaimManagement from "@/components/admin/ClaimManagement";
import OvertimeManagement from "@/components/admin/OvertimeManagement";
import OvertimeDetails from "@/components/admin/OvertimeDetails";
import ExpensesManagement from "@/components/admin/ExpensesManagement";
import PayrollManagement from "@/components/admin/PayrollManagement";
import LeaveTypesManagement from "@/components/admin/LeaveTypesManagement";
import ClaimTypesManagement from "@/components/admin/ClaimTypesManagement";
import OvertimeRatesManagement from "@/components/admin/OvertimeRatesManagement";
import ExpenseCategoriesManagement from "@/components/admin/ExpenseCategoriesManagement";
import EmployeeDashboard from "@/components/admin/EmployeeDashboard";
import EmployeeLeave from "@/components/admin/EmployeeLeave";
import EmployeeClaims from "@/components/admin/EmployeeClaims";
import EmployeeOvertime from "@/components/admin/EmployeeOvertime";
import EmployeeExpenses from "@/components/admin/EmployeeExpenses";
import EmployeePayslips from "@/components/admin/EmployeePayslips";
import EmployeeProfile from "@/components/admin/EmployeeProfile";
import AllowancesManagement from "@/components/admin/AllowancesManagement";
import BonusManagement from "@/components/admin/BonusManagement";
import CommissionManagement from "@/components/admin/CommissionManagement";
import LoanManagement from "@/components/admin/LoanManagement";
import AdvanceManagement from "@/components/admin/AdvanceManagement";
import KpiTemplatesManagement from "@/components/admin/KpiTemplatesManagement";
import KpiPeriodsManagement from "@/components/admin/KpiPeriodsManagement";
import KpiAssignmentsManagement from "@/components/admin/KpiAssignmentsManagement";
import KpiReviewsManagement from "@/components/admin/KpiReviewsManagement";
import EmployeeKpis from "@/components/admin/EmployeeKpis";
import KpiCompetenciesManagement from "@/components/admin/KpiCompetenciesManagement";
import KpiGradeBandsManagement from "@/components/admin/KpiGradeBandsManagement";
import KpiResultsManagement from "@/components/admin/KpiResultsManagement";
import GlobalConfig from "@/components/admin/GlobalConfig";
import Integrations from "@/components/admin/Integrations";
import WeatherWidget from "@/components/admin/WeatherWidget";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AuthDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params?.hash as string;
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  // UI states to mirror kf-next pattern
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userType, setUserType] = useState<string>('admin');
  const [userRole, setUserRole] = useState<string>('admin'); // admin, hr, staff
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [taskCounts, setTaskCounts] = useState<{ overtime: number; leave: number; claims: number; expenses: number; kpi: number; applicants: number; procurement: number; }>({ overtime: 0, leave: 0, claims: 0, expenses: 0, kpi: 0, applicants: 0, procurement: 0 });

  // Get page title based on current view
  const getPageTitle = (view: string): string => {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'achievement': 'Achievement Awards',
      'career': 'Career Postings',
      'applicants': 'Applicants',
      'career-archive': 'Career Archive',
      'employees': 'Employee Management',
      'departments': 'Department Management',
      'leave': 'Leave Management',
      'leave-types': 'Leave Types Management',
      'claims': 'Claim Management',
      'claim-types': 'Claim Types Management',
      'overtime': 'Overtime Management',
      'overtime-rates': 'Overtime Rates Management',
      'expenses': 'Expenses',
      'expense-categories': 'Expense Categories Management',
      'payroll': 'Payroll',
      'allowances': 'Allowances Management',
      'bonuses': 'Bonus Management',
      'commissions': 'Commission Management',
      'loans': 'Loan Management',
      'advances': 'Advance Management',
      // KPI
      'kpi-templates': 'KPI Templates',
      'kpi-periods': 'KPI Periods',
      'kpi-assignments': 'KPI Assignments',
      'kpi-reviews': 'KPI Reviews',
      'kpi-results': 'KPI Results',
      'kpi-competencies': 'KPI Competencies',
      'kpi-grades': 'KPI Grade Bands',
      // Settings
      'global-config': 'Global Configuration',
      'integrations': 'Integrations',
      'my-profile': 'My Profile',
      'my-leave': 'My Leave',
      'my-claims': 'My Claims',
      'my-overtime': 'My Overtime',
      'my-payslip': 'My Payslip',
      'employee-kpis': 'My KPIs',
      'certificates': 'Certificates',
      'downloads': 'Downloads',
      'news': 'News / Blogs',
      'news-subscribers': 'Newsletter Subscribers',
      'procurement': 'Procurement',
      'projects': 'Project Records',
      'helpdesk': 'Helpdesk',
      'helpdesk-board': 'Helpdesk Board',
      'helpdesk-clients': 'Client List',
      'client-helpdesk': 'My Tickets',
      'role-groups': 'Role Groups',
      'users': 'Users',
      'activity-logs': 'Activity Logs'
    };
    return titles[view] || (userType === 'client' ? 'My Tickets' : 'Dashboard');
  };

  // Get breadcrumb hierarchy for current view
  const getBreadcrumbs = (view: string): Array<{ label: string; active: boolean }> => {
    // Human Resources submenu items
    const hrCareerPages = ['career', 'applicants', 'career-archive'];
    const hrEmployeePages = ['employees', 'departments'];
    const hrLeavePages = ['leave', 'leave-types'];
    const hrClaimPages = ['claims', 'claim-types'];
    const hrOvertimePages = ['overtime', 'overtime-rates'];
    const hrExpensesPages = ['expenses', 'expense-categories'];
    const hrKpiPages = ['kpi-templates', 'kpi-periods', 'kpi-assignments', 'kpi-reviews', 'kpi-results', 'kpi-competencies', 'kpi-grades'];
    const hrPayrollPages = ['payroll', 'allowances', 'bonuses', 'commissions', 'loans', 'advances'];
    
    // Web Tools submenu items
    const webToolsPages = ['achievement', 'certificates', 'downloads', 'news', 'procurement', 'projects'];
    
    // Helpdesk submenu items
    const helpdeskPages = ['helpdesk-board', 'helpdesk-clients'];
    
    // Settings submenu items
    const settingsPages = ['global-config', 'integrations', 'role-groups', 'users', 'activity-logs'];
    
    const breadcrumbs: Array<{ label: string; active: boolean }> = [];
    
    // Human Resources hierarchy
    if (hrCareerPages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Career', active: false });
    } else if (hrEmployeePages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Employee Management', active: false });
    } else if (hrLeavePages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Leave Management', active: false });
    } else if (hrClaimPages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Claim Management', active: false });
    } else if (hrOvertimePages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Overtime Management', active: false });
    } else if (hrExpensesPages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Expenses', active: false });
    } else if (hrKpiPages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'KPI', active: false });
    } else if (hrPayrollPages.includes(view)) {
      breadcrumbs.push({ label: 'Human Resources', active: false });
      breadcrumbs.push({ label: 'Payroll & Compensation', active: false });
    }
    // Web Tools hierarchy
    else if (webToolsPages.includes(view)) {
      breadcrumbs.push({ label: 'Web Tools', active: false });
    }
    // Helpdesk hierarchy
    else if (helpdeskPages.includes(view)) {
      breadcrumbs.push({ label: 'Helpdesk', active: false });
    }
    // Settings hierarchy
    else if (settingsPages.includes(view)) {
      breadcrumbs.push({ label: 'Settings', active: false });
    }
    
    // Add current page
    breadcrumbs.push({ label: getPageTitle(view), active: true });
    
    return breadcrumbs;
  };

  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission);
  };

  useEffect(() => {
    const fetchPermissions = async (type: string) => {
      try {
        // Only fetch admin permissions if userType is admin
        if (type === 'admin') {
          const response = await fetch(`/api/admin/user-permissions?hash=${hash}`);
          if (response.ok) {
            const data = await response.json();
            setUserPermissions(data.permissions || []);
            setAdminId(data.adminId || null);
            setUserRole(data.userRole || 'admin');
          }
        } else {
          // Clients don't have traditional admin permissions, set a default for client-specific views
          setUserPermissions(['client_helpdesk_view']);
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
      }
    };

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?hash=${hash}`);
        const data = await res.json();
        if (res.ok && data?.valid) {
          setAuthenticated(true);
          setUsername(data.username || "User");
          setUserType(data.userType || 'admin');
          setClientId(data.clientId || null);
          setEmployeeId(data.employeeId || null);

          if (data.userType === 'client') {
            setCurrentView('client-helpdesk');
          } else if (data.userType === 'employee') {
            setCurrentView('employee-dashboard');
          } else {
            setCurrentView('dashboard');
          }
          await fetchPermissions(data.userType);
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    if (hash) verify(); else router.push("/admin/login");
  }, [hash, router]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      setCurrentTime(formatted);
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  // Handle click-through navigation from NotificationBell
  useEffect(() => {
    const handler = (e: any) => {
      const targetView = e?.detail;
      if (typeof targetView === 'string' && targetView.length > 0) {
        setCurrentView(targetView);
      }
    };
    window.addEventListener('navigate_to_view' as any, handler);
    return () => window.removeEventListener('navigate_to_view' as any, handler);
  }, []);

  // Poll pending task counts (sidebar badges)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const fetchCounts = async () => {
      if (!hash || userType !== 'admin') return;
      try {
        const res = await fetch(`/api/admin/tasks/counts?hash=${hash}`, { cache: 'no-store' as any });
        if (res.ok) {
          const data = await res.json();
          setTaskCounts({
            overtime: Number(data.overtime || 0),
            leave: Number(data.leave || 0),
            claims: Number(data.claims || 0),
            expenses: Number(data.expenses || 0),
            kpi: Number(data.kpi || 0),
            applicants: Number(data.applicants || 0),
            procurement: Number(data.procurement || 0),
          });
        }
      } catch {}
    };
    fetchCounts();
    timer = setInterval(fetchCounts, 60000);
    return () => { if (timer) clearInterval(timer); };
  }, [hash, userType]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });
    } finally {
      router.push("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <>
      <link rel="stylesheet" href="/assets/css/admin-dashboard.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons&display=optional" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined&display=optional" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" rel="stylesheet" />

      <div className="admin-body" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/logo.png" alt="ANSAR" style={{ height: 48 }} />
          </div>
          <nav className="sidebar-nav">
            <div>
              {hasPermission('dashboard_view') && userType !== 'employee' && (
                <button onClick={() => setCurrentView('dashboard')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                  <i className="bi bi-speedometer2 sidebar-nav-icon"></i>
                  <span>Dashboard</span>
                </button>
              )}

              {/* Employee Self-Service Menu */}
              {userType === 'employee' && (
                <>
                  <button onClick={() => setCurrentView('employee-dashboard')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-speedometer2 sidebar-nav-icon"></i>
                    <span>Dashboard</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-leave')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-calendar-check sidebar-nav-icon"></i>
                    <span>My Leave</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-claims')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-receipt sidebar-nav-icon"></i>
                    <span>My Claims</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-overtime')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-clock-history sidebar-nav-icon"></i>
                    <span>My Overtime</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-expenses')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-wallet sidebar-nav-icon"></i>
                    <span>My Expenses</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-payslips')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-file-earmark-text sidebar-nav-icon"></i>
                    <span>My Payslips</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-kpis')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-bar-chart-line sidebar-nav-icon"></i>
                    <span>My KPIs</span>
                  </button>
                  <button onClick={() => setCurrentView('employee-profile')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-person-circle sidebar-nav-icon"></i>
                    <span>My Profile</span>
                  </button>
                </>
              )}

              {/* Staff-Only Menu Items */}
              {userRole === 'staff' && userType !== 'employee' && (
                <>
                  <button onClick={() => setCurrentView('my-profile')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-person-circle sidebar-nav-icon"></i>
                    <span>My Profile</span>
                  </button>
                  <button onClick={() => setCurrentView('my-leave')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-calendar-check sidebar-nav-icon"></i>
                    <span>My Leave</span>
                  </button>
                  <button onClick={() => setCurrentView('my-claims')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-receipt sidebar-nav-icon"></i>
                    <span>My Claims</span>
                  </button>
                  <button onClick={() => setCurrentView('my-overtime')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-clock-history sidebar-nav-icon"></i>
                    <span>My Overtime</span>
                  </button>
                  <button onClick={() => setCurrentView('my-payslip')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                    <i className="bi bi-wallet2 sidebar-nav-icon"></i>
                    <span>My Payslip</span>
                  </button>
                </>
              )}

              {/* Human Resources - Main Menu (Hidden for Staff and Employees) */}
              {userRole !== 'staff' && userType !== 'employee' && (hasPermission('career_view') || hasPermission('applicants_read') || hasPermission('career_archive_read') || 
                hasPermission('employees_view') || hasPermission('departments_view') || hasPermission('leave_view') || hasPermission('claims_view') || 
                hasPermission('overtime_view') || hasPermission('expenses_view') || hasPermission('payroll_view')) && (
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'hr' ? null : 'hr')}
                    className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                    style={{ outline: 'none' }}
                  >
                    <i className="bi bi-people sidebar-nav-icon"></i>
                    <span style={{ flex: 1 }}>Human Resources</span>
                    <i className={`bi ${activeSection === 'hr' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                  </button>
                  {activeSection === 'hr' && (
                    <div className="submenu-container">
                      {/* Career Submenu */}
                      {(hasPermission('career_view') || hasPermission('applicants_read') || hasPermission('career_archive_read')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'career' ? null : 'career')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Career</span>
                            {taskCounts.applicants > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.applicants}</span>}
                            <i className={`bi ${activeSubSection === 'career' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'career' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('career_view') && (
                                <button onClick={() => setCurrentView('career')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Career Postings</button>
                              )}
                              {hasPermission('applicants_read') && (
                                <button onClick={() => setCurrentView('applicants')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Applicants</button>
                              )}
                              {hasPermission('career_archive_read') && (
                                <button onClick={() => setCurrentView('career-archive')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Archive</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Employee Management Submenu */}
                      {(hasPermission('employees_view') || hasPermission('departments_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'employee' ? null : 'employee')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Employee Management</span>
                            <i className={`bi ${activeSubSection === 'employee' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'employee' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('employees_view') && (
                                <button onClick={() => setCurrentView('employees')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Employee List</button>
                              )}
                              {hasPermission('departments_view') && (
                                <button onClick={() => setCurrentView('departments')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Department List</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Leave Management Submenu */}
                      {(hasPermission('leave_view') || hasPermission('leave_types_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'leave' ? null : 'leave')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Leave Management</span>
                            {taskCounts.leave > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.leave}</span>}
                            <i className={`bi ${activeSubSection === 'leave' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'leave' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('leave_view') && (
                                <button onClick={() => setCurrentView('leave')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Leave Applications</button>
                              )}
                              {hasPermission('leave_types_view') && (
                                <button onClick={() => setCurrentView('leave-types')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Leave Types</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Claim Management Submenu */}
                      {(hasPermission('claims_view') || hasPermission('claim_types_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'claim' ? null : 'claim')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Claim Management</span>
                            {taskCounts.claims > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.claims}</span>}
                            <i className={`bi ${activeSubSection === 'claim' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'claim' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('claims_view') && (
                                <button onClick={() => setCurrentView('claims')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Claim Applications</button>
                              )}
                              {hasPermission('claim_types_view') && (
                                <button onClick={() => setCurrentView('claim-types')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Claim Types</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Overtime Management Submenu */}
                      {(hasPermission('overtime_view') || hasPermission('overtime_rates_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'overtime' ? null : 'overtime')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Overtime Management</span>
                            {taskCounts.overtime > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.overtime}</span>}
                            <i className={`bi ${activeSubSection === 'overtime' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'overtime' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('overtime_view') && (
                                <button onClick={() => setCurrentView('overtime')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Overtime Applications</button>
                              )}
                              {hasPermission('overtime_rates_view') && (
                                <button onClick={() => setCurrentView('overtime-rates')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Overtime Rates</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Expenses Submenu */}
                      {(hasPermission('expenses_view') || hasPermission('expense_categories_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'expenses' ? null : 'expenses')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Expenses</span>
                            {taskCounts.expenses > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.expenses}</span>}
                            <i className={`bi ${activeSubSection === 'expenses' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'expenses' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('expenses_view') && (
                                <button onClick={() => setCurrentView('expenses')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Expense Applications</button>
                              )}
                              {hasPermission('expense_categories_view') && (
                                <button onClick={() => setCurrentView('expense-categories')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Expense Categories</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* KPI Submenu */}
                      {(hasPermission('kpi_templates_view') || hasPermission('kpi_periods_view') || hasPermission('kpi_assignments_view') || hasPermission('kpi_reviews_view') || hasPermission('kpi_competencies_view') || hasPermission('kpi_grades_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'kpi' ? null : 'kpi')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>KPI</span>
                            {taskCounts.kpi > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.kpi}</span>}
                            <i className={`bi ${activeSubSection === 'kpi' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'kpi' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('kpi_templates_view') && (
                                <button onClick={() => setCurrentView('kpi-templates')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Templates</button>
                              )}
                              {hasPermission('kpi_periods_view') && (
                                <button onClick={() => setCurrentView('kpi-periods')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Periods</button>
                              )}
                              {hasPermission('kpi_assignments_view') && (
                                <button onClick={() => setCurrentView('kpi-assignments')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Assignments</button>
                              )}
                              {hasPermission('kpi_reviews_view') && (
                                <button onClick={() => setCurrentView('kpi-reviews')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Reviews</button>
                              )}
                              {hasPermission('kpi_reviews_view') && (
                                <button onClick={() => setCurrentView('kpi-results')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Results</button>
                              )}
                              {hasPermission('kpi_competencies_view') && (
                                <button onClick={() => setCurrentView('kpi-competencies')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Competencies</button>
                              )}
                              {hasPermission('kpi_grades_view') && (
                                <button onClick={() => setCurrentView('kpi-grades')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>KPI Grade Bands</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payroll & Compensation Submenu */}
                      {(hasPermission('payroll_view') || hasPermission('allowances_view') || hasPermission('bonuses_view') || hasPermission('commissions_view') || hasPermission('loans_view') || hasPermission('advances_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'payroll' ? null : 'payroll')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>Payroll & Compensation</span>
                            <i className={`bi ${activeSubSection === 'payroll' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'payroll' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('payroll_view') && (
                                <button onClick={() => setCurrentView('payroll')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Payroll Periods</button>
                              )}
                              {hasPermission('allowances_view') && (
                                <button onClick={() => setCurrentView('allowances')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Allowances Management</button>
                              )}
                              {hasPermission('bonuses_view') && (
                                <button onClick={() => setCurrentView('bonuses')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Bonus Management</button>
                              )}
                              {hasPermission('commissions_view') && (
                                <button onClick={() => setCurrentView('commissions')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Commission Management</button>
                              )}
                              {hasPermission('loans_view') && (
                                <button onClick={() => setCurrentView('loans')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Loan Management</button>
                              )}
                              {hasPermission('advances_view') && (
                                <button onClick={() => setCurrentView('advances')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Advance Management</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Web Tools - Main Menu (Hidden for Staff) */}
              {userRole !== 'staff' && (hasPermission('achievement_view') || hasPermission('certificates_view') || hasPermission('downloads_view') || hasPermission('news_view') || hasPermission('procurement_view') || hasPermission('projects_view')) && (
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'webtools' ? null : 'webtools')}
                    className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                    style={{ outline: 'none' }}
                  >
                    <i className="bi bi-tools sidebar-nav-icon"></i>
                    <span style={{ flex: 1 }}>Web Tools</span>
                    <i className={`bi ${activeSection === 'webtools' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                  </button>
                  {activeSection === 'webtools' && (
                    <div className="submenu-container">
                      {hasPermission('achievement_view') && (
                        <button onClick={() => setCurrentView('achievement')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Achievement Awards</button>
                      )}
                      {hasPermission('certificates_view') && (
                        <button onClick={() => setCurrentView('certificates')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Certificates</button>
                      )}
                      {hasPermission('downloads_view') && (
                        <button onClick={() => setCurrentView('downloads')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Downloads</button>
                      )}

                      {/* News / Blogs Submenu */}
                      {userType !== 'client' && (hasPermission('news_view') || hasPermission('news_subscribers_view')) && (
                        <div>
                          <button
                            onClick={() => setActiveSubSection(activeSubSection === 'news' ? null : 'news')}
                            className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between"
                            style={{ outline: 'none' }}
                          >
                            <span>News / Blogs</span>
                            <i className={`bi ${activeSubSection === 'news' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                          </button>
                          {activeSubSection === 'news' && (
                            <div className="submenu-container" style={{ paddingLeft: '15px' }}>
                              {hasPermission('news_view') && (
                                <button onClick={() => setCurrentView('news')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Posting</button>
                              )}
                              {hasPermission('news_subscribers_view') && (
                                <button onClick={() => setCurrentView('news-subscribers')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Subscribers</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {hasPermission('procurement_view') && (
                        <button onClick={() => setCurrentView('procurement')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between" style={{ outline: 'none' }}>
                          <span>Procurement</span>
                          {taskCounts.procurement > 0 && <span className="badge bg-danger" style={{ fontSize: 10 }}>{taskCounts.procurement}</span>}
                        </button>
                      )}
                      {hasPermission('projects_view') && (
                        <button onClick={() => setCurrentView('projects')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Project Records</button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {userType === 'client' ? (
                <button onClick={() => setCurrentView('client-helpdesk')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                  <i className="bi bi-question-circle sidebar-nav-icon"></i>
                  <span>My Tickets</span>
                </button>
              ) : (hasPermission('helpdesk_view') || hasPermission('helpdesk_clients_view')) && (
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'helpdesk' ? null : 'helpdesk')}
                    className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                    style={{ outline: 'none' }}
                  >
                    <i className="bi bi-question-circle sidebar-nav-icon"></i>
                    <span style={{ flex: 1 }}>Helpdesk</span>
                    <i className={`bi ${activeSection === 'helpdesk' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                  </button>
                  {activeSection === 'helpdesk' && (
                    <div className="submenu-container">
                      {hasPermission('helpdesk_view') && (
                        <button onClick={() => setCurrentView('helpdesk-board')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Helpdesk Board</button>
                      )}
                      {hasPermission('helpdesk_clients_view') && (
                        <button onClick={() => setCurrentView('helpdesk-clients')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Client List</button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Separator - Only show if Settings menu exists (to separate Settings from other menus) */}
              {userType !== 'client' && userRole !== 'staff' && (hasPermission('global-config_view') || hasPermission('integrations_view') || hasPermission('role-groups_view') || hasPermission('users_view') || hasPermission('activity-logs_view')) && (
                <div className="sidebar-separator">
                  <hr className="sidebar-separator-line" />
                </div>
              )}

              {/* Settings - Accordion (Hidden for Staff and Client) */}
              {userType !== 'client' && userRole !== 'staff' && (hasPermission('global-config_view') || hasPermission('integrations_view') || hasPermission('role-groups_view') || hasPermission('users_view') || hasPermission('activity-logs_view')) && (
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'settings' ? null : 'settings')}
                    className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                    style={{ outline: 'none' }}
                  >
                    <i className="bi bi-gear sidebar-nav-icon"></i>
                    <span style={{ flex: 1 }}>Settings</span>
                    <i className={`bi ${activeSection === 'settings' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                  </button>
                  {activeSection === 'settings' && (
                    <div className="submenu-container">
                      {hasPermission('global-config_view') && (
                        <button onClick={() => setCurrentView('global-config')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Global Config</button>
                      )}
                      {hasPermission('integrations_view') && (
                        <button onClick={() => setCurrentView('integrations')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Integrations</button>
                      )}
                      {hasPermission('role-groups_view') && (
                        <button onClick={() => setCurrentView('role-groups')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Role Groups</button>
                      )}
                      {hasPermission('users_view') && (
                        <button onClick={() => setCurrentView('users')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Users</button>
                      )}
                      {hasPermission('activity-logs_view') && (
                        <button onClick={() => setCurrentView('activity-logs')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Activity Logs</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <header className="header">
            {/* Top Bar */}
            <div className="topbar">
              <div className="topbar-container">
                <div className="topbar-left">
                  <span className="welcome-text">Welcome, {username}</span>
                  <span className="topbar-separator">|</span>
                  <span className="current-date" suppressHydrationWarning>{currentTime}</span>
                </div>
                <div className="topbar-right d-flex align-items-center gap-2">
                  {/* Real-time Notification Bell */}
                  {authenticated && (() => {
                    const userId = userType === 'client' ? clientId : (userType === 'employee' ? employeeId : adminId);
                    // Only render if userId is valid (not null/0)
                    if (!userId || userId === 0) return null;
                    return (
                      <NotificationBell 
                        sessionHash={hash}
                        userType={userType as 'admin' | 'client' | 'employee'}
                        userId={userId}
                      />
                    );
                  })()}
                  <button className="topbar-grid-btn">
                    <span className="material-symbols-outlined">apps</span>
                  </button>
                  <button className="topbar-help-btn">
                    <span className="material-symbols-outlined">help</span>
                  </button>
                  <div className="dropdown">
                    <button className="topbar-user-btn" type="button" data-bs-toggle="dropdown">
                      <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
                      <span>{username}</span>
                      <svg style={{ height: 16, width: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button onClick={handleLogout} className="dropdown-item"><i className="bi bi-box-arrow-right me-1"></i>Logout</button></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="breadcrumb-bar">
              <div className="breadcrumb-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <nav className="breadcrumb-nav">
                  <button 
                    onClick={() => setCurrentView(userType === 'client' ? 'client-helpdesk' : 'dashboard')} 
                    className="breadcrumb-item border-0 bg-transparent p-0" 
                    style={{ outline: 'none', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>home</span>
                    Home
                  </button>
                  {getBreadcrumbs(currentView).map((crumb, index) => (
                    <span key={index}>
                      <span className="breadcrumb-separator">›</span>
                      <span className={crumb.active ? "breadcrumb-current" : "breadcrumb-item"} style={{ cursor: 'default' }}>
                        {crumb.label}
                      </span>
                    </span>
                  ))}
                </nav>
                <WeatherWidget />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4">
            <div className="card shadow-sm" style={{ borderRadius: 2, overflow: 'visible' }}>
              <div className="card-body" style={{ overflow: 'visible' }}>
                {/* Admin Dashboard */}
                {userType !== 'client' && userType !== 'employee' && currentView === 'dashboard' ? (
                  <AdminDashboard sessionHash={hash} />
                ) : userType === 'employee' && currentView === 'employee-dashboard' ? (
                  <EmployeeDashboard sessionHash={hash} employeeId={employeeId} />
                ) : userType === 'employee' && currentView === 'employee-leave' ? (
                  <EmployeeLeave sessionHash={hash} employeeId={employeeId} />
                ) : userType === 'employee' && currentView === 'employee-claims' ? (
                  <EmployeeClaims sessionHash={hash} employeeId={employeeId} />
                ) : userType === 'employee' && currentView === 'employee-overtime' ? (
                  <EmployeeOvertime sessionHash={hash} employeeId={employeeId} />
                ) : userType === 'employee' && currentView === 'employee-expenses' ? (
                  <EmployeeExpenses sessionHash={hash} employeeId={employeeId} />
                ) : userType === 'employee' && currentView === 'employee-payslips' ? (
                  <EmployeePayslips sessionHash={hash} employeeId={employeeId} />
                ) : userType === 'employee' && currentView === 'employee-kpis' ? (
                  <EmployeeKpis sessionHash={hash} />
                ) : userType === 'employee' && currentView === 'employee-profile' ? (
                  <EmployeeProfile sessionHash={hash} employeeId={employeeId} />
                ) : userType !== 'client' && currentView === 'global-config' ? (
                  hasPermission('global-config_view') ? (
                    <GlobalConfig hash={hash} />
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-shield-lock" style={{ fontSize: 48, color: '#dc3545' }}></i>
                      <p className="mt-3 text-muted">You do not have permission to access this page.</p>
                    </div>
                  )
                ) : userType !== 'client' && currentView === 'integrations' ? (
                  hasPermission('integrations_view') ? (
                    <Integrations hash={hash} />
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                      </div>
                      <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                      <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                        You don&apos;t have permission to access this page.
                      </p>
                    </div>
                  )
                ) : userType !== 'client' && currentView === 'role-groups' ? (
                  hasPermission('role-groups_view') ? (
                    <RoleGroupsManager sessionHash={hash} />
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                      </div>
                      <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                      <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                        You don&apos;t have permission to access this page.
                      </p>
                    </div>
                  )
                ) : userType !== 'client' && currentView === 'users' ? (
                  hasPermission('users_view') ? (
                    <UsersManagement sessionHash={hash} />
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                      </div>
                      <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                      <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                        You don&apos;t have permission to access this page.
                      </p>
                    </div>
                  )
                        ) : userType !== 'client' && currentView === 'projects' ? (
                          hasPermission('projects_view') ? (
                            <ProjectRecordsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'career' ? (
                          hasPermission('career_view') ? (
                            <CareerManagement sessionHash={hash} userPermissions={userPermissions} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'applicants' ? (
                          hasPermission('applicants_read') ? (
                            <ApplicantsManagement sessionHash={hash} userPermissions={userPermissions} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'career-archive' ? (
                          hasPermission('career_archive_read') ? (
                            <ArchiveManagement sessionHash={hash} userPermissions={userPermissions} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'employees' ? (
                          hasPermission('employees_view') ? (
                            <EmployeeManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'departments' ? (
                          hasPermission('departments_view') ? (
                            <DepartmentManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'leave' ? (
                          hasPermission('leave_view') ? (
                            <LeaveManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'claims' ? (
                          hasPermission('claims_view') ? (
                            <ClaimManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'overtime' ? (
                          hasPermission('overtime_view') ? (
                            <OvertimeManagement 
                              sessionHash={hash} 
                              onViewDetails={(employeeId, month) => {
                                (window as any).overtimeDetailsParams = { employeeId, month };
                                setCurrentView('overtime-details');
                              }}
                            />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'overtime-details' ? (
                          hasPermission('overtime_view') ? (
                            <OvertimeDetails 
                              sessionHash={hash}
                              employeeId={(window as any).overtimeDetailsParams?.employeeId || 0}
                              month={(window as any).overtimeDetailsParams?.month || ''}
                              onBack={() => setCurrentView('overtime')}
                            />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'expenses' ? (
                          hasPermission('expenses_view') ? (
                            <ExpensesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'payroll' ? (
                          hasPermission('payroll_view') ? (
                            <PayrollManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'allowances' ? (
                          hasPermission('allowances_view') ? (
                            <AllowancesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'kpi-templates' ? (
                          hasPermission('kpi_templates_view') ? (
                            <KpiTemplatesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'kpi-periods' ? (
                          hasPermission('kpi_periods_view') ? (
                            <KpiPeriodsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'kpi-assignments' ? (
                          hasPermission('kpi_assignments_view') ? (
                            <KpiAssignmentsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'kpi-reviews' ? (
                          hasPermission('kpi_reviews_view') ? (
                            <KpiReviewsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                ) : userType !== 'client' && currentView === 'kpi-results' ? (
                  hasPermission('kpi_reviews_view') ? (
                    <KpiResultsManagement sessionHash={hash} />
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                      </div>
                      <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                    </div>
                  )
                        ) : userType !== 'client' && currentView === 'kpi-competencies' ? (
                          hasPermission('kpi_competencies_view') ? (
                            <KpiCompetenciesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'kpi-grades' ? (
                          hasPermission('kpi_grades_view') ? (
                            <KpiGradeBandsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'bonuses' ? (
                          hasPermission('bonuses_view') ? (
                            <BonusManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'commissions' ? (
                          hasPermission('commissions_view') ? (
                            <CommissionManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'loans' ? (
                          hasPermission('loans_view') ? (
                            <LoanManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'advances' ? (
                          hasPermission('advances_view') ? (
                            <AdvanceManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'leave-types' ? (
                          hasPermission('leave_view') ? (
                            <LeaveTypesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'claim-types' ? (
                          hasPermission('claims_view') ? (
                            <ClaimTypesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'overtime-rates' ? (
                          hasPermission('overtime_view') ? (
                            <OvertimeRatesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'expense-categories' ? (
                          hasPermission('expenses_view') ? (
                            <ExpenseCategoriesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'achievement' ? (
                          hasPermission('achievement_view') ? (
                            <AchievementAwardsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'certificates' ? (
                          hasPermission('certificates_view') ? (
                            <CertificatesManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'downloads' ? (
                          hasPermission('downloads_view') ? (
                            <DownloadsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'news' ? (
                          hasPermission('news_view') ? (
                            <NewsManagement sessionHash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'news-subscribers' ? (
                          hasPermission('news_subscribers_view') ? (
                            <NewsSubscribersManagement sessionHash={hash} userPermissions={userPermissions} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : userType !== 'client' && currentView === 'procurement' ? (
                          hasPermission('procurement_view') ? (
                            <ProcurementManagement sessionHash={hash} userPermissions={userPermissions} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                              <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                                You don&apos;t have permission to access this page.
                              </p>
                            </div>
                          )
                        ) : currentView === 'client-helpdesk' ? (
                          <ClientHelpdesk hash={hash} />
                        ) : currentView === 'my-profile' ? (
                          <div className="text-center py-5">
                            <div className="mb-4">
                              <i className="bi bi-person-circle" style={{ fontSize: 72, color: '#0891b2' }}></i>
                            </div>
                            <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>My Profile</h4>
                            <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                              Coming soon! View and edit your personal profile information.
                            </p>
                          </div>
                        ) : currentView === 'my-leave' ? (
                          <div className="text-center py-5">
                            <div className="mb-4">
                              <i className="bi bi-calendar-check" style={{ fontSize: 72, color: '#0891b2' }}></i>
                            </div>
                            <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>My Leave</h4>
                            <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                              Coming soon! Apply for leave, view your leave balance, and track leave history.
                            </p>
                          </div>
                        ) : currentView === 'my-claims' ? (
                          <div className="text-center py-5">
                            <div className="mb-4">
                              <i className="bi bi-receipt" style={{ fontSize: 72, color: '#0891b2' }}></i>
                            </div>
                            <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>My Claims</h4>
                            <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                              Coming soon! Submit expense claims and track reimbursement status.
                            </p>
                          </div>
                        ) : currentView === 'my-overtime' ? (
                          <div className="text-center py-5">
                            <div className="mb-4">
                              <i className="bi bi-clock-history" style={{ fontSize: 72, color: '#0891b2' }}></i>
                            </div>
                            <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>My Overtime</h4>
                            <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                              Coming soon! Submit overtime records and view overtime compensation.
                            </p>
                          </div>
                        ) : currentView === 'my-payslip' ? (
                          <div className="text-center py-5">
                            <div className="mb-4">
                              <i className="bi bi-wallet2" style={{ fontSize: 72, color: '#0891b2' }}></i>
                            </div>
                            <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>My Payslip</h4>
                            <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                              Coming soon! View and download your monthly payslips.
                            </p>
                          </div>
                        ) : currentView === 'helpdesk-board' ? (
                          hasPermission('helpdesk_view') ? (
                            <HelpdeskManagement hash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                            </div>
                          )
                        ) : currentView === 'helpdesk-clients' ? (
                          hasPermission('helpdesk_clients_view') ? (
                            <HelpdeskClientList hash={hash} />
                          ) : (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-lock" style={{ fontSize: 72, color: '#dc2626' }}></i>
                              </div>
                              <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Access Denied</h4>
                            </div>
                          )
                        ) : (
                  <>
                    <h5 className="card-title mb-4">{getPageTitle(currentView)}</h5>
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-tools" style={{ fontSize: 72, color: '#9ca3af' }}></i>
                      </div>
                      <h4 className="mb-2" style={{ fontSize: 20, fontWeight: 600, color: '#374151' }}>Under Maintenance</h4>
                      <p className="text-muted" style={{ fontSize: 13, maxWidth: 500, margin: '0 auto' }}>
                        We&apos;re working to bring you enhanced features and improvements.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


