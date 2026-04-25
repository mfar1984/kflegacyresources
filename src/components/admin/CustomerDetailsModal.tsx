"use client";

import { useEffect, useState } from "react";

interface CustomerDetails {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string | null;
  postcode: string;
  country: string;
  total_orders: number;
  paid_orders: number;
  failed_orders: number;
  cancelled_orders: number;
  viewed_orders: number;
  total_spent: number | string;
  first_order_date: string;
  last_order_date: string;
}

interface Order {
  id: number;
  reference: string;
  chip_payment_id: string | null;
  status: string;
  total_amount: number | string;
  currency: string;
  payment_method: string | null;
  created_at: string;
  paid_at: string | null;
}

interface CustomerDetailsModalProps {
  email: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailsModal({ email, isOpen, onClose }: CustomerDetailsModalProps) {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && email) {
      fetchCustomerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, email]);

  const fetchCustomerDetails = async () => {
    if (!email) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.customer);
        setOrders(data.orders || []);
      } else {
        alert(`Failed to fetch customer details: ${data.message}`);
        onClose();
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to fetch customer details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !email) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | string, currency: string = 'MYR') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency} ${numAmount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      viewed: { bg: '#e0e7ff', text: '#3730a3', label: 'Viewed' },
      paid: { bg: '#d1fae5', text: '#065f46', label: 'Paid' },
      failed: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
      cancelled: { bg: '#e5e7eb', text: '#374151', label: 'Cancelled' },
      refunded: { bg: '#dbeafe', text: '#1e40af', label: 'Refunded' },
      refund_pending: { bg: '#fef3c7', text: '#92400e', label: 'Refund Pending' },
      partial_refund: { bg: '#fed7aa', text: '#9a3412', label: 'Partial Refund' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: config.bg,
          color: config.text,
          textTransform: 'capitalize'
        }}
      >
        {config.label}
      </span>
    );
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '200px 1fr', 
      gap: '16px', 
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6'
    }}>
      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center'
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-word'
      }}>
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', zIndex: 1050 }}
        tabIndex={-1}
        onClick={onClose}
      >
        <div 
          className="modal-dialog modal-xl modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '1000px' }}
        >
          <div className="modal-content" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <div>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                  Customer Details
                </h5>
                {customer && (
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {customer.first_name} {customer.last_name}
                  </p>
                )}
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                style={{ fontSize: '12px' }}
              />
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '24px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2" style={{ fontSize: '12px' }}>Loading customer details...</p>
                </div>
              ) : customer ? (
                <>
                  {/* Customer Information */}
                  <div style={{ marginBottom: '24px' }}>
                    <h6 style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: '#1f2937', 
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>person</span>
                      CUSTOMER INFORMATION
                    </h6>
                    <DetailRow label="Name" value={`${customer.first_name} ${customer.last_name}`} />
                    <DetailRow label="Email" value={customer.email} />
                    <DetailRow label="Phone" value={customer.phone} />
                    <DetailRow 
                      label="Address" 
                      value={`${customer.address}, ${customer.postcode} ${customer.city}${customer.state ? `, ${customer.state}` : ''}, ${customer.country}`} 
                    />
                  </div>

                  {/* Order Statistics */}
                  <div style={{ marginBottom: '24px' }}>
                    <h6 style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: '#1f2937', 
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>analytics</span>
                      ORDER STATISTICS
                    </h6>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      {/* Total Orders */}
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>Total Orders</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{customer.total_orders}</div>
                      </div>
                      
                      {/* Paid Orders */}
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#ecfdf5', 
                        borderRadius: '8px',
                        border: '1px solid #d1fae5'
                      }}>
                        <div style={{ fontSize: '11px', color: '#065f46', marginBottom: '4px', fontWeight: 500 }}>Paid Orders</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#065f46' }}>{customer.paid_orders}</div>
                      </div>
                      
                      {/* Total Spent */}
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#eff6ff', 
                        borderRadius: '8px',
                        border: '1px solid #dbeafe'
                      }}>
                        <div style={{ fontSize: '11px', color: '#1e40af', marginBottom: '4px', fontWeight: 500 }}>Total Spent</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e40af' }}>
                          {formatCurrency(customer.total_spent)}
                        </div>
                      </div>
                    </div>
                    
                    <DetailRow label="Failed Orders" value={customer.failed_orders} />
                    <DetailRow label="Cancelled Orders" value={customer.cancelled_orders} />
                    <DetailRow label="Viewed (Not Paid)" value={customer.viewed_orders} />
                    <DetailRow label="First Order" value={formatDate(customer.first_order_date)} />
                    <DetailRow label="Last Order" value={formatDate(customer.last_order_date)} />
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h6 style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: '#1f2937', 
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>receipt_long</span>
                      RECENT ORDERS (Last 10)
                    </h6>
                    {orders.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm mb-0" style={{ fontSize: '12px', borderCollapse: 'separate', borderSpacing: 0 }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reference</th>
                              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 16px', color: '#1f2937' }}>
                                  <div style={{ fontWeight: 500 }}>{order.reference}</div>
                                  {order.chip_payment_id && (
                                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                      {order.chip_payment_id.substring(0, 8)}...
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '12px 16px' }}>{getStatusBadge(order.status)}</td>
                                <td style={{ padding: '12px 16px', color: '#1f2937', fontWeight: 500 }}>
                                  {formatCurrency(order.total_amount, order.currency)}
                                </td>
                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{formatDate(order.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>No orders found.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted" style={{ fontSize: '12px' }}>No customer data available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 500 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

