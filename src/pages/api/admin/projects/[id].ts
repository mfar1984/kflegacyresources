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
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, message: 'Invalid project ID' });
  }

  try {
    const hash = req.query.hash || req.body?.hash;
    if (!hash || typeof hash !== 'string') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isValid = await verifySessionFromDB(hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    if (req.method === 'GET') {
      // Get single project with new fields
      const projects = await query(
        'SELECT id, title, client, sector, category, year, location, value, status, start_date, end_date, description, created_at, updated_at FROM projects WHERE id = ? LIMIT 1',
        [id]
      ) as Array<{
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

      if (!projects || projects.length === 0) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      return res.status(200).json({ 
        success: true, 
        project: projects[0]
      });
    }

    if (req.method === 'PUT') {
      // Update project with new fields
      const { title, client, sector, category, year, location, value, status, start_date, end_date, description } = req.body;

      if (!title || !client || !sector || !category || !year || !location || !value || !status) {
        return res.status(400).json({ success: false, message: 'Required fields: title, client, sector, category, year, location, value, status' });
      }

      await query(
        'UPDATE projects SET title = ?, client = ?, sector = ?, category = ?, year = ?, location = ?, value = ?, status = ?, start_date = ?, end_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, client, sector, category, year, location, value, status, start_date || null, end_date || null, description || null, id]
      );

      return res.status(200).json({ success: true, message: 'Project updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Delete project
      await query('DELETE FROM projects WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Project API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

