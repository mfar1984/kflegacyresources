import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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
  const { hash, id } = req.query;

  // Verify session
  const isValid = await verifySessionFromDB(hash as string);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const applicantId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  if (!applicantId) {
    return res.status(400).json({ error: 'Invalid applicant ID' });
  }

  if (req.method === 'DELETE') {
    try {
      // Get applicant files before deletion
      const applicants = await query(
        'SELECT passport_photo, resume_pdf, cover_letter_pdf FROM career_applicants WHERE id = ?',
        [applicantId]
      ) as any[];

      if (applicants.length === 0) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      const applicant = applicants[0];

      // Delete from database
      await query('DELETE FROM career_applicants WHERE id = ?', [applicantId]);

      // Delete files from filesystem
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applicants');
      
      try {
        if (applicant.passport_photo) {
          const photoPath = path.join(uploadDir, applicant.passport_photo);
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
          }
        }

        if (applicant.resume_pdf) {
          const resumePath = path.join(uploadDir, applicant.resume_pdf);
          if (fs.existsSync(resumePath)) {
            fs.unlinkSync(resumePath);
          }
        }

        if (applicant.cover_letter_pdf) {
          const coverPath = path.join(uploadDir, applicant.cover_letter_pdf);
          if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
          }
        }
      } catch (fileError) {
        console.error('Error deleting files:', fileError);
        // Continue even if file deletion fails
      }

      res.status(200).json({ success: true, message: 'Applicant permanently deleted' });
    } catch (error) {
      console.error('Permanent delete error:', error);
      res.status(500).json({ error: 'Failed to permanently delete applicant' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

