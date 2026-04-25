import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '@/lib/api-error-handler';
import { safeQuery } from '@/lib/db-safe-query';
import { withTimeout } from '@/lib/request-timeout';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });
  }

  const token = process.env.CHIP_API_KEY;

  if (!token) {
    return res.status(500).json({
      success: false,
      message: 'Chip API key not configured'
    });
  }

  // Get order details including refund amount - using safeQuery
  const orders = await safeQuery<Array<{
    id: number;
    reference: string;
    chip_payment_id: string | null;
    status: string;
    total_amount: number | string;
    refund_amount: number | string | null;
  }>>(
    `SELECT id, reference, chip_payment_id, status, total_amount, refund_amount 
     FROM orders 
     WHERE id = ?`,
    [orderId]
  );

  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const order = orders[0];

  if (!order.chip_payment_id) {
    return res.status(400).json({
      success: false,
      message: 'Order does not have a CHIP payment ID'
    });
  }

  if (order.status !== 'refund_pending') {
    return res.status(400).json({
      success: false,
      message: `Cannot release refund for order with status: ${order.status}. Only pending refunds can be released.`
    });
  }

  console.log(`🔓 Processing refund for order ${order.reference}`);

  // Get total amount and refund amount
  const totalAmount = typeof order.total_amount === 'string' 
    ? parseFloat(order.total_amount) 
    : order.total_amount;
  
  const refundAmount = order.refund_amount 
    ? (typeof order.refund_amount === 'string' ? parseFloat(order.refund_amount) : order.refund_amount)
    : totalAmount;

  // Determine if full or partial refund
  const isFullRefund = refundAmount >= totalAmount;
  const finalStatus = isFullRefund ? 'refunded' : 'partial_refund';

  console.log(`Refund type: ${isFullRefund ? 'FULL' : 'PARTIAL'} (MYR ${refundAmount} / MYR ${totalAmount})`);

  const refundAmountCents = Math.round(refundAmount * 100);

  // Call CHIP refund API - this ACTUALLY processes the refund
  const response = await fetch(
    `https://gate.chip-in.asia/api/v1/purchases/${order.chip_payment_id}/refund/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: refundAmountCents
      })
    }
  );

  const responseText = await response.text();
  console.log('CHIP Release Response Status:', response.status);
  console.log('CHIP Release Response:', responseText);

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Failed to parse CHIP response:', responseText);
    return res.status(500).json({
      success: false,
      message: 'Invalid response from payment gateway',
      error: responseText
    });
  }

  if (!response.ok) {
    console.error('❌ CHIP Release Error:', data);
    return res.status(400).json({
      success: false,
      message: 'Failed to release refund',
      error: data,
      details: data.errors || data.message || data.__all__ || 'Unknown error'
    });
  }

  console.log(`✅ Refund processed successfully via CHIP (${isFullRefund ? 'FULL' : 'PARTIAL'})`);

  // Update order status - 'refunded' for full, 'partial_refund' for partial - using safeQuery
  await safeQuery(
    `UPDATE orders 
     SET status = ?,
         updated_at = NOW(),
         notes = CONCAT(COALESCE(notes, ''), '\nRefund processed via CHIP (${isFullRefund ? 'Complete' : 'Partial'}: MYR ${refundAmount}) on ', NOW())
     WHERE id = ?`,
    [finalStatus, orderId]
  );

  return res.status(200).json({
    success: true,
    message: `${isFullRefund ? 'Complete' : 'Partial'} refund processed successfully. Funds sent to customer.`,
    refund: data,
    refundType: isFullRefund ? 'full' : 'partial',
    refundAmount: refundAmount,
    totalAmount: totalAmount
  });
}

// Apply middleware: error handling and timeout (longer timeout for external API)
export default withTimeout(withErrorHandling(handler), { timeoutMs: 60000 });

