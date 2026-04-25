import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * List all purchases from CHIP API
 * This will be the source of truth for Orders, Transactions, and Customers
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    const { page = '1', limit = '25', status, from, to, search } = req.query;

    // Build query params
    const params = new URLSearchParams();
    params.set('page', Array.isArray(page) ? page[0] : page);
    params.set('limit', Array.isArray(limit) ? limit[0] : limit);

    if (status && !Array.isArray(status)) {
      params.set('status', status);
    }
    if (from && !Array.isArray(from)) {
      params.set('created_on__gte', from);
    }
    if (to && !Array.isArray(to)) {
      params.set('created_on__lte', to);
    }
    if (search && !Array.isArray(search)) {
      params.set('search', search);
    }

    console.log('🔍 Fetching purchases from CHIP:', params.toString());

    // Call CHIP API to list purchases
    const response = await fetch(
      `https://gate.chip-in.asia/api/v1/purchases/?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = await response.text();
    console.log('CHIP List Response Status:', response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse CHIP response:', responseText);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from payment gateway',
        error: responseText
      });
    }

    if (response.ok) {
      console.log(`✅ Retrieved ${data.count || data.results?.length || 0} purchases from CHIP`);

      // Transform CHIP data to our format
      const purchases = (data.results || []).map((purchase: {
        id: string;
        reference: string;
        status: string;
        purchase?: { total?: number; currency?: string; products?: unknown[]; notes?: string };
        client?: { email?: string; full_name?: string };
        transaction_data?: { payment_method?: string };
        created_on: string;
        paid_on?: string | null;
        updated_on: string;
        checkout_url: string;
        is_test?: boolean;
      }) => ({
        id: purchase.id,
        reference: purchase.reference,
        status: mapChipStatus(purchase.status),
        chip_status: purchase.status,
        total_amount: purchase.purchase?.total || 0,
        currency: purchase.purchase?.currency || 'MYR',
        customer_email: purchase.client?.email || '',
        customer_name: purchase.client?.full_name || '',
        payment_method: purchase.transaction_data?.payment_method || null,
        created_at: purchase.created_on,
        paid_at: purchase.paid_on || null,
        updated_at: purchase.updated_on,
        payment_url: purchase.checkout_url,
        products: purchase.purchase?.products || [],
        notes: purchase.purchase?.notes || null,
        is_test: purchase.is_test || false
      }));

      return res.status(200).json({
        success: true,
        purchases,
        pagination: {
          total: data.count || 0,
          page: parseInt(Array.isArray(page) ? page[0] : page),
          pageSize: parseInt(Array.isArray(limit) ? limit[0] : limit),
          totalPages: Math.ceil((data.count || 0) / parseInt(Array.isArray(limit) ? limit[0] : limit))
        }
      });

    } else {
      console.error('❌ CHIP List Error:', data);
      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch purchases from CHIP',
        error: data,
        details: data.errors || data.message || data.__all__ || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('💥 List purchases exception:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Map CHIP status to our internal status
 */
function mapChipStatus(chipStatus: string): string {
  const statusMap: Record<string, string> = {
    'paid': 'paid',
    'pending': 'pending',
    'cancelled': 'cancelled',
    'failed': 'failed',
    'refunded': 'refunded',
    'hold': 'refund_pending',
    'viewed': 'pending',
    'expired': 'failed'
  };

  return statusMap[chipStatus.toLowerCase()] || chipStatus.toLowerCase();
}

