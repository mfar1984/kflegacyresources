"use client";

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

interface ChipTransactionDetailsModalProps {
  transaction: ChipTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChipTransactionDetailsModal({ transaction, isOpen, onClose }: ChipTransactionDetailsModalProps) {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      paid: { bg: '#d1fae5', text: '#065f46', label: 'Paid' },
      failed: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
      cancelled: { bg: '#e5e7eb', text: '#374151', label: 'Cancelled' },
      refunded: { bg: '#dbeafe', text: '#1e40af', label: 'Complete Refund' },
      refund_pending: { bg: '#fef3c7', text: '#92400e', label: 'Refund on Hold' },
      partial_refund: { bg: '#fed7aa', text: '#9a3412', label: 'Partial Refund' },
    };

    const config = statusConfig[status] || { bg: '#f3f4f6', text: '#6b7280', label: status };

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
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Modal Content */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {/* Modal Header */}
          <div style={{ 
            padding: '24px', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h5 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#1f2937', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#3b82f6' }}>
                receipt_long
              </span>
              CHIP Transaction Details
            </h5>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px' }}>
            
            {/* Transaction Reference Section */}
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#1f2937', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>
                  numbers
                </span>
                TRANSACTION REFERENCE
              </h6>
              <DetailRow label="Order Reference" value={transaction.reference} />
              <DetailRow 
                label="CHIP Transaction ID" 
                value={
                  <span 
                    style={{ fontFamily: 'monospace', fontSize: '11px' }}
                    title={transaction.transaction_id}
                  >
                    {transaction.transaction_id}
                  </span>
                } 
              />
              <DetailRow label="Status" value={getStatusBadge(transaction.status)} />
            </div>

            {/* Customer Section */}
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#1f2937', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>
                  person
                </span>
                CUSTOMER
              </h6>
              <DetailRow label="Name" value={`${transaction.customer_first_name} ${transaction.customer_last_name}`} />
              <DetailRow label="Email" value={transaction.customer_email} />
              <DetailRow label="Phone" value={transaction.customer_phone} />
              {transaction.customer_address && (
                <DetailRow 
                  label="Address" 
                  value={`${transaction.customer_address}, ${transaction.customer_postcode} ${transaction.customer_city}${transaction.customer_state ? `, ${transaction.customer_state}` : ''}, ${transaction.customer_country}`}
                />
              )}
            </div>

            {/* Payment Details Section */}
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#1f2937', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>
                  payments
                </span>
                PAYMENT DETAILS
              </h6>
              <DetailRow label="Created on" value={formatDate(transaction.created_at)} />
              {transaction.paid_at && <DetailRow label="Paid on" value={formatDate(transaction.paid_at)} />}
              {transaction.updated_at && <DetailRow label="Last Updated" value={formatDate(transaction.updated_at)} />}
              <DetailRow label="Payment Method" value={transaction.payment_method?.toUpperCase() || 'N/A'} />
              <DetailRow 
                label="Amount" 
                value={
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>
                    {formatCurrency(transaction.total_amount, transaction.currency)}
                  </span>
                } 
              />
              {transaction.refund_amount && (
                <DetailRow 
                  label="Refunded Amount" 
                  value={
                    <span style={{ fontWeight: 600, color: '#dc2626' }}>
                      -{formatCurrency(transaction.refund_amount, transaction.currency)}
                    </span>
                  } 
                />
              )}
            </div>

            {/* Bank Details Section (if available) */}
            {(transaction.customer_bank_account || transaction.customer_bank_code) && (
              <div style={{ marginBottom: '24px' }}>
                <h6 style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>
                    account_balance
                  </span>
                  BANK DETAILS
                </h6>
                {transaction.customer_bank_holder_name && (
                  <DetailRow label="Account Holder" value={transaction.customer_bank_holder_name} />
                )}
                {transaction.customer_bank_code && (
                  <DetailRow label="Bank" value={transaction.customer_bank_code} />
                )}
                {transaction.customer_bank_account && (
                  <DetailRow 
                    label="Account Number" 
                    value={
                      <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                        {transaction.customer_bank_account}
                      </span>
                    }
                  />
                )}
              </div>
            )}

            {/* Notes Section */}
            {transaction.notes && (
              <div style={{ marginBottom: '24px' }}>
                <h6 style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6b7280' }}>
                    notes
                  </span>
                  NOTES
                </h6>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#4b5563',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '150px',
                  overflow: 'auto'
                }}>
                  {transaction.notes}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ 
                fontSize: '12px', 
                padding: '8px 16px', 
                fontWeight: 500,
                borderRadius: '6px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

