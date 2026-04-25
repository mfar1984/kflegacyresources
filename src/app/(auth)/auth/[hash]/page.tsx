"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardHome from "@/components/admin/DashboardHome";
import OrdersManagement from "@/components/admin/OrdersManagement";
import Customers from "@/components/admin/Customers";
import ChipTransactions from "@/components/admin/ChipTransactions";
import Refunds from "@/components/admin/Refunds";
import Products from "@/components/admin/Products";
import Categories from "@/components/admin/Categories";
import SettingsCatalog from "@/components/admin/SettingsCatalog";
import SettingsGeneral from "@/components/admin/SettingsGeneral";
import AdminUsers from "@/components/admin/AdminUsers";
import RolesPermissions from "@/components/admin/RolesPermissions";
import Audit from "@/components/admin/Audit";

export default function AuthDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params?.hash as string;
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  
  // Accordion state: only one section open at a time, default all collapsed
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Live time for header
  const [currentTime, setCurrentTime] = useState<string>("");
  
  // Current view state
  const [currentView, setCurrentView] = useState<'dashboard' | 'orders' | 'customers' | 'chip-transactions' | 'refunds' | 'products' | 'categories' | 'settings-catalog' | 'settings-general' | 'admin-users' | 'roles-permissions' | 'audit'>('dashboard');
  
  // Chip-Asia balance
  const [chipBalance, setChipBalance] = useState<{ myr: number; usd: number; eur: number } | null>(null);
  
  // Navigate to different views
  const navigateTo = (view: 'dashboard' | 'orders' | 'customers' | 'chip-transactions' | 'refunds' | 'products' | 'categories' | 'settings-catalog' | 'settings-general' | 'admin-users' | 'roles-permissions' | 'audit') => {
    setCurrentView(view);
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/auth/verify?hash=${hash}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setAuthenticated(true);
          setUsername(data.username);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Session verification error:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      verifySession();
    } else {
      router.push("/admin/login");
    }
  }, [hash, router]);

  // Fetch Chip-Asia balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/chip-asia/balance');
        const data = await response.json();
        if (data.success && data.summary) {
          setChipBalance(data.summary);
        }
      } catch (error) {
        console.error('Failed to fetch Chip-Asia balance:', error);
      }
    };

    if (authenticated) {
      fetchBalance();
      // Refresh balance every 5 minutes
      const interval = setInterval(fetchBalance, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  // Update live time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <>
      <link rel="stylesheet" href="/assets/css/admin-dashboard.css" />
      
      <div style={{ minHeight: "100vh", background: "#f9fafb", margin: 0, padding: 0 }}>
        {/* Sidebar */}
        <div className="sidebar">
          {/* Sidebar Header with Logo */}
          <div className="sidebar-header">
            <img src="/assets/img/logo.png" alt="KF Legacy" style={{ height: "48px" }} />
          </div>

          {/* Sidebar Navigation */}
          <nav className="sidebar-nav">
            <div>
              {/* Dashboard */}
              <button onClick={() => navigateTo('dashboard')} className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>
                <i className="bi bi-speedometer2 sidebar-nav-icon"></i>
                <span>Dashboard</span>
              </button>

              {/* Orders & Payments - Accordion */}
              <div>
                <button
                  onClick={() => setActiveSection(activeSection === 'orders' ? null : 'orders')}
                  className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                  style={{ outline: 'none' }}
                >
                  <i className="bi bi-receipt sidebar-nav-icon"></i>
                  <span style={{ flex: 1 }}>Orders & Payments</span>
                  <i className={`bi ${activeSection === 'orders' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                </button>
                {activeSection === 'orders' && (
                  <div className="submenu-container">
                    <button onClick={() => navigateTo('orders')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Orders</button>
                    <button onClick={() => navigateTo('chip-transactions')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Transactions (CHIP)</button>
                    <button onClick={() => navigateTo('refunds')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Refunds</button>
                    <button onClick={() => navigateTo('customers')} className="submenu-item sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent" style={{ outline: 'none' }}>Customers</button>
                  </div>
                )}
              </div>

              {/* Catalog - Accordion */}
              <div>
                <button
                  onClick={() => setActiveSection(activeSection === 'catalog' ? null : 'catalog')}
                  className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                  style={{ outline: 'none' }}
                >
                  <i className="bi bi-box-seam sidebar-nav-icon"></i>
                  <span style={{ flex: 1 }}>Catalog</span>
                  <i className={`bi ${activeSection === 'catalog' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                </button>
                {activeSection === 'catalog' && (
                  <div className="submenu-container">
                    <button onClick={() => navigateTo('products')} className={`submenu-item sidebar-nav-item ${currentView === 'products' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`}>Products</button>
                    <button onClick={() => navigateTo('categories')} className={`submenu-item sidebar-nav-item ${currentView === 'categories' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`}>Categories</button>
                    <button onClick={() => navigateTo('settings-catalog')} className={`submenu-item sidebar-nav-item ${currentView === 'settings-catalog' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`}>Settings Catalog</button>
                  </div>
                )}
              </div>

              {/* Content - Accordion */}
              <div>
                <button
                  onClick={() => setActiveSection(activeSection === 'content' ? null : 'content')}
                  className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                  style={{ outline: 'none' }}
                >
                  <i className="bi bi-file-earmark-text sidebar-nav-icon"></i>
                  <span style={{ flex: 1 }}>Content</span>
                  <i className={`bi ${activeSection === 'content' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                </button>
                {activeSection === 'content' && (
                  <div className="submenu-container">
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Pages</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Banners / Hero</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Menus</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Documents</Link>
                  </div>
                )}
              </div>

              {/* Marketing & SEO - Accordion */}
              <div>
                <button
                  onClick={() => setActiveSection(activeSection === 'marketing' ? null : 'marketing')}
                  className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                  style={{ outline: 'none' }}
                >
                  <i className="bi bi-megaphone sidebar-nav-icon"></i>
                  <span style={{ flex: 1 }}>Marketing & SEO</span>
                  <i className={`bi ${activeSection === 'marketing' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                </button>
                {activeSection === 'marketing' && (
                  <div className="submenu-container">
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Coupons / Promos</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Newsletter</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Quotation Requests</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">SEO Tools</Link>
                  </div>
                )}
              </div>

              {/* Reports - Accordion */}
              <div>
                <button
                  onClick={() => setActiveSection(activeSection === 'reports' ? null : 'reports')}
                  className="sidebar-nav-item sidebar-nav-item-inactive w-100 text-start border-0 bg-transparent"
                  style={{ outline: 'none' }}
                >
                  <i className="bi bi-graph-up-arrow sidebar-nav-icon"></i>
                  <span style={{ flex: 1 }}>Reports</span>
                  <i className={`bi ${activeSection === 'reports' ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ fontSize: '12px' }}></i>
                </button>
                {activeSection === 'reports' && (
                  <div className="submenu-container">
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Sales Reports</Link>
                    <Link href="#" className="submenu-item sidebar-nav-item sidebar-nav-item-inactive">Product Performance</Link>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="sidebar-separator">
                <hr className="sidebar-separator-line" />
              </div>

              {/* Settings - Accordion */}
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
                    {/* Config Section */}
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Config
                    </div>
                    <button onClick={() => navigateTo('settings-general')} className={`submenu-item sidebar-nav-item ${currentView === 'settings-general' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`} style={{ paddingLeft: '32px' }}>General</button>
                    
                    {/* Users & Access Section */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Users & Access
                      </div>
                      <button onClick={() => navigateTo('admin-users')} className={`submenu-item sidebar-nav-item ${currentView === 'admin-users' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`} style={{ paddingLeft: '32px' }}>Admin Users</button>
                      <button onClick={() => navigateTo('roles-permissions')} className={`submenu-item sidebar-nav-item ${currentView === 'roles-permissions' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`} style={{ paddingLeft: '32px' }}>Roles / Permissions</button>
                      <button onClick={() => navigateTo('audit')} className={`submenu-item sidebar-nav-item ${currentView === 'audit' ? '' : 'sidebar-nav-item-inactive'} w-100 text-start border-0 bg-transparent`} style={{ paddingLeft: '32px' }}>Audit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <header className="header">
            {/* Top Bar - Welcome + Icons */}
            <div className="topbar">
              <div className="topbar-container">
                {/* Left: Welcome + DateTime */}
                <div className="topbar-left">
                  <span className="welcome-text">Welcome, {username}</span>
                  <span className="topbar-separator">|</span>
                  <span className="current-date" suppressHydrationWarning>{currentTime}</span>
                </div>

                {/* Right: Icons + User (NO WEATHER HERE) */}
                <div className="topbar-right">
                  {/* Notification Bell with Badge */}
                  <button className="topbar-notification-btn">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="notification-badge">2</span>
                  </button>

                  {/* Apps Grid */}
                  <button className="topbar-grid-btn">
                    <span className="material-symbols-outlined">apps</span>
                  </button>

                  {/* Help */}
                  <button className="topbar-help-btn">
                    <span className="material-symbols-outlined">help</span>
                  </button>

                  {/* User Dropdown */}
                  <div className="dropdown">
                    <button className="topbar-user-btn" type="button" data-bs-toggle="dropdown">
                      <div className="user-avatar">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <span>{username}</span>
                      <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end topbar-dropdown">
                      <li><a className="dropdown-item topbar-dropdown-item" href="#"><i className="bi bi-person"></i>Profile</a></li>
                      <li><a className="dropdown-item topbar-dropdown-item" href="#"><i className="bi bi-gear"></i>Settings</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button onClick={handleLogout} className="dropdown-item topbar-dropdown-item"><i className="bi bi-box-arrow-right"></i>Logout</button></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Breadcrumb Bar - Breadcrumb Left + Weather Right */}
            <div className="breadcrumb-bar">
              <div className="breadcrumb-container">
                {/* Left: Breadcrumb */}
                <nav className="breadcrumb-nav">
                  <button onClick={() => navigateTo('dashboard')} className="breadcrumb-item border-0 bg-transparent p-0" style={{ outline: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>home</span>
                    Home
                  </button>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-current">
                    {currentView === 'dashboard' ? 'Dashboard' 
                      : currentView === 'orders' ? 'Orders' 
                      : currentView === 'customers' ? 'Customers' 
                      : currentView === 'chip-transactions' ? 'CHIP Transactions' 
                      : currentView === 'refunds' ? 'Refunds'
                      : currentView === 'products' ? 'Products'
                      : currentView === 'categories' ? 'Categories'
                      : currentView === 'settings-catalog' ? 'Settings Catalog'
                      : currentView === 'settings-general' ? 'Settings - General'
                      : currentView === 'admin-users' ? 'Settings - Admin Users'
                      : currentView === 'roles-permissions' ? 'Settings - Roles & Permissions'
                      : currentView === 'audit' ? 'Settings - Audit'
                      : 'Dashboard'}
                  </span>
                </nav>

                {/* Right: Chip-Asia Balance */}
                <div className="d-flex align-items-center gap-2" style={{ marginLeft: 'auto' }}>
                  {chipBalance ? (
                    <div className="d-flex align-items-center gap-1">
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Balance:</span>
                      <span style={{ fontSize: '12px', color: '#1f2937', fontWeight: 600 }}>
                        MYR {(chipBalance.myr / 100).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Loading balance...</span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4">
            {/* Conditional Rendering based on currentView */}
            {currentView === 'dashboard' && <DashboardHome hash={hash} />}
            {currentView === 'orders' && <OrdersManagement />}
            {currentView === 'customers' && <Customers />}
            {currentView === 'chip-transactions' && <ChipTransactions />}
            {currentView === 'refunds' && <Refunds />}
            {currentView === 'products' && <Products />}
            {currentView === 'categories' && <Categories />}
            {currentView === 'settings-catalog' && <SettingsCatalog />}
            {currentView === 'settings-general' && <SettingsGeneral />}
            {currentView === 'admin-users' && <AdminUsers />}
            {currentView === 'roles-permissions' && <RolesPermissions />}
            {currentView === 'audit' && <Audit />}
          </main>
        </div>
      </div>
    </>
  );
}
