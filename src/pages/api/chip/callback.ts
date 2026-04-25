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

  const paymentData = req.body;
  
  console.log('CHIP Payment Callback:', paymentData);

  // Verify the callback is from CHIP (in production, verify signature)
  // For now, we'll just log and store the payment status

  const { status, reference, payment } = paymentData;

  // Handle different payment statuses
  switch (status) {
    case 'paid':
      console.log(`Payment successful for order ${reference}`);
      // Update order status to paid - using safeQuery
      await safeQuery(
        `UPDATE orders 
         SET status = 'paid', 
             paid_at = NOW(),
             payment_method = ?,
             updated_at = NOW()
         WHERE reference = ?`,
        [payment?.payment_method || 'online', reference]
      );
      console.log(`✅ Order ${reference} marked as paid`);
      
      // TODO: Send confirmation email
      // TODO: Update inventory
      break;

    case 'failed':
      console.log(`Payment failed for order ${reference}`);
      await safeQuery(
        `UPDATE orders 
         SET status = 'failed', updated_at = NOW()
         WHERE reference = ?`,
        [reference]
      );
      console.log(`✅ Order ${reference} marked as failed`);
      // TODO: Send failure notification
      break;

    case 'cancelled':
      console.log(`Payment cancelled for order ${reference}`);
      await safeQuery(
        `UPDATE orders 
         SET status = 'cancelled', updated_at = NOW()
         WHERE reference = ?`,
        [reference]
      );
      console.log(`✅ Order ${reference} marked as cancelled`);
      break;

    default:
      console.log(`Unknown payment status: ${status} for order ${reference}`);
  }

  // Always respond with 200 OK to acknowledge receipt
  return res.status(200).json({ 
    success: true, 
    message: 'Callback received' 
  });
}

// Apply middleware: error handling and timeout
// Note: We still return 200 even on error to prevent CHIP from retrying
export default withTimeout(withErrorHandling(handler));

