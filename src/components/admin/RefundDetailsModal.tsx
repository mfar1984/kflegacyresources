"use client";

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

interface RefundDetailsModalProps {
  refund: Refund | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RefundDetailsModal({ refund, isOpen, onClose }: RefundDetailsModalProps) {
  if (!isOpen || !refund) return null;

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

  const totalAmount = typeof refund.total_amount === 'string' ? parseFloat(refund.total_amount) : refund.total_amount;
  const refundAmount = refund.refund_amount 
    ? (typeof refund.refund_amount === 'string' ? parseFloat(refund.refund_amount) : refund.refund_amount)
    : totalAmount;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      refund_pending: { bg: '#fef3c7', text: '#92400e', label: 'Refund on Hold' },
      partial_refund: { bg: '#fed7aa', text: '#9a3412', label: 'Partial Refund' },
      refunded: { bg: '#dbeafe', text: '#1e40af', label: 'Complete Refund' },
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
              Refund Details
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
            
            {/* Order Reference Section */}
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
                ORDER REFERENCE
              </h6>
              <DetailRow label="Reference" value={refund.reference} />
              {refund.chip_payment_id && (
                <DetailRow 
                  label="CHIP ID" 
                  value={
                    <span 
                      style={{ fontFamily: 'monospace', fontSize: '11px' }}
                      title={refund.chip_payment_id}
                    >
                      {refund.chip_payment_id}
                    </span>
                  } 
                />
              )}
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
              <DetailRow label="Name" value={`${refund.customer_first_name} ${refund.customer_last_name}`} />
              <DetailRow label="Email" value={refund.customer_email} />
              <DetailRow label="Phone" value={refund.customer_phone} />
              {refund.customer_address && (
                <DetailRow 
                  label="Address" 
                  value={`${refund.customer_address}, ${refund.customer_postcode} ${refund.customer_city}${refund.customer_state ? `, ${refund.customer_state}` : ''}, ${refund.customer_country}`}
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
              <DetailRow label="Issued on" value={formatDate(refund.created_at)} />
              <DetailRow label="Paid on" value={formatDate(refund.paid_at)} />
              <DetailRow label="Refunded on" value={formatDate(refund.updated_at)} />
              <DetailRow label="Payment Method" value={refund.payment_method?.toUpperCase() || 'N/A'} />
            </div>

            {/* Refund Amount Section */}
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
                  attach_money
                </span>
                REFUND AMOUNT
              </h6>
              <DetailRow 
                label="Original Amount" 
                value={
                  <span style={{ fontWeight: 500 }}>
                    {formatCurrency(totalAmount, refund.currency)}
                  </span>
                } 
              />
              <DetailRow 
                label="Refunded Amount" 
                value={
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>
                    -{formatCurrency(refundAmount, refund.currency)}
                  </span>
                } 
              />
              {refund.status === 'partial_refund' && (
                <DetailRow 
                  label="Remaining Amount" 
                  value={
                    <span style={{ fontWeight: 500, color: '#059669' }}>
                      {formatCurrency(totalAmount - refundAmount, refund.currency)}
                    </span>
                  } 
                />
              )}
              <DetailRow 
                label="Status" 
                value={getStatusBadge(refund.status)} 
              />
            </div>

            {/* Bank Details Section (if available) */}
            {(refund.customer_bank_account || refund.customer_bank_code) && (
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
                  BANK DETAILS (FOR REFUND)
                </h6>
                {refund.customer_bank_holder_name && (
                  <DetailRow label="Account Holder" value={refund.customer_bank_holder_name} />
                )}
                {refund.customer_bank_code && (
                  <DetailRow label="Bank" value={refund.customer_bank_code} />
                )}
                {refund.customer_bank_account && (
                  <DetailRow 
                    label="Account Number" 
                    value={
                      <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                        {refund.customer_bank_account}
                      </span>
                    }
                  />
                )}
              </div>
            )}

            {/* Notes Section */}
            {refund.notes && (
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
                  {refund.notes}
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

