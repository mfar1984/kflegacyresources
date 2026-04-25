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

  const { orderId, amount } = req.body;

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

  // Get order details - using safeQuery
  const orders = await safeQuery<Array<{
    id: number;
    reference: string;
    chip_payment_id: string | null;
    total_amount: number | string;
    status: string;
  }>>(
    `SELECT id, reference, chip_payment_id, total_amount, status 
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

  if (order.status !== 'paid') {
    return res.status(400).json({
      success: false,
      message: `Cannot refund order with status: ${order.status}. Only paid orders can be refunded.`
    });
  }

  // Calculate refund amount
  const totalAmount = typeof order.total_amount === 'string' 
    ? parseFloat(order.total_amount) 
    : order.total_amount;
  
  const refundAmount = amount || totalAmount;

  console.log(`🔄 Requesting refund for order ${order.reference}: MYR ${refundAmount}`);

  // NOTE: We DON'T call CHIP API here!
  // CHIP /refund/ API processes refund IMMEDIATELY (no hold state)
  // We only mark as refund_pending in our system for admin approval
  // When admin clicks "Accept" in Refunds page, THEN we call CHIP API

  // Update order status to 'refund_pending' and save refund amount - using safeQuery
  await safeQuery(
    `UPDATE orders 
     SET status = 'refund_pending',
         refund_amount = ?,
         updated_at = NOW(),
         notes = CONCAT(COALESCE(notes, ''), '\nRefund requested (pending admin approval): MYR ${refundAmount} on ', NOW())
     WHERE id = ?`,
    [refundAmount, orderId]
  );

  console.log('✅ Refund request marked as pending (awaiting admin approval)');

  return res.status(200).json({
    success: true,
    message: 'Refund request submitted. Waiting for admin approval in Refunds page.',
    refundAmount: refundAmount,
    note: 'Refund will be processed via CHIP when admin accepts it'
  });
}

// Apply middleware: error handling and timeout
export default withTimeout(withErrorHandling(handler));

