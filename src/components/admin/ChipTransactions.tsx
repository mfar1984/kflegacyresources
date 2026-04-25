"use client";

import { useEffect, useState } from "react";
import styles from "./OrdersManagement.module.css";
import ChipTransactionDetailsModal from "./ChipTransactionDetailsModal";

interface ChipTransaction {
  id: number;
  reference: string;
  transaction_id: string;
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
  status: string;
  total_amount: number | string;
  refund_amount?: number | string | null;
  currency: string;
  payment_method: string | null;
  created_at: string;
  paid_at: string | null;
  updated_at?: string;
  notes: string | null;
}

export default function ChipTransactions() {
  const [transactions, setTransactions] = useState<ChipTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<ChipTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (statusFilter.trim()) params.set('status', statusFilter.trim());
        if (dateFrom.trim()) params.set('from', dateFrom.trim());
        if (dateTo.trim()) params.set('to', dateTo.trim());

        const response = await fetch(`/api/chip-asia/transactions?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setTransactions(data.transactions || []);
          setTotal(data.pagination?.total ?? 0);
          setTotalPages(data.pagination?.totalPages ?? 1);
        } else {
          setTransactions([]);
          setTotal(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactions([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [statusFilter, dateFrom, dateTo, page, pageSize, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: '#d1fae5', text: '#065f46', label: 'Paid' },
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      failed: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
      cancelled: { bg: '#e5e7eb', text: '#374151', label: 'Cancelled' },
      refunded: { bg: '#dbeafe', text: '#1e40af', label: 'Refunded' },
    };

    const config = statusConfig[status.toLowerCase()] || { bg: '#f3f4f6', text: '#6b7280', label: status };

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 500,
          borderRadius: '9999px',
          backgroundColor: config.bg,
          color: config.text,
        }}
      >
        {config.label}
      </span>
    );
  };

  const showingStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = total > 0 ? Math.min((page - 1) * pageSize + transactions.length, total) : 0;

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                CHIP Transactions
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                View all payment transactions from CHIP gateway
              </p>
            </div>
          </div>

          <form className="row g-3 mb-4">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search ID, reference, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
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
                onClick={() => { setSearchQuery(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
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
                    Transaction ID
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
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: '48px 24px', color: '#6b7280', fontSize: '12px', borderBottom: 'none' }}>
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: '48px 24px', color: '#6b7280', fontSize: '12px', borderBottom: 'none' }}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                      onClick={() => {
                        setSelectedTransaction(txn);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', marginBottom: '2px' }}>
                          {txn.transaction_id}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          Ref: {txn.reference}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>
                          {txn.customer_first_name} {txn.customer_last_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {txn.customer_email}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>
                          {formatDate(txn.created_at)}
                        </div>
                        {txn.paid_at && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Paid: {formatDate(txn.paid_at)}
                          </div>
                        )}
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                          {formatCurrency(txn.total_amount, txn.currency)}
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
              Showing {showingStart} to {showingEnd} of {total} transactions
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

      {/* Transaction Details Modal */}
      <ChipTransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
}

