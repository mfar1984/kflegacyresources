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
    return res.status(400).json({ success: false, message: 'Invalid posting ID' });
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
      // Get single career posting
      const postings = await query(
        'SELECT * FROM career_postings WHERE id = ? LIMIT 1',
        [id]
      ) as Array<{
        id: number;
        title: string;
        department: string;
        location: string;
        salary_min: number;
        salary_max: number;
        salary_notes: string | null;
        experience_min: number;
        experience_max: number;
        experience_level: string;
        job_type: string;
        employment_type: string;
        icon: string;
        icon_bg: string;
        icon_color: string;
        btn_color: string;
        overview: string;
        responsibilities: string;
        requirements: string;
        benefits: string;
        status: string;
        posted_date: string;
        closing_date: string | null;
        created_at: string;
        updated_at: string;
      }>;

      if (!postings || postings.length === 0) {
        return res.status(404).json({ success: false, message: 'Career posting not found' });
      }

      return res.status(200).json({ success: true, posting: postings[0] });
    }

    if (req.method === 'PUT') {
      // Update career posting
      const {
        title, department, location, salary_min, salary_max, salary_notes,
        experience_min, experience_max, experience_level,
        job_type, employment_type,
        icon, icon_bg, icon_color, btn_color,
        overview, responsibilities, requirements, benefits,
        status, posted_date, closing_date
      } = req.body;

      if (!title || !department || !overview || !responsibilities || !requirements || !benefits) {
        return res.status(400).json({ success: false, message: 'Required fields are missing' });
      }

      await query(
        `UPDATE career_postings SET
          title = ?, department = ?, location = ?,
          salary_min = ?, salary_max = ?, salary_notes = ?,
          experience_min = ?, experience_max = ?, experience_level = ?,
          job_type = ?, employment_type = ?,
          icon = ?, icon_bg = ?, icon_color = ?, btn_color = ?,
          overview = ?, responsibilities = ?, requirements = ?, benefits = ?,
          status = ?, posted_date = ?, closing_date = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          title, department, location,
          salary_min || null, salary_max || null, salary_notes || null,
          experience_min || null, experience_max || null, experience_level || null,
          job_type, employment_type,
          icon, icon_bg, icon_color, btn_color,
          overview, responsibilities, requirements, benefits,
          status, posted_date, closing_date || null,
          id
        ]
      );

      return res.status(200).json({ success: true, message: 'Career posting updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Delete career posting
      await query('DELETE FROM career_postings WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Career posting deleted successfully' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Career API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

