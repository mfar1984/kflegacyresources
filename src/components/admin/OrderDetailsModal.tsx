"use client";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number | string;
  quantity: number;
  selected_options: string | object | null;
  subtotal: number | string;
}

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
  total_amount: number | string;
  refund_amount?: number | string | null;
  currency: string;
  status: 'pending' | 'viewed' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'refund_pending' | 'partial_refund';
  payment_method: string | null;
  chip_payment_id: string | null;
  customer_bank_account?: string | null;
  customer_bank_code?: string | null;
  customer_bank_holder_name?: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  items?: OrderItem[];
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: number, status: Order['status'], paidAt?: string | null) => Promise<void> | void;
}

export default function OrderDetailsModal({ order, isOpen, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            Refunded: {order.currency} {refundAmt.toFixed(2)} / {order.currency} {totalAmt.toFixed(2)}
          </span>
        </div>
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

  const handlePrintInvoice = () => {
    // Helper to escape HTML entities for safe interpolation
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const itemsHtml = (order.items || [])
      .map((item) => {
        const priceNum = typeof item.product_price === 'string' ? parseFloat(item.product_price) : item.product_price;
        const subtotalNum = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;
        const optionsStr = item.selected_options
          ? (typeof item.selected_options === 'string' ? item.selected_options : JSON.stringify(item.selected_options))
          : '';
        const optionsLine = optionsStr && optionsStr !== '{}' && optionsStr !== 'null'
          ? `<div style="font-size:11px;color:#6b7280;margin-top:2px;">${escapeHtml(optionsStr)}</div>`
          : '';
        return `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
              <div style="font-size:12px;color:#111827;">${escapeHtml(item.product_name)}</div>
              ${optionsLine}
            </td>
            <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;">${item.quantity}</td>
            <td style="padding:8px 12px;text-align:right;border-bottom:1px solid #f3f4f6;">${formatCurrency(priceNum, order.currency)}</td>
            <td style="padding:8px 12px;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:600;">${formatCurrency(subtotalNum, order.currency)}</td>
          </tr>
        `;
      })
      .join('');

    const totalStr = formatCurrency(order.total_amount, order.currency);
    const paidLine = order.paid_at
      ? `<div style="font-size:12px;color:#111827;font-weight:500;">Paid Date: ${formatDate(order.paid_at)}</div>`
      : '';
    const paymentMethodLine = order.payment_method
      ? `<div style="font-size:12px;color:#111827;font-weight:500;">Payment Method: ${escapeHtml(order.payment_method)}</div>`
      : '';

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${escapeHtml(order.reference)}</title>
    <style>
      body { font-family: Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #111827; margin: 24px; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
      .card-header { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
      .card-body { padding: 24px; }
      .muted { color: #6b7280; }
      table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
      thead th { padding: 8px 12px; font-size: 11px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; background: #f9fafb; text-align: left; }
      tfoot td { padding: 12px; font-size: 14px; font-weight: 600; }
      .totals-row td:first-child { text-align: right; }
      @media print { .no-print { display: none; } body { margin: 0; } .wrapper { margin: 0; } }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="card-header">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:16px;font-weight:600;">Invoice</div>
              <div class="muted" style="font-size:12px;">Reference: ${escapeHtml(order.reference)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px;color:#111827;font-weight:500;">Order Date: ${formatDate(order.created_at)}</div>
              ${paidLine}
              ${paymentMethodLine}
            </div>
          </div>
        </div>
        <div class="card-body">
          <div style="display:flex;gap:24px;margin-bottom:16px;">
            <div style="flex:1;">
              <div class="muted" style="font-size:11px;margin-bottom:4px;">Billed To</div>
              <div style="font-size:12px;font-weight:500;">${escapeHtml(order.customer_first_name)} ${escapeHtml(order.customer_last_name)}</div>
              <div style="font-size:12px;">${escapeHtml(order.customer_email)}</div>
              <div style="font-size:12px;">${escapeHtml(order.customer_phone)}</div>
              <div style="font-size:12px;">${escapeHtml(order.customer_address)}</div>
              <div style="font-size:12px;">${escapeHtml(order.customer_postcode)} ${escapeHtml(order.customer_city)}${order.customer_state ? ", " + escapeHtml(order.customer_state) : ''}</div>
            </div>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || `<tr><td colspan="4" style="padding:24px;text-align:center;color:#6b7280;">No items found.</td></tr>`}
              </tbody>
              <tfoot>
                <tr class="totals-row">
                  <td colspan="3">Total:</td>
                  <td style="text-align:right;">${totalStr}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div class="no-print" style="margin-top:16px;text-align:right;">
        <button onclick="window.print()" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;">Print</button>
      </div>
    </div>
  </body>
  </html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Give browser a tick to render before printing
    setTimeout(() => {
      try { printWindow.print(); } catch {}
    }, 150);
  };

  const handleMarkPaid = async () => {
    if (!onUpdateStatus || !order) return;
    const now = new Date();
    const paidAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    await onUpdateStatus(order.id, 'paid', paidAt);
    onClose();
  };

  const handleMarkCancelled = async () => {
    if (!onUpdateStatus || !order) return;
    await onUpdateStatus(order.id, 'cancelled', null);
    onClose();
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

  const handleResendInvoice = async () => {
    if (!order) return;

    if (!order.chip_payment_id) {
      alert('This order does not have a CHIP payment ID. Cannot resend invoice.');
      return;
    }

    if (!confirm(`Resend invoice to ${order.customer_email}?\n\nThis will send a new payment invoice email from CHIP to the customer.`)) {
      return;
    }

    try {
      const response = await fetch('/api/chip-asia/resend-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Invoice Resent Successfully!\n\nSent to: ${order.customer_email}\n\nCustomer will receive the payment invoice email from CHIP shortly.`);
      } else {
        alert(`❌ Failed to Resend Invoice\n\n${data.message}`);
      }
    } catch (error) {
      console.error('Resend invoice error:', error);
      alert(`❌ Failed to Resend Invoice\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    
    if (order.status !== 'paid') {
      alert('Only paid orders can be refunded');
      return;
    }

    if (!order.chip_payment_id) {
      alert('This order does not have a CHIP payment ID. Cannot process refund.');
      return;
    }

    const totalAmount = typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount;
    
    // Prompt for refund amount
    const refundAmountStr = prompt(
      `Enter refund amount:\n\nOrder Total: ${order.currency} ${totalAmount.toFixed(2)}\n\nEnter amount to refund (or leave blank for full refund):`,
      totalAmount.toFixed(2)
    );

    if (refundAmountStr === null) return; // User cancelled

    const refundAmount = refundAmountStr.trim() === '' ? totalAmount : parseFloat(refundAmountStr);

    // Validate refund amount
    if (isNaN(refundAmount) || refundAmount <= 0) {
      alert('Invalid refund amount. Please enter a valid positive number.');
      return;
    }

    if (refundAmount > totalAmount) {
      alert(`Refund amount (${order.currency} ${refundAmount.toFixed(2)}) cannot exceed order total (${order.currency} ${totalAmount.toFixed(2)})`);
      return;
    }

    const refundType = refundAmount >= totalAmount ? 'Full' : 'Partial';
    const confirmed = confirm(
      `Confirm ${refundType} Refund Request?\n\nRefund Amount: ${order.currency} ${refundAmount.toFixed(2)}\nOrder Total: ${order.currency} ${totalAmount.toFixed(2)}\n\nThis will mark the refund as pending. You need to approve it in the Refunds page to process via CHIP.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/chip-asia/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id,
          amount: refundAmount 
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${refundType} Refund Requested!\n\nAmount: ${order.currency} ${refundAmount.toFixed(2)}\nStatus: Pending Admin Approval\n\nPlease go to Refunds page to accept and process the refund via CHIP.`);
        if (onUpdateStatus) {
          await onUpdateStatus(order.id, 'refund_pending', null);
        }
        onClose();
      } else {
        alert(`❌ Refund Request Failed\n\n${data.message}\n\n${JSON.stringify(data.details || data.error, null, 2)}`);
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert(`❌ Refund Request Failed\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        tabIndex={-1} 
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
              <div>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                  Order Details
                </h5>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Reference: {order.reference}
                </p>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                style={{ fontSize: '12px' }}
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '24px' }}>
              
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
                <DetailRow label="Reference" value={order.reference} />
                {order.chip_payment_id && (
                  <DetailRow 
                    label="CHIP ID" 
                    value={
                      <span 
                        style={{ fontFamily: 'monospace', fontSize: '11px' }}
                        title={order.chip_payment_id}
                      >
                        {order.chip_payment_id}
                      </span>
                    } 
                  />
                )}
                <DetailRow label="Status" value={getStatusBadge(order)} />
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
                <DetailRow label="Name" value={`${order.customer_first_name} ${order.customer_last_name}`} />
                <DetailRow label="Email" value={order.customer_email} />
                <DetailRow label="Phone" value={order.customer_phone} />
                <DetailRow 
                  label="Address" 
                  value={`${order.customer_address}, ${order.customer_postcode} ${order.customer_city}${order.customer_state ? `, ${order.customer_state}` : ''}, ${order.customer_country}`}
                />
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
                <DetailRow label="Order Date" value={formatDate(order.created_at)} />
                {order.paid_at && <DetailRow label="Paid Date" value={formatDate(order.paid_at)} />}
                {order.payment_method && <DetailRow label="Payment Method" value={order.payment_method.toUpperCase()} />}
                <DetailRow 
                  label="Total Amount" 
                  value={
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                      {formatCurrency(order.total_amount, order.currency)}
                    </span>
                  } 
                />
                {order.refund_amount && (
                  <DetailRow 
                    label="Refunded Amount" 
                    value={
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>
                        -{formatCurrency(order.refund_amount, order.currency)}
                      </span>
                    } 
                  />
                )}
              </div>

              {/* Bank Details (if provided) */}
              {(order.customer_bank_account || order.customer_bank_code) && (
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
                  {order.customer_bank_holder_name && (
                    <DetailRow label="Account Holder" value={order.customer_bank_holder_name} />
                  )}
                  {order.customer_bank_code && (
                    <DetailRow label="Bank" value={order.customer_bank_code} />
                  )}
                  {order.customer_bank_account && (
                    <DetailRow 
                      label="Account Number" 
                      value={
                        <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                          {order.customer_bank_account}
                        </span>
                      }
                    />
                  )}
                </div>
              )}

              {/* Order Items */}
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
                    shopping_cart
                  </span>
                  ORDER ITEMS
                </h6>
                {order.items && order.items.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0" style={{ fontSize: '12px', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '8px 12px', fontSize: '11px', color: '#6b7280', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>Product</th>
                          <th style={{ padding: '8px 12px', fontSize: '11px', color: '#6b7280', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Qty</th>
                          <th style={{ padding: '8px 12px', fontSize: '11px', color: '#6b7280', fontWeight: 500, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Price</th>
                          <th style={{ padding: '8px 12px', fontSize: '11px', color: '#6b7280', fontWeight: 500, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '8px 12px', fontSize: '12px', color: '#1f2937' }}>
                              {item.product_name}
                              {item.selected_options && (() => {
                                const optionsStr = typeof item.selected_options === 'string' 
                                  ? item.selected_options 
                                  : JSON.stringify(item.selected_options);
                                // Only show if not empty object
                                if (optionsStr && optionsStr !== '{}' && optionsStr !== 'null') {
                                  return (
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                      {optionsStr}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: '12px', color: '#1f2937', textAlign: 'center' }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: '12px', color: '#1f2937', textAlign: 'right' }}>
                              {formatCurrency(item.product_price, order.currency)}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: '12px', color: '#1f2937', textAlign: 'right', fontWeight: 500 }}>
                              {formatCurrency(item.subtotal, order.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ borderTop: '2px solid #e5e7eb' }}>
                        <tr>
                          <td colSpan={3} style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#1f2937', textAlign: 'right' }}>
                            Total:
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: '#1f2937', textAlign: 'right' }}>
                            {formatCurrency(order.total_amount, order.currency)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>No items found.</p>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
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
                    {order.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
              <div className="me-auto d-flex gap-2">
                {/* Mark Paid button - ONLY show for non-refunded orders */}
                {order.status !== 'refunded' && order.status !== 'partial_refund' && order.status !== 'refund_pending' && (
                  <>
                    {order.status === 'paid' ? (
                      <button
                        type="button"
                        className="btn btn-success disabled"
                        disabled
                        style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                      >
                        <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>check_circle</span>
                        Paid
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleMarkPaid}
                        style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                      >
                        <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>check_circle</span>
                        Mark Paid
                      </button>
                    )}
                  </>
                )}

                {/* Cancel Order - only for pending orders */}
                {order.status === 'pending' && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleMarkCancelled}
                    style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                  >
                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>block</span>
                    Cancel Order
                  </button>
                )}

                {/* Refund button - only for paid orders with CHIP ID, not already refunded */}
                {order.status === 'paid' && order.chip_payment_id && (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleRefund}
                    style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                  >
                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>currency_exchange</span>
                    Refund
                  </button>
                )}

                {/* Show refund status for refunded orders */}
                {(order.status === 'refunded' || order.status === 'partial_refund' || order.status === 'refund_pending') && (
                  <button
                    type="button"
                    className="btn btn-info disabled"
                    disabled
                    style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                  >
                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>currency_exchange</span>
                    {order.status === 'refund_pending' ? 'Refund Pending' : order.status === 'partial_refund' ? 'Partial Refund' : 'Refunded'}
                  </button>
                )}
              </div>
              {/* Resend Invoice - for orders with CHIP payment ID */}
              {order.chip_payment_id && (
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={handleResendInvoice}
                  style={{ fontSize: '12px', padding: '8px 12px', fontWeight: 500 }}
                >
                  <span className="material-symbols-outlined me-1" style={{ fontSize: '16px', verticalAlign: 'middle' }}>mail</span>
                  Resend Invoice
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 500 }}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handlePrintInvoice}
                style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 500 }}
              >
                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px', verticalAlign: 'middle' }}>print</span>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

