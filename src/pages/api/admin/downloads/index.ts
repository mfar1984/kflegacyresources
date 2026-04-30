import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

function generateHash(filename: string): string {
  return crypto.createHash('sha256').update(`${filename}-${Date.now()}`).digest('hex');
}

async function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 1024 * 5, // 5GB max
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const connection = await pool.getConnection();

  try {
    if (req.method === 'GET') {
      // Fetch all downloads
      const [downloads] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM downloads ORDER BY created_at DESC`
      );

      return res.status(200).json({ downloads });

    } else if (req.method === 'POST') {
      // Create new download
      const { fields, files } = await parseForm(req);

      const fileName = Array.isArray(fields.file_name) ? fields.file_name[0] : fields.file_name || '';
      const fileType = Array.isArray(fields.file_type) ? fields.file_type[0] : fields.file_type || 'PDF';
      const fileSize = Array.isArray(fields.file_size) ? fields.file_size[0] : fields.file_size || '';
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description || '';
      const isActiveStr = Array.isArray(fields.is_active) ? fields.is_active[0] : fields.is_active || 'true';
      const isActive = isActiveStr === 'true' || isActiveStr === '1';

      let filePath = '#'; // Default placeholder

      // Handle file upload if provided
      if (files.file) {
        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
        const uploadsDir = join(process.cwd(), 'public', 'downloads');
        
        // Create directory if it doesn't exist
        try {
          await fs.mkdir(uploadsDir, { recursive: true });
        } catch (err) {
          console.error('Error creating uploads directory:', err);
        }

        const fileExt = uploadedFile.originalFilename?.split('.').pop() || 'bin';
        const newFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        const newPath = join(uploadsDir, newFileName);

        await fs.copyFile(uploadedFile.filepath, newPath);
        await fs.unlink(uploadedFile.filepath); // Clean up temp file

        filePath = `/downloads/${newFileName}`;
      }

      const downloadHash = generateHash(fileName);

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO downloads (file_name, file_path, file_type, file_size, description, download_hash, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fileName, filePath, fileType, fileSize, description, downloadHash, isActive ? 1 : 0]
      );

      return res.status(201).json({ 
        message: 'Download created successfully',
        id: result.insertId 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Downloads API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

