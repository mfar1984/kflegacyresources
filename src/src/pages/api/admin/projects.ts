import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

async function verifySessionFromDB(hash: string): Promise<boolean> {
  try {
    const rows = await query(
      'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    ) as { username: string; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      return expires > new Date();
    }
    return false;
  } catch (err) {
    console.error('Session verification error:', err);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const hash = req.query.hash || req.body?.hash;
    if (!hash || typeof hash !== 'string') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isValid = await verifySessionFromDB(hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    // Create table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        client VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        value DECIMAL(15, 2) NOT NULL,
        status ENUM('planning', 'ongoing', 'completed', 'on-hold') DEFAULT 'planning',
        start_date DATE NOT NULL,
        end_date DATE NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_client (client),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    if (req.method === 'GET') {
      // Get all projects with new fields
      const projects = await query(`
        SELECT id, title, client, sector, category, year, location, value, status, start_date, end_date, description, created_at, updated_at
        FROM projects
        ORDER BY year DESC, created_at DESC
      `) as Array<{
        id: number;
        title: string;
        client: string;
        sector: 'Government' | 'Private';
        category: string;
        year: number;
        location: string;
        value: string;
        status: 'planning' | 'ongoing' | 'completed' | 'on-hold';
        start_date: string | null;
        end_date: string | null;
        description: string | null;
        created_at: string;
        updated_at: string;
      }>;

      return res.status(200).json({ success: true, projects });
    }

    if (req.method === 'POST') {
      // Create new project with new fields
      const { title, client, sector, category, year, location, value, status, start_date, end_date, description } = req.body;

      if (!title || !client || !sector || !category || !year || !location || !value || !status) {
        return res.status(400).json({ success: false, message: 'Required fields: title, client, sector, category, year, location, value, status' });
      }

      const result = await query(
        'INSERT INTO projects (title, client, sector, category, year, location, value, status, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, client, sector, category, year, location, value, status, start_date || null, end_date || null, description || null]
      ) as { insertId: number };

      return res.status(201).json({ 
        success: true, 
        message: 'Project created successfully',
        project_id: result.insertId 
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

