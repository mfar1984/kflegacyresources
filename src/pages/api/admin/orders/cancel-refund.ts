import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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

    // Get order details
    const orders = await query(
      `SELECT id, reference, status, refund_amount, chip_payment_id 
       FROM orders 
       WHERE id = ?`,
      [orderId]
    ) as Array<{
      id: number;
      reference: string;
      status: string;
      refund_amount: number | string | null;
      chip_payment_id: string | null;
    }>;

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Only allow cancelling pending refunds
    if (order.status !== 'refund_pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel refund for order with status: ${order.status}`
      });
    }

    // Check CHIP status to ensure refund hasn't been processed yet
    if (order.chip_payment_id) {
      try {
        const chipResponse = await fetch(
          `https://gate.chip-in.asia/api/v1/purchases/${order.chip_payment_id}/`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (chipResponse.ok) {
          const chipData = await chipResponse.json();
          
          // If CHIP shows refunded status, cannot cancel
          if (chipData.status && (chipData.status === 'refunded' || chipData.status.toLowerCase().includes('refund'))) {
            console.error(`❌ Cannot cancel refund for ${order.reference}: Already refunded in CHIP`);
            return res.status(400).json({
              success: false,
              message: 'Cannot cancel refund: Money has already been refunded to customer via CHIP. Please create a new order if needed.',
              chipStatus: chipData.status
            });
          }
        }
      } catch (error) {
        console.warn('⚠️  Could not verify CHIP status:', error);
        // Continue anyway - allow cancel if CHIP check fails
      }
    }

    console.log(`🚫 Cancelling refund request for ${order.reference}`);

    // Update order back to 'paid' status and clear refund_amount
    await query(
      `UPDATE orders 
       SET status = 'paid',
           refund_amount = NULL,
           updated_at = NOW(),
           notes = CONCAT(COALESCE(notes, ''), '\nRefund request cancelled on ', NOW())
       WHERE id = ?`,
      [orderId]
    );

    console.log(`✅ Refund cancelled, order ${order.reference} restored to 'paid' status`);

    return res.status(200).json({
      success: true,
      message: 'Refund request cancelled successfully'
    });

  } catch (error) {
    console.error('💥 Cancel refund error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel refund',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

