import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '@/lib/api-error-handler';
import { safeQuery } from '@/lib/db-safe-query';
import { withTimeout } from '@/lib/request-timeout';
import { withDefaultCompression } from '@/lib/compression';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, reference } = req.query;

  if (!email && !reference) {
    return res.status(400).json({ 
      success: false,
      message: 'Email or reference parameter is required' 
    });
  }

  let orders;
  
  if (reference) {
    // Get specific order by reference - using safeQuery
    orders = await safeQuery(
      `SELECT 
        o.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_price', oi.product_price,
            'quantity', oi.quantity,
            'selected_options', oi.selected_options,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.reference = ?
      GROUP BY o.id`,
      [reference]
    );
  } else if (email) {
    // Get all orders by email - using safeQuery
    orders = await safeQuery(
      `SELECT 
        o.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_price', oi.product_price,
            'quantity', oi.quantity,
            'selected_options', oi.selected_options,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_email = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [email]
    );
  }

  // Parse items JSON
  const ordersWithItems = (orders as Array<Record<string, unknown>>).map((order) => ({
    ...order,
    items: typeof order.items === 'string' ? JSON.parse(order.items as string) : order.items
  }));

  return res.status(200).json({
    success: true,
    orders: ordersWithItems
  });
}

// Apply middleware: error handling, timeout, and compression
export default withDefaultCompression(withTimeout(withErrorHandling(handler)));

