import type { NextApiRequest, NextApiResponse } from 'next';

interface TestConnectionRequest {
  chip_brand_id: string;
  chip_secret_key: string;
  chip_test_mode: boolean;
}

interface CurrencyBalance {
  balance: number;
  fee_sell: number;
  reserved: number;
  gross_balance: number;
  pending_outgoing: number;
  available_balance: number;
}

interface BalanceResponse {
  [currency: string]: CurrencyBalance;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { chip_brand_id, chip_secret_key, chip_test_mode } = req.body as TestConnectionRequest;

    // Validate required fields
    if (!chip_brand_id || !chip_secret_key) {
      return res.status(400).json({
        success: false,
        message: 'CHIP Brand ID and Secret Key are required'
      });
    }

    // Determine API base URL based on test mode
    const baseUrl = chip_test_mode 
      ? 'https://gate.chip-in.asia' 
      : 'https://gate.chip-in.asia';

    // Test connection by fetching account balance
    const response = await fetch(`${baseUrl}/api/v1/account/json/balance/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${chip_secret_key}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CHIP API error:', errorText);
      
      // Parse error message
      let errorMessage = 'Failed to connect to CHIP API';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return res.status(response.status).json({
        success: false,
        message: `Connection failed: ${errorMessage}`
      });
    }

    const data: BalanceResponse = await response.json();

    // Calculate balance summary
    const myrBalance = data.MYR?.available_balance || 0;
    const usdBalance = data.USD?.available_balance || 0;
    const eurBalance = data.EUR?.available_balance || 0;

    return res.status(200).json({
      success: true,
      message: 'CHIP connection successful',
      balance: {
        myr: myrBalance,
        usd: usdBalance,
        eur: eurBalance
      },
      mode: chip_test_mode ? 'test' : 'production'
    });

  } catch (error) {
    console.error('CHIP test connection error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to test CHIP connection'
    });
  }
}
