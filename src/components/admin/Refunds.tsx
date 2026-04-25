"use client";

import { useEffect, useState } from "react";
import styles from "./OrdersManagement.module.css";
import RefundDetailsModal from "./RefundDetailsModal";

interface Refund {
  id: number;
  reference: string;
  chip_payment_id: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string | null;
  customer_postcode?: string;
  customer_country?: string;
  customer_bank_account?: string | null;
  customer_bank_code?: string | null;
  customer_bank_holder_name?: string | null;
  total_amount: number | string;
  refund_amount?: number | string | null;
  currency: string;
  payment_method: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
  notes: string | null;
}

export default function Refunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (dateFrom.trim()) params.set('from', dateFrom.trim());
        if (dateTo.trim()) params.set('to', dateTo.trim());

        const response = await fetch(`/api/admin/refunds?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setRefunds(data.refunds || []);
          setTotal(data.pagination?.total ?? 0);
          setTotalPages(data.pagination?.totalPages ?? 1);
        } else {
          setRefunds([]);
          setTotal(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch refunds:', error);
        setRefunds([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [searchQuery, dateFrom, dateTo, page, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency} ${numAmount.toFixed(2)}`;
  };

  const showingStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = total > 0 ? Math.min((page - 1) * pageSize + refunds.length, total) : 0;

  const handleAcceptRefund = async (refund: Refund) => {
    if (!confirm(`Accept refund for ${refund.reference}?\n\nThis will release the funds and complete the refund process.`)) {
      return;
    }

    try {
      const response = await fetch('/api/chip-asia/release-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: refund.id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Refund accepted successfully!');
        // Refresh the list
        setPage(1);
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', String(pageSize));
        const refreshResponse = await fetch(`/api/admin/refunds?${params.toString()}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setRefunds(refreshData.refunds || []);
        }
      } else {
        alert(`Failed to accept refund: ${data.message}\n\n${JSON.stringify(data.details || data.error, null, 2)}`);
      }
    } catch (error) {
      console.error('Accept refund error:', error);
      alert(`Failed to accept refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteRefund = async (refund: Refund) => {
    const totalAmount = typeof refund.total_amount === 'string' ? parseFloat(refund.total_amount) : refund.total_amount;
    const refundAmount = refund.refund_amount 
      ? (typeof refund.refund_amount === 'string' ? parseFloat(refund.refund_amount) : refund.refund_amount)
      : totalAmount;

    if (!confirm(`Cancel refund request for ${refund.reference}?\n\nRefund Amount: ${refund.currency} ${refundAmount.toFixed(2)}\n\nThis will restore the order status back to 'paid'.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/cancel-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: refund.id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Refund request cancelled! Order restored to paid status.');
        // Refresh the list
        setPage(1);
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', String(pageSize));
        const refreshResponse = await fetch(`/api/admin/refunds?${params.toString()}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setRefunds(refreshData.refunds || []);
        }
      } else {
        alert(`Failed to cancel refund: ${data.message}`);
      }
    } catch (error) {
      console.error('Cancel refund error:', error);
      alert(`Failed to cancel refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusBadge = (refund: Refund) => {
    const { status } = refund;
    
    if (status === 'refund_pending') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 500,
          borderRadius: '9999px',
          backgroundColor: '#fef3c7',
          color: '#92400e',
        }}>
          On Hold
        </span>
      );
    }
    
    if (status === 'partial_refund') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 500,
          borderRadius: '9999px',
          backgroundColor: '#fed7aa',
          color: '#9a3412',
        }}>
          Partial Refund
        </span>
      );
    }
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        fontSize: '11px',
        fontWeight: 500,
        borderRadius: '9999px',
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      }}>
        Complete Refund
      </span>
    );
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                Refunds
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                View all refunded orders
              </p>
            </div>
          </div>

          <form className="row g-3 mb-4">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search order reference, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); }}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', fontWeight: 500, borderColor: '#dc2626', color: '#dc2626' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="overflow-x-auto shadow" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '8px', marginBottom: '24px', overflow: 'visible' }}>
            <table className="table mb-0" style={{ fontSize: '12px', width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th scope="col" style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>
                    Order Reference
                  </th>
                  <th scope="col" style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>
                    Customer
                  </th>
                  <th scope="col" style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>
                    Status
                  </th>
                  <th scope="col" style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>
                    Date
                  </th>
                  <th scope="col" style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', borderBottom: '1px solid #d1d5db' }}>
                    Amount
                  </th>
                  <th scope="col" style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', borderBottom: '1px solid #d1d5db' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: '48px 24px', color: '#6b7280', fontSize: '12px', borderBottom: 'none' }}>
                      Loading refunds...
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: '48px 24px', color: '#6b7280', fontSize: '12px', borderBottom: 'none' }}>
                      No refunds found.
                    </td>
                  </tr>
                ) : (
                  refunds.map((refund) => (
                    <tr
                      key={refund.id}
                      style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                      onClick={() => {
                        setSelectedRefund(refund);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', marginBottom: '2px' }}>
                          {refund.reference}
                        </div>
                        {refund.chip_payment_id && (
                          <div 
                            style={{ fontSize: '11px', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={`CHIP: ${refund.chip_payment_id}`}
                          >
                            CHIP: {refund.chip_payment_id.substring(0, 8)}...{refund.chip_payment_id.substring(refund.chip_payment_id.length - 4)}
                          </div>
                        )}
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>
                          {refund.customer_first_name} {refund.customer_last_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {refund.customer_email}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {getStatusBadge(refund)}
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>
                          {formatDate(refund.updated_at)}
                        </div>
                        {refund.created_at && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Original: {formatDate(refund.created_at)}
                          </div>
                        )}
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#dc2626' }}>
                          -{formatCurrency(refund.refund_amount || refund.total_amount, refund.currency)}
                        </div>
                        {refund.status === 'partial_refund' && refund.refund_amount && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            of {formatCurrency(refund.total_amount, refund.currency)}
                          </div>
                        )}
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          {refund.status === 'refund_pending' && refund.chip_payment_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptRefund(refund);
                              }}
                              className="btn btn-sm btn-success"
                              style={{ fontSize: '11px', padding: '4px 12px', fontWeight: 500 }}
                            >
                              <span className="material-symbols-outlined me-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>check_circle</span>
                              Accept
                            </button>
                          )}
                          {refund.status === 'refunded' && (
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Completed</span>
                          )}
                          {refund.status === 'partial_refund' && (
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Completed</span>
                          )}
                          {/* Delete button - only for pending refunds */}
                          {refund.status === 'refund_pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRefund(refund);
                              }}
                              className="btn btn-sm btn-danger"
                              style={{ fontSize: '11px', padding: '4px 12px', fontWeight: 500 }}
                              title="Delete refund request"
                            >
                              <span className="material-symbols-outlined me-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>delete</span>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {showingStart} to {showingEnd} of {total} refunds
            </div>
            <nav>
              <ul className="pagination mb-0" style={{ gap: '4px' }}>
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link border-0"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: page <= 1 ? '#f3f4f6' : '#ffffff', color: page <= 1 ? '#9ca3af' : '#111827', border: page <= 1 ? 'none' : '1px solid #e5e7eb' }}
                  >
                    Previous
                  </button>
                </li>
                <li className="page-item active">
                  <button className="page-link border-0" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#ffffff', fontWeight: 500 }}>
                    {page}
                  </button>
                </li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link border-0"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: page >= totalPages ? '#f3f4f6' : '#ffffff', color: page >= totalPages ? '#9ca3af' : '#111827', border: page >= totalPages ? 'none' : '1px solid #e5e7eb' }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Refund Details Modal */}
      <RefundDetailsModal
        refund={selectedRefund}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRefund(null);
        }}
      />
    </div>
  );
}

