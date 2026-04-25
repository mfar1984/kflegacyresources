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

    // Get CHIP API key
    const token = process.env.CHIP_API_KEY;
    if (!token) {
      return res.status(500).json({
        success: false,
        message: 'CHIP API key not configured'
      });
    }

    // Get order details (with customer info for analytics)
    const orders = await query(
      `SELECT 
        id, reference, status, chip_payment_id,
        customer_first_name, customer_last_name, customer_email, customer_phone,
        total_amount, currency, created_at, updated_at
       FROM orders 
       WHERE id = ?`,
      [orderId]
    ) as Array<{
      id: number;
      reference: string;
      status: string;
      chip_payment_id: string | null;
      customer_first_name: string;
      customer_last_name: string;
      customer_email: string;
      customer_phone: string | null;
      total_amount: number | string;
      currency: string;
      created_at: string;
      updated_at: string;
    }>;

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Validate order has CHIP payment ID
    if (!order.chip_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Order does not have a CHIP payment ID. Use delete instead.'
      });
    }

    // Validate order can be cancelled
    if (order.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel paid orders. Please use refund instead.'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'refunded' || order.status === 'partial_refund' || order.status === 'refund_pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel refunded orders'
      });
    }

    console.log(`🚫 Cancelling CHIP purchase for order ${order.reference}`);
    console.log(`   CHIP Payment ID: ${order.chip_payment_id}`);
    console.log(`   Current status: ${order.status}`);

    // Call CHIP Cancel API
    const response = await fetch(
      `https://gate.chip-in.asia/api/v1/purchases/${order.chip_payment_id}/cancel/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = await response.text();
    console.log(`CHIP Cancel Response Status: ${response.status}`);
    console.log(`CHIP Cancel Response: ${responseText}`);

    if (response.ok) {
      console.log(`✅ Purchase cancelled successfully in CHIP`);

      // Calculate days until cancel (for analytics)
      const createdDate = new Date(order.created_at);
      const now = new Date();
      const daysUntilCancel = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      // Log analytics BEFORE updating order status
      console.log(`📊 Logging analytics for ${order.reference}`);
      try {
        await query(
          `INSERT INTO order_analytics (
            order_id, reference, chip_payment_id,
            customer_email, customer_name, customer_phone,
            total_amount, currency, status_before_cancel,
            order_created_at, order_viewed_at, order_cancelled_at,
            days_until_cancel, cancel_reason, cancel_method, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'manual_admin', 'chip_api', ?)`,
          [
            order.id,
            order.reference,
            order.chip_payment_id,
            order.customer_email,
            `${order.customer_first_name} ${order.customer_last_name}`,
            order.customer_phone,
            order.total_amount,
            order.currency,
            order.status,
            order.created_at,
            order.created_at, // viewed_at = created_at for manual cancel
            daysUntilCancel,
            `Manually cancelled by admin after ${daysUntilCancel} days`
          ]
        );
        console.log(`✅ Analytics logged`);
      } catch (analyticsError) {
        console.warn(`⚠️  Failed to log analytics:`, analyticsError);
        // Continue anyway - don't block cancel if analytics fails
      }

      // Update order status to 'cancelled' in local DB
      await query(
        `UPDATE orders 
         SET status = 'cancelled',
             updated_at = NOW(),
             notes = CONCAT(COALESCE(notes, ''), '\nPurchase cancelled via CHIP (manual admin) on ', NOW())
         WHERE id = ?`,
        [orderId]
      );

      console.log(`✅ Order ${order.reference} status updated to 'cancelled'`);

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully in CHIP and local database',
        chip_response: responseText ? JSON.parse(responseText) : null
      });

    } else {
      console.error(`❌ CHIP Cancel Error: ${responseText}`);
      
      // Try to parse error
      let errorMessage = 'Failed to cancel purchase in CHIP';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Use response text as is
        errorMessage = responseText || errorMessage;
      }

      return res.status(response.status).json({
        success: false,
        message: errorMessage,
        chip_response: responseText
      });
    }

  } catch (error) {
    console.error('💥 Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

