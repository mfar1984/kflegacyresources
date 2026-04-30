import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

/**
 * Cleanup expired sessions from database
 * This endpoint can be called:
 * 1. Manually via cron job
 * 2. Automatically on server startup
 * 3. Periodically from client-side
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Delete all expired sessions
    const result = await query('DELETE FROM admin_sessions WHERE expires_at < NOW()');
    
    // Get count of deleted sessions
    const deletedCount = (result as any).affectedRows || 0;

    // Get remaining active sessions count
    const activeSessionsResult = await query('SELECT COUNT(*) as count FROM admin_sessions WHERE expires_at >= NOW()');
    const activeCount = (activeSessionsResult as any)[0]?.count || 0;

    return res.status(200).json({
      success: true,
      message: 'Session cleanup completed',
      deletedSessions: deletedCount,
      activeSessions: activeCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return res.status(500).json({ 
      error: 'Failed to cleanup sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

