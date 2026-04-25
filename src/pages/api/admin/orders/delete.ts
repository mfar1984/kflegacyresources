import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
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

    // Get order details first to check if it can be deleted
    const orders = await query(
      `SELECT id, reference, status, chip_payment_id 
       FROM orders 
       WHERE id = ?`,
      [orderId]
    ) as Array<{
      id: number;
      reference: string;
      status: string;
      chip_payment_id: string | null;
    }>;

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Prevent deletion of paid orders (safety check)
    if (order.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid orders. Please refund first.'
      });
    }

    // Prevent deletion of refunded orders
    if (order.status === 'refunded' || order.status === 'partial_refund' || order.status === 'refund_pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete refunded or pending refund orders.'
      });
    }

    // SMART LOGIC: Check if order has CHIP payment ID
    if (order.chip_payment_id) {
      // Order exists in CHIP system - should use CANCEL instead of DELETE
      console.log(`⚠️  Order ${order.reference} has CHIP payment ID: ${order.chip_payment_id}`);
      console.log(`   → Should use CANCEL API instead of DELETE`);
      
      return res.status(400).json({
        success: false,
        message: 'Order has CHIP payment ID. Please use cancel instead of delete to maintain sync with CHIP.',
        suggestion: 'use_cancel_api',
        chip_payment_id: order.chip_payment_id
      });
    }

    // Order does NOT have CHIP payment ID - safe to delete from DB
    console.log(`🗑️  Deleting order ${order.reference} (status: ${order.status}, no CHIP ID)`);

    // Delete order items first (foreign key constraint)
    await query(
      `DELETE FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    // Delete order
    await query(
      `DELETE FROM orders WHERE id = ?`,
      [orderId]
    );

    console.log(`✅ Order ${order.reference} deleted successfully from local DB`);

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('💥 Delete order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

