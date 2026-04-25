import type { NextApiRequest, NextApiResponse } from 'next';

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

    const response = await fetch('https://gate.chip-in.asia/api/v1/account/json/balance/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chip-Asia API error:', errorText);
      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch balance from Chip-Asia',
        error: errorText
      });
    }

    const data: BalanceResponse = await response.json();

    // Calculate total balance in MYR (primary currency)
    // You can customize this based on your needs
    const myrBalance = data.MYR?.available_balance || 0;
    const usdBalance = data.USD?.available_balance || 0;
    const eurBalance = data.EUR?.available_balance || 0;

    return res.status(200).json({
      success: true,
      balances: data,
      summary: {
        myr: myrBalance,
        usd: usdBalance,
        eur: eurBalance
      }
    });

  } catch (error) {
    console.error('Failed to fetch Chip-Asia balance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch balance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

