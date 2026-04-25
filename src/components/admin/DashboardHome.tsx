"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardHomeProps {
  hash: string;
}

export default function DashboardHome({ hash }: DashboardHomeProps) {
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [thisMonthOrders, setThisMonthOrders] = useState(0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch('/api/admin/orders/stats');
        const data = await res.json();
        if (data.success) {
          setTotalOrders(data.totals?.orders ?? 0);
          setTotalRevenue(data.totals?.revenue ?? 0);
          setThisMonthOrders(data.thisMonth?.orders ?? 0);
          setThisMonthRevenue(data.thisMonth?.revenue ?? 0);
        }
      } catch {
        // noop
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);
  return (
    <>
      {/* Main Container - match Orders page container */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {/* Page Header - consistent with Orders */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>Dashboard</h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Overview and quick actions</p>
            </div>
          </div>

          {/* Removed welcome card as requested */}

          {/* Stats Cards */}
          <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="card-body p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: "12px" }}>Total Orders</p>
                  <h2 className="mb-0 fw-bold" style={{ fontSize: "28px" }}>{statsLoading ? '—' : totalOrders}</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <i className="bi bi-cart-check" style={{ fontSize: "1.5rem" }}></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-arrow-up me-1"></i>
                <small>View all orders</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <div className="card-body p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: "12px" }}>Products</p>
                  <h2 className="mb-0 fw-bold" style={{ fontSize: "28px" }}>14</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <i className="bi bi-box-seam" style={{ fontSize: "1.5rem" }}></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-arrow-up me-1"></i>
                <small>Manage products</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
            <div className="card-body p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: "12px" }}>Quotations</p>
                  <h2 className="mb-0 fw-bold" style={{ fontSize: "28px" }}>0</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <i className="bi bi-file-text" style={{ fontSize: "1.5rem" }}></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-arrow-up me-1"></i>
                <small>View requests</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
            <div className="card-body p-4 text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: "12px" }}>Revenue</p>
                  <h2 className="mb-0 fw-bold" style={{ fontSize: "28px" }}>RM {statsLoading ? '—' : totalRevenue.toFixed(2)}</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <i className="bi bi-currency-dollar" style={{ fontSize: "1.5rem" }}></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-arrow-up me-1"></i>
                <small>This month: {statsLoading ? '—' : `${thisMonthOrders} orders / RM ${thisMonthRevenue.toFixed(2)}`}</small>
              </div>
            </div>
          </div>
        </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="card-body p-4">
              <h5 className="card-title mb-4" style={{ fontSize: "16px", fontWeight: 600 }}>
                <i className="bi bi-lightning-charge me-2 text-warning"></i>
                Quick Actions
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <Link href="/store" className="text-decoration-none">
                    <div className="p-3 border rounded-3 text-center h-100" style={{ cursor: "pointer", transition: "all 0.3s" }}>
                      <i className="bi bi-shop text-primary" style={{ fontSize: "2rem" }}></i>
                      <p className="mb-0 mt-2 fw-semibold" style={{ fontSize: "12px" }}>View Store</p>
                    </div>
                  </Link>
                </div>
                <div className="col-md-4">
                  <div className="p-3 border rounded-3 text-center h-100" style={{ cursor: "pointer", transition: "all 0.3s" }}>
                    <i className="bi bi-gear text-success" style={{ fontSize: "2rem" }}></i>
                    <p className="mb-0 mt-2 fw-semibold" style={{ fontSize: "12px" }}>Settings</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 border rounded-3 text-center h-100" style={{ cursor: "pointer", transition: "all 0.3s" }}>
                    <i className="bi bi-graph-up text-info" style={{ fontSize: "2rem" }}></i>
                    <p className="mb-0 mt-2 fw-semibold" style={{ fontSize: "12px" }}>Analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="card-body p-4">
              <h5 className="card-title mb-4" style={{ fontSize: "16px", fontWeight: 600 }}>
                <i className="bi bi-shield-check me-2 text-success"></i>
                Session Info
              </h5>
              <div className="mb-3" style={{ fontSize: "12px" }}>
                <small className="text-muted d-block mb-1">Session Hash</small>
                <code className="small" style={{ fontSize: "10px", wordBreak: "break-all" }}>{hash}</code>
              </div>
              <div className="mb-3" style={{ fontSize: "12px" }}>
                <small className="text-muted d-block mb-1">Encryption</small>
                <span className="badge bg-success">Argon2id</span>
              </div>
              <div style={{ fontSize: "12px" }}>
                <small className="text-muted d-block mb-1">Status</small>
                <span className="badge bg-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </>
  );
}

