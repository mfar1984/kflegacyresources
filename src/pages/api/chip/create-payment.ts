import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '@/lib/api-error-handler';
import { withTransaction, transactionQuery } from '@/lib/db-transaction';
import { withTimeout } from '@/lib/request-timeout';
import type { ResultSetHeader } from 'mysql2/promise';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { customerDetails, cartItems, totalAmount } = req.body;

  console.log('=== CHIP Payment Request ===');
  console.log('Customer:', customerDetails.email);
  console.log('Total Amount:', totalAmount);
  console.log('Cart Items:', cartItems.length);

  // CHIP Configuration
  const CHIP_API_KEY = process.env.CHIP_API_KEY || 'eacbT3tKeP2hMFDVn-aPhYYCtboMRjTcQ5ZHkG8wLIwPKMWeaPxUYFwD4OQVjascwN3fy947qMwgrcHqv4r6kw==';
  const CHIP_BRAND_ID = process.env.CHIP_BRAND_ID || 'c5f96f76-b79c-4963-8698-086d6ce28062';
  const CHIP_API_URL = 'https://gate.chip-in.asia/api/v1';

  console.log('CHIP Brand ID:', CHIP_BRAND_ID);
  console.log('CHIP API Key (first 20 chars):', CHIP_API_KEY.substring(0, 20) + '...');

  // Generate unique reference
  const reference = `ORDER-${Date.now()}`;

  // Prepare purchase details
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const isLocalhost = siteUrl.includes('localhost');
  
  // Prepare client data with optional bank details
  const clientData: Record<string, unknown> = {
    email: customerDetails.email,
    phone: customerDetails.phone,
    full_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
    street_address: customerDetails.address,
    city: customerDetails.city,
    zip_code: customerDetails.postcode,
    country: customerDetails.country || 'MY',
  };

  // Add bank details if provided (for faster refunds)
  if (customerDetails.bankAccount && customerDetails.bankCode) {
    clientData.bank_account = customerDetails.bankAccount;
    clientData.bank_code = customerDetails.bankCode;
    console.log('✅ Bank details included for refunds');
  }

  const purchaseData: Record<string, unknown> = {
    brand_id: CHIP_BRAND_ID,
    client: clientData,
    purchase: {
      total: Math.round(totalAmount * 100), // Convert to cents
      currency: 'MYR',
      products: cartItems.map((item: { name: string; price: number; quantity: number }) => ({
        name: item.name,
        price: Math.round(item.price * 100),
        quantity: item.quantity,
      })),
      notes: customerDetails.notes || 'Order from KF Legacy Resources Store',
    },
    reference: reference,
    success_redirect: `${siteUrl}/payment/success?reference=${reference}`,
    failure_redirect: `${siteUrl}/payment/failed?reference=${reference}`,
    cancel_redirect: `${siteUrl}/payment/cancelled?reference=${reference}`,
    creator_agent: 'KF Legacy Resources Store v1.0',
    platform: 'api',
    send_receipt: true,
  };
  
  // Only add success_callback in production (CHIP doesn't allow localhost callbacks with custom ports)
  if (!isLocalhost) {
    purchaseData.success_callback = `${siteUrl}/api/chip/callback`;
    console.log('✅ Callback URL included (production mode)');
  } else {
    console.log('⚠️ Callback URL skipped (localhost development mode)');
  }

  console.log('Purchase Data:', JSON.stringify(purchaseData, null, 2));

  // Create payment with CHIP
  const response = await fetch(`${CHIP_API_URL}/purchases/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CHIP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(purchaseData),
  });

  const responseText = await response.text();
  console.log('CHIP Response Status:', response.status);
  console.log('CHIP Response:', responseText);

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Failed to parse CHIP response:', responseText);
    return res.status(500).json({
      success: false,
      message: 'Invalid response from payment gateway',
      error: responseText,
    });
  }

  if (!response.ok || !data.id) {
    console.error('❌ CHIP API Error:', data);
    return res.status(400).json({
      success: false,
      message: 'Failed to create payment',
      error: data,
      details: data.errors || data.message || 'Unknown error',
    });
  }

  console.log('✅ Payment created successfully:', data.id);
  
  // Save order to database using transaction
  const dbResult = await withTransaction(async (conn) => {
    const orderResult = await transactionQuery<ResultSetHeader>(
      conn,
      `INSERT INTO orders (
        reference, chip_payment_id, customer_first_name, customer_last_name,
        customer_email, customer_phone, customer_address, customer_city,
        customer_state, customer_postcode, customer_country, total_amount,
        currency, status, chip_checkout_url, customer_bank_account,
        customer_bank_code, customer_bank_holder_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reference,
        data.id,
        customerDetails.firstName,
        customerDetails.lastName,
        customerDetails.email,
        customerDetails.phone,
        customerDetails.address,
        customerDetails.city,
        customerDetails.state || null,
        customerDetails.postcode,
        customerDetails.country || 'MY',
        totalAmount,
        'MYR',
        'pending',
        data.checkout_url,
        customerDetails.bankAccount || null,
        customerDetails.bankCode || null,
        customerDetails.bankHolderName || null,
        customerDetails.notes || null
      ]
    );

    const orderId = orderResult.insertId;
    console.log('✅ Order saved to database:', orderId);

    // Save order items
    for (const item of cartItems) {
      await transactionQuery(
        conn,
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_price, quantity,
          selected_options, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.selectedOptions ? JSON.stringify(item.selectedOptions) : null,
          item.price * item.quantity
        ]
      );
    }
    console.log(`✅ Saved ${cartItems.length} order items`);

    return orderId;
  });

  if (!dbResult.success) {
    console.error('❌ Database save error:', dbResult.error);
    // Continue anyway - payment was created successfully
    // We can manually add order to DB later if needed
  }

  return res.status(200).json({
    success: true,
    checkoutUrl: data.checkout_url,
    purchaseId: data.id,
    reference: reference,
  });
}

// Apply middleware: error handling and timeout (longer timeout for payment processing)
export default withTimeout(withErrorHandling(handler), { timeoutMs: 60000 });

