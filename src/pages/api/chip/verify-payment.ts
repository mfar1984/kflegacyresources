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

  const { reference, purchaseId } = req.body;

  if (!reference) {
    return res.status(400).json({
      success: false,
      message: 'Order reference is required'
    });
  }

  console.log(`🔍 Verifying payment for order ${reference}`);

  // Get order from database - using safeQuery
  const orders = await safeQuery<Array<{
    id: number;
    reference: string;
    chip_payment_id: string | null;
    status: string;
  }>>(
    `SELECT id, reference, chip_payment_id, status 
     FROM orders 
     WHERE reference = ?`,
    [reference]
  );

  if (orders.length === 0) {
    console.log(`❌ Order ${reference} not found in database`);
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const order = orders[0];
  const chipPaymentId = order.chip_payment_id || purchaseId;

  // If order is already paid, no need to check again
  if (order.status === 'paid') {
    console.log(`✅ Order ${reference} already marked as paid`);
    return res.status(200).json({
      success: true,
      status: 'paid',
      message: 'Order already confirmed as paid'
    });
  }

  // Fetch payment status from CHIP API
  if (!chipPaymentId) {
    console.log(`⚠️  No CHIP payment ID for order ${reference}`);
    return res.status(400).json({
      success: false,
      message: 'No payment ID associated with this order'
    });
  }

  const CHIP_API_KEY = process.env.CHIP_API_KEY;
  const CHIP_API_URL = 'https://gate.chip-in.asia/api/v1';

  if (!CHIP_API_KEY) {
    console.error('❌ CHIP API Key not configured');
    return res.status(500).json({
      success: false,
      message: 'Payment gateway not configured'
    });
  }

  console.log(`📡 Fetching payment status from CHIP for ID: ${chipPaymentId}`);

  const chipResponse = await fetch(
    `${CHIP_API_URL}/purchases/${chipPaymentId}/`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHIP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!chipResponse.ok) {
    console.error(`❌ CHIP API Error: ${chipResponse.status}`);
    const errorText = await chipResponse.text();
    console.error('Error details:', errorText);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment with gateway'
    });
  }

  const chipData = await chipResponse.json();
  console.log(`CHIP Status for ${reference}:`, chipData.status);
  
  // Map CHIP status to our database status
  let dbStatus = order.status;
  let paymentMethod = null;

  // CHIP API Status Values:
  // - pending: Payment created, user not redirected yet (rare - usually instant redirect)
  // - viewed: Payment page opened by user (default after redirect from checkout)
  // - paid/success: Payment successful
  // - failed/error/declined/rejected: Payment failed
  // - cancelled: Payment cancelled by user
  // - expired/timeout: Payment link expired
  
  console.log(`📊 CHIP Status for ${reference}: "${chipData.status}"`);
  
  const chipStatus = chipData.status?.toLowerCase() || 'unknown';
  
  // Handle PAID statuses
  if (chipStatus === 'paid' || chipStatus === 'success' || chipStatus === 'completed') {
    dbStatus = 'paid';
    paymentMethod = chipData.payment?.payment_method || chipData.transaction_data?.payment_method || 'online';
    console.log(`✅ Payment confirmed: ${reference} is PAID via ${paymentMethod}`);
    
    await safeQuery(
      `UPDATE orders 
       SET status = 'paid', 
           paid_at = NOW(),
           payment_method = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [paymentMethod, order.id]
    );
  }
  // Handle FAILED statuses (multiple variations)
  else if (chipStatus === 'failed' || chipStatus === 'error' || chipStatus === 'declined' || 
           chipStatus === 'rejected' || chipStatus === 'timeout' || chipStatus === 'expired') {
    dbStatus = 'failed';
    console.log(`❌ Payment FAILED: ${reference} (CHIP status: ${chipData.status})`);
    
    await safeQuery(
      `UPDATE orders 
       SET status = 'failed', 
           updated_at = NOW(),
           notes = CONCAT(COALESCE(notes, ''), '\nPayment failed: ${chipData.status}')
       WHERE id = ?`,
      [order.id]
    );
  }
  // Handle CANCELLED status
  else if (chipStatus === 'cancelled' || chipStatus === 'canceled') {
    dbStatus = 'cancelled';
    console.log(`🚫 Payment cancelled: ${reference}`);
    
    await safeQuery(
      `UPDATE orders 
       SET status = 'cancelled', 
           updated_at = NOW()
       WHERE id = ?`,
      [order.id]
    );
  }
  // Handle VIEWED/PENDING status
  else if (chipStatus === 'pending' || chipStatus === 'viewed') {
    dbStatus = 'viewed';
    console.log(`👁️  Payment page viewed but not completed: ${reference}`);
    
    await safeQuery(
      `UPDATE orders 
       SET status = 'viewed', 
           updated_at = NOW()
       WHERE id = ?`,
      [order.id]
    );
  }
  // Unknown status - log warning
  else {
    console.warn(`⚠️  UNKNOWN CHIP STATUS: "${chipData.status}" for ${reference}`);
    console.warn(`⚠️  Please add this status to the mapping!`);
    dbStatus = order.status; // Keep current status
  }

  return res.status(200).json({
    success: true,
    status: dbStatus,
    chipStatus: chipData.status,
    paymentMethod: paymentMethod,
    message: `Order status: ${dbStatus}`
  });
}

// Apply middleware: error handling and timeout (longer timeout for external API)
export default withTimeout(withErrorHandling(handler), { timeoutMs: 45000 });

