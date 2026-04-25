"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import OrderDetailsModal from "./OrderDetailsModal";
import styles from "./OrdersManagement.module.css";

interface Order {
  id: number;
  reference: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string | null;
  customer_postcode: string;
  customer_country: string;
  total_amount: number | string; // Database may return as string
  refund_amount?: number | string | null; // Amount refunded for partial refunds
  currency: string;
  status: 'pending' | 'viewed' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'refund_pending' | 'partial_refund';
  payment_method: string | null;
  chip_payment_id: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  items?: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_price: number | string;
    quantity: number;
    selected_options: string | object | null;
    subtotal: number | string;
  }>;
}

export default function OrdersManagement() {
  // Add hover effect styles
  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };
  
  const handleRowLeave = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = '#ffffff';
  };
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusSavingId, setStatusSavingId] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside dropdown or trigger
      if (dropdownRef.current?.contains(target)) {
        return;
      }
      
      // Check if click is on any trigger button
      const clickedTrigger = Object.values(triggerRef.current).some(
        (ref) => ref?.contains(target)
      );
      
      if (clickedTrigger) {
        return;
      }
      
      // Click outside - close menu
      setOpenMenuId(null);
      setDropdownPosition(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle toggle dropdown
  const handleToggleDropdown = (orderId: number) => {
    if (openMenuId === orderId) {
      setOpenMenuId(null);
      setDropdownPosition(null);
    } else {
      const trigger = triggerRef.current[orderId];
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.right + window.scrollX - 240 // 240 is dropdown width
        });
        setOpenMenuId(orderId);
      }
    }
  };
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders function (extracted for reuse)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter.trim()) params.set('status', statusFilter.trim());
      if (dateFrom.trim()) params.set('from', dateFrom.trim());
      if (dateTo.trim()) params.set('to', dateTo.trim());

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } else {
        setOrders([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from database (server-side pagination + filters)
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, dateFrom, dateTo, page, pageSize]);

  const getStatusBadge = (order: Order) => {
    const { status } = order;
    
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      viewed: { bg: '#e0e7ff', text: '#3730a3', label: 'Viewed' },
      paid: { bg: '#d1fae5', text: '#065f46', label: 'Paid' },
      failed: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
      cancelled: { bg: '#e5e7eb', text: '#374151', label: 'Cancelled' },
      refunded: { bg: '#dbeafe', text: '#1e40af', label: 'Complete Refund' },
      refund_pending: { bg: '#fef3c7', text: '#92400e', label: 'Refund on Hold' },
      partial_refund: { bg: '#fed7aa', text: '#9a3412', label: 'Partial Refund' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    // For partial refunds, show amount details
    if (status === 'partial_refund' && order.refund_amount) {
      const refundAmt = typeof order.refund_amount === 'string' ? parseFloat(order.refund_amount) : order.refund_amount;
      const totalAmt = typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount;
      
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
          title={`Refunded: ${order.currency} ${refundAmt.toFixed(2)} of ${order.currency} ${totalAmt.toFixed(2)}`}
        >
          {config.label} ({order.currency} {refundAmt.toFixed(2)})
        </span>
      );
    }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

  // Display helpers
  const showingStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = total > 0 ? (page - 1) * pageSize + orders.length : 0;

  // Handle view order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Handle smart cancel/delete order
  const handleDeleteOrder = async (order: Order) => {
    // Safety checks
    if (order.status === 'paid') {
      alert('Cannot delete paid orders. Please refund the order first.');
      return;
    }

    if (order.status === 'refunded' || order.status === 'partial_refund' || order.status === 'refund_pending') {
      alert('Cannot delete refunded or pending refund orders.');
      return;
    }

    // SMART LOGIC: Determine if we should CANCEL or DELETE
    const hasChipId = !!order.chip_payment_id;
    const action = hasChipId ? 'CANCEL' : 'DELETE';
    const actionVerb = hasChipId ? 'cancel' : 'delete';
    const actionMessage = hasChipId 
      ? 'This will cancel the purchase in CHIP and update the order status to "cancelled".'
      : 'This will permanently delete the order from the database.';

    const confirmed = confirm(
      `Are you sure you want to ${actionVerb} this order?\n\n` +
      `Reference: ${order.reference}\n` +
      `Customer: ${order.customer_first_name} ${order.customer_last_name}\n` +
      `Amount: ${order.currency} ${typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}\n` +
      `${hasChipId ? `CHIP ID: ${order.chip_payment_id}\n` : ''}\n` +
      `Action: ${action}\n` +
      `${actionMessage}\n\n` +
      `${hasChipId ? 'The order will remain in the database with status "cancelled".' : 'This action cannot be undone!'}`
    );

    if (!confirmed) return;

    try {
      let response;
      
      if (hasChipId) {
        // Use CANCEL API for orders with CHIP payment ID
        console.log(`🚫 Cancelling order ${order.reference} via CHIP API`);
        response = await fetch('/api/chip-asia/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });
      } else {
        // Use DELETE API for orders without CHIP payment ID
        console.log(`🗑️  Deleting order ${order.reference} from local DB`);
        response = await fetch('/api/admin/orders/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });
      }

      const data = await response.json();

      if (data.success) {
        alert(hasChipId 
          ? `Order cancelled successfully!\n\nThe purchase has been cancelled in CHIP and the order status updated to "cancelled".`
          : 'Order deleted successfully!'
        );
        // Refresh orders list
        fetchOrders();
      } else {
        // Check if delete API suggested to use cancel instead
        if (data.suggestion === 'use_cancel_api') {
          const useCancel = confirm(
            `This order has a CHIP payment ID and should be cancelled instead of deleted.\n\n` +
            `CHIP ID: ${data.chip_payment_id}\n\n` +
            `Click OK to cancel via CHIP, or Cancel to abort.`
          );
          
          if (useCancel) {
            // Recursively call with the understanding it has CHIP ID
            // The function will now use cancel API
            await handleDeleteOrder(order);
          }
        } else {
          alert(`Failed to ${actionVerb} order: ${data.message}`);
        }
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      alert(`Failed to ${actionVerb} order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  // Update status handler (from modal)
  const updateOrderStatus = async (orderId: number, status: Order['status'], paidAt?: string | null) => {
    try {
      setStatusSavingId(orderId);
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paid_at: typeof paidAt === 'string' ? paidAt : paidAt ?? undefined })
      });
      // Refresh current page data after update
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter.trim()) params.set('status', statusFilter.trim());
      if (dateFrom.trim()) params.set('from', dateFrom.trim());
      if (dateTo.trim()) params.set('to', dateTo.trim());
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
        setTotal(data.pagination?.total ?? total);
        setTotalPages(data.pagination?.totalPages ?? totalPages);
        setToastType('success');
        setToastMessage(`Status updated to ${status}`);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
      }
    } catch {
      // no-op; UI remains
      setToastType('error');
      setToastMessage('Failed to update status');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
    } finally {
      setStatusSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {toastVisible && (
        <div className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert"
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 1100, fontSize: '12px', padding: '8px 12px', borderRadius: '8px' }}>
          {toastMessage}
        </div>
      )}
      {/* Main Container Card - EXACT from RISDA */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {/* Page Header - EXACT from RISDA */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                Orders & Payments
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Manage customer orders and payments
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary d-flex align-items-center" 
                style={{ 
                  fontSize: '12px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>add_circle</span>
                Add Order
              </button>
            </div>
          </div>

          {/* Filter Section - NO CARD, just form with white background inputs */}
          <form className="row g-3 mb-4">
            {/* Search */}
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search name, email or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  backgroundImage: 'none'
                }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="viewed">Viewed</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Date From */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="Date From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Date To */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="Date To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Reset Button */}
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setDateFrom('');
                  setDateTo('');
                }}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  borderColor: '#dc2626',
                  color: '#dc2626'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Orders Table - EXACT from RISDA (overflow-x-auto with shadow and ring) */}
          <div className="overflow-x-auto shadow" style={{ 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'visible'
          }}>
            <table className="table mb-0" style={{ 
              fontSize: '12px',
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>
                    Order
                  </th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>
                    Status
                  </th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>
                    Date
                  </th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>
                    Amount
                  </th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ 
                      padding: '48px 24px',
                      color: '#6b7280', 
                      fontSize: '12px',
                      borderBottom: 'none'
                    }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      onMouseEnter={handleRowHover}
                      onMouseLeave={handleRowLeave}
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.15s',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', marginBottom: '2px' }}>
                            {order.reference}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {order.customer_first_name} {order.customer_last_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {order.customer_email}
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        {getStatusBadge(order)}
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#1f2937' }}>
                          {formatDate(order.created_at)}
                        </div>
                        {order.paid_at && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Paid: {formatDate(order.paid_at)}
                          </div>
                        )}
                      </td>
                      <td className={styles.tableCell}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                          {formatCurrency(order.total_amount, order.currency)}
                        </div>
                        {order.payment_method && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {order.payment_method}
                          </div>
                        )}
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionsContainer}>
                          {/* Status Actions Dropdown */}
                          <div className={styles.dropdownWrapper}>
                            <button 
                              ref={(el) => { triggerRef.current[order.id] = el; }}
                              onClick={() => handleToggleDropdown(order.id)}
                              className={styles.actionButton}
                              style={{ color: '#111827' }}
                              title="Actions"
                            >
                              <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                                format_list_bulleted
                              </span>
                            </button>
                          </div>
                          {/* View */}
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className={styles.actionButton}
                            style={{ color: '#2563eb' }}
                            title="View"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              visibility
                            </span>
                          </button>

                          {/* Delete */}
                          <button 
                            onClick={() => handleDeleteOrder(order)}
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

          {/* Pagination - EXACT from RISDA */}
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {showingStart} to {showingEnd} of {total} orders
            </div>
            <nav>
              <ul className="pagination mb-0" style={{ gap: '4px' }}>
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link border-0" 
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ 
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: page <= 1 ? '#f3f4f6' : '#ffffff',
                      color: page <= 1 ? '#9ca3af' : '#111827',
                      border: page <= 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    Previous
                  </button>
                </li>
                <li className="page-item active">
                  <button 
                    className="page-link border-0" 
                    style={{ 
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 500
                    }}
                  >
                    {page}
                  </button>
                </li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link border-0" 
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{ 
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: page >= totalPages ? '#f3f4f6' : '#ffffff',
                      color: page >= totalPages ? '#9ca3af' : '#111827',
                      border: page >= totalPages ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={showModal}
        onClose={closeModal}
        onUpdateStatus={updateOrderStatus}
      />

      {/* Portal Dropdown Menu */}
      {mounted && openMenuId !== null && dropdownPosition && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            zIndex: 999999,
            minWidth: '240px',
            overflow: 'hidden'
          }}
        >
          <ul className={styles.dropdownList}>
            {/* NOTE: Only allow paid, failed, cancelled - NO "Set Pending" option */}
            {/* NOTE: 'refunded' removed from dropdown - use "Refund" button in Order Details modal instead (with CHIP API integration) */}
            {(['paid','failed','cancelled'] as Order['status'][])
              .filter((s) => {
                const order = orders.find(o => o.id === openMenuId);
                return order && s !== order.status;
              })
              .map((s) => (
                <li key={s} className={styles.dropdownItem}>
                  <button 
                    disabled={statusSavingId === openMenuId} 
                    onClick={async () => {
                      if (!openMenuId) return;
                      const now = new Date();
                      const paidAt = s === 'paid'
                        ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
                        : null;
                      await updateOrderStatus(openMenuId, s, paidAt);
                      setOpenMenuId(null);
                      setDropdownPosition(null);
                    }} 
                    className={styles.dropdownButton}
                  >
                    {s === 'paid' ? 'Mark as Paid' : s === 'failed' ? 'Mark as Failed' : 'Cancel Order'}
                  </button>
                </li>
              ))}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}


