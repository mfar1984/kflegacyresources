import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, full_name } = req.body;

    // Validation
    if (!email || !full_name) {
      return res.status(400).json({ message: 'Email and full name are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Get IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.socket.remoteAddress || 'unknown';

    // Get user agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check if email already exists
    const existing = await query(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = ?',
      [email]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      const subscriber = existing[0] as { id: number; is_active: number };

      if (subscriber.is_active === 1) {
        return res.status(400).json({ message: 'This email is already subscribed' });
      }

      // Reactivate subscription
      await query(
        'UPDATE newsletter_subscribers SET is_active = 1, full_name = ?, ip_address = ?, user_agent = ?, subscribed_at = NOW(), unsubscribed_at = NULL WHERE id = ?',
        [full_name, ip, userAgent, subscriber.id]
      );

      return res.status(200).json({
        message: 'Subscription reactivated successfully',
        subscriber_id: subscriber.id
      });
    }

    // Generate unique token
    const token = crypto.createHash('sha256').update(email + Date.now().toString()).digest('hex');

    // Insert new subscriber
    const result = await query(
      `INSERT INTO newsletter_subscribers (full_name, email, token, ip_address, user_agent, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [full_name, email, token, ip, userAgent]
    );

    const insertResult = result as { insertId: number };

    return res.status(201).json({
      message: 'Subscribed successfully',
      subscriber_id: insertResult.insertId
    });

  } catch (error: any) {
    console.error('Subscribe error:', error);

    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}

