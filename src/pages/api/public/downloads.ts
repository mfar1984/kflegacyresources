import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { securePublicAPI } from '@/lib/api-security';

interface Download {
  id: number;
  file_name: string;
  file_type: string;
  file_size: string;
  description: string;
  download_hash: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  const security = await securePublicAPI(req, res, {
    requireToken: false, // Public website access
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 200,
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const connection = await pool.getConnection();
  
  try {
    const [downloads] = await connection.query<RowDataPacket[]>(
      `SELECT id, file_name, file_type, file_size, description, download_hash 
       FROM downloads 
       WHERE is_active = 1 
       ORDER BY created_at DESC`
    );

    return res.status(200).json({ downloads });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

