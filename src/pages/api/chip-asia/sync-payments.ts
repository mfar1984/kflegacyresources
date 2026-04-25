import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface ChipPurchase {
  id: string;
  status: string;
  reference: string;
  client: {
    email: string;
    phone?: string;
    full_name: string;
  };
  purchase: {
    total: number;
    currency: string;
  };
  payment?: {
    method?: string;
  };
  created_on: number;
  updated_on?: number;
  paid_on?: number | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = process.env.CHIP_API_KEY;

    if (!token) {
      return res.status(500).json({
        success: false,
        message: 'Chip API key not configured'
      });
    }

    console.log('🔄 Starting CHIP payment sync...');

    // Get all pending orders with chip_payment_id
    const pendingOrders = await query(
      `SELECT id, reference, chip_payment_id 
       FROM orders 
       WHERE chip_payment_id IS NOT NULL 
       AND chip_payment_id != '' 
       AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 100`
    ) as Array<{ id: number; reference: string; chip_payment_id: string }>;

    console.log(`📋 Found ${pendingOrders.length} pending orders to sync`);

    let updated = 0;
    let failed = 0;
    const results: Array<{ reference: string; status: string; message: string }> = [];

    for (const order of pendingOrders) {
      try {
        // Fetch purchase details from CHIP
        const response = await fetch(
          `https://gate.chip-in.asia/api/v1/purchases/${order.chip_payment_id}/`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.error(`❌ Failed to fetch CHIP payment ${order.chip_payment_id}`);
          failed++;
          results.push({
            reference: order.reference,
            status: 'error',
            message: `Failed to fetch from CHIP: ${response.status}`
          });
          continue;
        }

        const chipPurchase: ChipPurchase = await response.json();
        console.log(`📦 ${order.reference}: CHIP status = ${chipPurchase.status}`);

        // Update order based on CHIP status
        if (chipPurchase.status === 'paid') {
          const paidDate = chipPurchase.paid_on 
            ? new Date(chipPurchase.paid_on * 1000).toISOString().slice(0, 19).replace('T', ' ')
            : null;

          await query(
            `UPDATE orders 
             SET status = 'paid',
                 paid_at = ?,
                 payment_method = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [
              paidDate || new Date().toISOString().slice(0, 19).replace('T', ' '),
              chipPurchase.payment?.method || 'fpx',
              order.id
            ]
          );

          updated++;
          results.push({
            reference: order.reference,
            status: 'updated',
            message: 'Marked as paid'
          });
          console.log(`✅ ${order.reference}: Updated to PAID`);

        } else if (chipPurchase.status === 'cancelled' || chipPurchase.status === 'canceled') {
          await query(
            `UPDATE orders 
             SET status = 'cancelled',
                 updated_at = NOW()
             WHERE id = ?`,
            [order.id]
          );

          updated++;
          results.push({
            reference: order.reference,
            status: 'updated',
            message: 'Marked as cancelled'
          });
          console.log(`✅ ${order.reference}: Updated to CANCELLED`);

        } else if (chipPurchase.status === 'error' || chipPurchase.status === 'failed') {
          await query(
            `UPDATE orders 
             SET status = 'failed',
                 updated_at = NOW()
             WHERE id = ?`,
            [order.id]
          );

          updated++;
          results.push({
            reference: order.reference,
            status: 'updated',
            message: 'Marked as failed'
          });
          console.log(`✅ ${order.reference}: Updated to FAILED`);

        } else {
          results.push({
            reference: order.reference,
            status: 'skipped',
            message: `Status unchanged (${chipPurchase.status})`
          });
        }

      } catch (error) {
        console.error(`❌ Error syncing ${order.reference}:`, error);
        failed++;
        results.push({
          reference: order.reference,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Sync complete: ${updated} updated, ${failed} failed`);

    return res.status(200).json({
      success: true,
      message: 'Sync completed',
      stats: {
        total: pendingOrders.length,
        updated,
        failed,
        skipped: pendingOrders.length - updated - failed
      },
      results
    });

  } catch (error) {
    console.error('💥 Sync failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

