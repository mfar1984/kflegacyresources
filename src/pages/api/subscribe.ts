import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { sendSubscriptionEmails } from '@/lib/email';

function isValidEmail(email: string): boolean {
  // Simple RFC5322-ish email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body ?? {};

    if (typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const connection = await pool.getConnection();

    try {
      // Create table if it does not exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Insert subscriber (ignore duplicate)
      const [result] = await connection.execute(
        'INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)',
        [email]
      );

      // Send emails (only once per subscribe attempt)
      await sendSubscriptionEmails({ email });

      // Read affectedRows defensively without non-null assertions
      const affectedRows = (result as unknown as { affectedRows?: number })?.affectedRows;
      const inserted = typeof affectedRows === 'number' && affectedRows > 0;

      return res.status(200).json({ success: true, inserted, message: inserted ? 'Subscribed' : 'Already subscribed' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}


