import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { RowDataPacket } from 'mysql2';

// Helper to get client IP
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress || 'unknown';
  return ip;
}

// Rate limiting: Check if IP has exceeded download limit
async function checkRateLimit(ip: string, downloadId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    // Check downloads in the last 1 hour (configurable)
    const [logs] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM download_logs 
       WHERE ip_address = ? 
       AND download_id = ? 
       AND downloaded_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [ip, downloadId]
    );

    const downloadCount = logs[0].count;
    const MAX_DOWNLOADS_PER_HOUR = 5; // Configurable limit

    return downloadCount < MAX_DOWNLOADS_PER_HOUR;
  } finally {
    connection.release();
  }
}

// Log download activity
async function logDownload(downloadId: number, ip: string, userAgent: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `INSERT INTO download_logs (download_id, ip_address, user_agent) VALUES (?, ?, ?)`,
      [downloadId, ip, userAgent]
    );
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash, token } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Invalid download hash' });
  }

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Missing download token' });
  }

  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const connection = await pool.getConnection();
  
  try {
    // Get download info by hash
    const [downloads] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM downloads WHERE download_hash = ? AND is_active = 1`,
      [hash]
    );

    if (downloads.length === 0) {
      return res.status(404).json({ error: 'Download not found or inactive' });
    }

    const download = downloads[0];

    // Verify download token
    const [tokenLogs] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM download_logs WHERE download_token = ? AND download_id = ? LIMIT 1`,
      [token, download.id]
    );

    if (tokenLogs.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired download token' });
    }

    const tokenLog = tokenLogs[0];

    // Check if token already used (status = 'completed')
    if (tokenLog.status === 'completed') {
      return res.status(403).json({ error: 'This download link has already been used' });
    }

    // Check rate limit
    const canDownload = await checkRateLimit(clientIP, download.id);
    if (!canDownload) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 3600 // seconds
      });
    }

    // Check if file exists
    const filePath = join(process.cwd(), 'public', download.file_path);
    
    try {
      const stats = statSync(filePath);
      
      // Update download log status to 'completed'
      await connection.query(
        `UPDATE download_logs SET status = 'completed', downloaded_at = NOW() WHERE download_token = ?`,
        [token]
      );

      // Set headers for download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${download.file_name}.${download.file_type.toLowerCase()}"`);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Stream the file
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming file' });
        }
      });

    } catch (fileError) {
      console.error('File not found:', fileError);
      return res.status(404).json({ error: 'File not found on server' });
    }

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

