import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

/**
 * Auto-cancel API for orders older than 1 month
 * 
 * Purpose: Clean up "viewed" orders automatically while preserving analytics data
 * 
 * Features:
 * - Cancels orders with status "viewed" older than 30 days
 * - Logs analytics before cancellation
 * - Calls CHIP API to cancel purchase
 * - Updates local database status
 * 
 * Usage:
 * - Run manually: POST /api/admin/orders/auto-cancel
 * - Or setup cron job to run daily
 */

interface Order {
  id: number;
  reference: string;
  chip_payment_id: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number | string;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const CHIP_API_KEY = process.env.CHIP_API_KEY;
    if (!CHIP_API_KEY) {
      throw new Error('CHIP_API_KEY is not set in environment variables.');
    }

    // Get "viewed" orders older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`🔍 Searching for 'viewed' orders older than ${cutoffDate}`);

    const orders = await query(
      `SELECT 
        id, reference, chip_payment_id, 
        customer_first_name, customer_last_name, customer_email, customer_phone,
        total_amount, currency, status, created_at, updated_at
       FROM orders 
       WHERE status = 'viewed' 
       AND DATE(created_at) < ?
       ORDER BY created_at ASC`,
      [cutoffDate]
    ) as Order[];

    if (orders.length === 0) {
      console.log('✅ No orders to cancel (all clean!)');
      return res.status(200).json({
        success: true,
        message: 'No orders to cancel',
        cancelled: 0,
        failed: 0
      });
    }

    console.log(`📋 Found ${orders.length} orders to cancel`);

    let cancelled = 0;
    let failed = 0;
    const results: Array<{reference: string; status: string; message: string}> = [];

    for (const order of orders) {
      try {
        console.log(`\n🔄 Processing: ${order.reference} (${order.id})`);

        // Calculate days until cancel
        const createdDate = new Date(order.created_at);
        const now = new Date();
        const daysUntilCancel = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        // 1. Save to analytics BEFORE cancelling
        console.log(`📊 Logging analytics for ${order.reference}`);
        
        await query(
          `INSERT INTO order_analytics (
            order_id, reference, chip_payment_id,
            customer_email, customer_name, customer_phone,
            total_amount, currency, status_before_cancel,
            order_created_at, order_viewed_at, order_cancelled_at,
            days_until_cancel, cancel_reason, cancel_method, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'auto_cleanup', 'chip_api', ?)`,
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
            order.created_at, // viewed_at = created_at for "viewed" status
            daysUntilCancel,
            `Auto-cancelled after ${daysUntilCancel} days of inactivity`
          ]
        );

        console.log(`✅ Analytics logged`);

        // 2. Cancel via CHIP API (if has chip_payment_id)
        if (order.chip_payment_id) {
          console.log(`🚫 Cancelling in CHIP: ${order.chip_payment_id}`);
          
          const chipResponse = await fetch(
            `https://gate.chip-in.asia/api/v1/purchases/${order.chip_payment_id}/cancel/`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${CHIP_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (chipResponse.ok) {
            console.log(`✅ Cancelled in CHIP`);
          } else {
            const errorData = await chipResponse.json().catch(() => ({}));
            console.warn(`⚠️  CHIP cancel failed: ${JSON.stringify(errorData)}`);
            // Continue anyway - cancel in local DB
          }
        } else {
          console.log(`⚠️  No CHIP payment ID - skipping CHIP cancel`);
        }

        // 3. Update local database status to "cancelled"
        await query(
          `UPDATE orders 
           SET status = 'cancelled',
               updated_at = NOW(),
               notes = CONCAT(
                 COALESCE(notes, ''), 
                 '\nAuto-cancelled after ${daysUntilCancel} days (viewed but not paid) on ', 
                 NOW()
               )
           WHERE id = ?`,
          [order.id]
        );

        console.log(`✅ ${order.reference} cancelled successfully`);
        
        cancelled++;
        results.push({
          reference: order.reference,
          status: 'success',
          message: `Cancelled after ${daysUntilCancel} days`
        });

      } catch (error) {
        console.error(`❌ Failed to cancel ${order.reference}:`, error);
        failed++;
        results.push({
          reference: order.reference,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`\n✅ Auto-cancel complete: ${cancelled} cancelled, ${failed} failed`);

    return res.status(200).json({
      success: true,
      message: `Auto-cancel complete`,
      total: orders.length,
      cancelled,
      failed,
      results
    });

  } catch (error) {
    console.error('💥 Auto-cancel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to auto-cancel orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

