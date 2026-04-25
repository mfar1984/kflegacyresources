"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./OrdersManagement.module.css";

const CustomerDetailsModal = dynamic(() => import("./CustomerDetailsModal"), { ssr: false });

interface CustomerRow {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  country: string;
  total_orders: number;
  paid_orders: number;
  total_spent: number | string;
  last_order_created_at: string;
}

export default function Customers() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (dateFrom.trim()) params.set('from', dateFrom.trim());
        if (dateTo.trim()) params.set('to', dateTo.trim());
        const res = await fetch(`/api/admin/customers?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setRows(data.customers || []);
          setTotal(data.pagination?.total ?? 0);
          setTotalPages(data.pagination?.totalPages ?? 1);
        } else {
          setRows([]);
          setTotal(0);
          setTotalPages(1);
        }
      } catch {
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [searchQuery, dateFrom, dateTo, page, pageSize]);

  useEffect(() => { setPage(1); }, [searchQuery, dateFrom, dateTo]);

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (v: number | string) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return `MYR ${n.toFixed(2)}`;
  };

  const showingStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = total > 0 ? (page - 1) * pageSize + rows.length : 0;

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>Customers</h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Manage customer records</p>
            </div>
          </div>

          <form className="row g-3 mb-4">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search name, email, phone or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }} />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }} />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-outline-danger w-100" onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); }}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', fontWeight: 500, borderColor: '#dc2626', color: '#dc2626' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}
              >Reset</button>
            </div>
          </form>

          <div className="overflow-x-auto overflow-hidden shadow" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '8px', marginBottom: '24px' }}>
            <table className="table mb-0" style={{ fontSize: '12px', width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #d1d5db' }}>Customer</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #d1d5db' }}>Contact</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #d1d5db' }}>Orders</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #d1d5db' }}>Total Spent</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #d1d5db' }}>Last Order</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #d1d5db', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: '48px 24px', color: '#6b7280', fontSize: '12px', borderBottom: 'none' }}>No customers found.</td>
                  </tr>
                ) : (
                  rows.map((c) => (
                    <tr key={c.email} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{c.first_name} {c.last_name}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>{c.phone || '-'}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{c.city || '-'}{c.country ? `, ${c.country}` : ''}</div>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>Total: {c.total_orders}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Paid: {c.paid_orders}</div>
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{formatCurrency(c.total_spent)}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>{formatDate(c.last_order_created_at)}</div>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionsContainer}>
                          {/* View */}
                          <button 
                            onClick={() => {
                              setSelectedCustomerEmail(c.email);
                              setShowModal(true);
                            }}
                            className={styles.actionButton}
                            style={{ color: '#2563eb' }}
                            title="View"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              visibility
                            </span>
                          </button>

                          {/* Edit */}
                          <button 
                            onClick={() => {
                              // TODO: Implement edit customer
                              alert(`Edit customer: ${c.first_name} ${c.last_name}`);
                            }}
                            className={styles.actionButton}
                            style={{ color: '#eab308' }}
                            title="Edit"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              edit
                            </span>
                          </button>

                          {/* Delete */}
                          <button 
                            onClick={() => {
                              // TODO: Implement delete customer
                              if (confirm(`Delete customer: ${c.first_name} ${c.last_name}?`)) {
                                alert('Delete functionality to be implemented');
                              }
                            }}
                            className={styles.actionButton}
                            style={{ color: '#dc2626' }}
                            title="Delete"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Showing {showingStart} to {showingEnd} of {total} customers</div>
            <nav>
              <ul className="pagination mb-0" style={{ gap: '4px' }}>
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button className="page-link border-0" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: page <= 1 ? '#f3f4f6' : '#ffffff', color: page <= 1 ? '#9ca3af' : '#111827', border: page <= 1 ? 'none' : '1px solid #e5e7eb' }}
                  >Previous</button>
                </li>
                <li className="page-item active">
                  <button className="page-link border-0" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#ffffff', fontWeight: 500 }}>{page}</button>
                </li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button className="page-link border-0" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: page >= totalPages ? '#f3f4f6' : '#ffffff', color: page >= totalPages ? '#9ca3af' : '#111827', border: page >= totalPages ? 'none' : '1px solid #e5e7eb' }}
                  >Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        email={selectedCustomerEmail}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCustomerEmail(null);
        }}
      />
    </div>
  );
}


