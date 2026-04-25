import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface CustomerSummary {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string | null;
  postcode: string;
  country: string;
  total_orders: number;
  paid_orders: number;
  failed_orders: number;
  cancelled_orders: number;
  viewed_orders: number;
  total_spent: number | string;
  first_order_date: string;
  last_order_date: string;
}

interface CustomerOrder {
  id: number;
  reference: string;
  chip_payment_id: string | null;
  status: string;
  total_amount: number | string;
  currency: string;
  payment_method: string | null;
  created_at: string;
  paid_at: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.query;
  const customerEmail = Array.isArray(email) ? email[0] : email;

  if (!customerEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  if (req.method === 'GET') {
    try {
      // Get customer summary
      const customerRows = await query(
        `SELECT 
          customer_email AS email,
          customer_first_name AS first_name,
          customer_last_name AS last_name,
          customer_phone AS phone,
          customer_address AS address,
          customer_city AS city,
          customer_state AS state,
          customer_postcode AS postcode,
          customer_country AS country,
          COUNT(*) AS total_orders,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
          SUM(CASE WHEN status = 'viewed' THEN 1 ELSE 0 END) AS viewed_orders,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) AS total_spent,
          MIN(created_at) AS first_order_date,
          MAX(created_at) AS last_order_date
        FROM orders
        WHERE customer_email = ?
        GROUP BY customer_email, customer_first_name, customer_last_name, customer_phone,
                 customer_address, customer_city, customer_state, customer_postcode, customer_country
        LIMIT 1`,
        [customerEmail]
      ) as CustomerSummary[];

      if (customerRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      const customer = customerRows[0];

      // Get customer's orders (last 10)
      const orders = await query(
        `SELECT 
          id,
          reference,
          chip_payment_id,
          status,
          total_amount,
          currency,
          payment_method,
          created_at,
          paid_at
        FROM orders
        WHERE customer_email = ?
        ORDER BY created_at DESC
        LIMIT 10`,
        [customerEmail]
      ) as CustomerOrder[];

      return res.status(200).json({
        success: true,
        customer,
        orders
      });

    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch customer details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

