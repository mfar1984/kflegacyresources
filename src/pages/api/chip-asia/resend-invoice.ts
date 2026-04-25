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

    // Get order details
    const orders = await query(
      `SELECT id, reference, chip_payment_id, customer_email, status 
       FROM orders 
       WHERE id = ?`,
      [orderId]
    ) as Array<{
      id: number;
      reference: string;
      chip_payment_id: string | null;
      customer_email: string;
      status: string;
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
        message: 'Order does not have a CHIP payment ID. Cannot resend invoice.'
      });
    }

    console.log(`📧 Resending invoice for order ${order.reference}`);
    console.log(`   CHIP Payment ID: ${order.chip_payment_id}`);
    console.log(`   Customer Email: ${order.customer_email}`);

    // Call CHIP Resend Invoice API
    const response = await fetch(
      `https://gate.chip-in.asia/api/v1/purchases/${order.chip_payment_id}/resend_invoice/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = await response.text();
    console.log(`CHIP Resend Invoice Response Status: ${response.status}`);
    console.log(`CHIP Resend Invoice Response: ${responseText}`);

    if (response.ok) {
      console.log(`✅ Invoice resent successfully to ${order.customer_email}`);

      // Log in database notes
      await query(
        `UPDATE orders 
         SET notes = CONCAT(COALESCE(notes, ''), '\nInvoice resent to ${order.customer_email} on ', NOW())
         WHERE id = ?`,
        [orderId]
      );

      return res.status(200).json({
        success: true,
        message: `Invoice resent successfully to ${order.customer_email}`,
        chip_response: responseText ? JSON.parse(responseText) : null
      });

    } else {
      console.error(`❌ CHIP Resend Invoice Error: ${responseText}`);
      
      // Try to parse error
      let errorMessage = 'Failed to resend invoice';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
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
    console.error('💥 Resend invoice error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend invoice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

