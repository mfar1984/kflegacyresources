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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const connection = await pool.getConnection();

  try {
    if (req.method === 'PUT') {
      // Update download
      const { fields, files } = await parseForm(req);

      const fileName = Array.isArray(fields.file_name) ? fields.file_name[0] : fields.file_name || '';
      const fileType = Array.isArray(fields.file_type) ? fields.file_type[0] : fields.file_type || 'PDF';
      const fileSize = Array.isArray(fields.file_size) ? fields.file_size[0] : fields.file_size || '';
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description || '';
      const isActiveStr = Array.isArray(fields.is_active) ? fields.is_active[0] : fields.is_active || 'true';
      const isActive = isActiveStr === 'true' || isActiveStr === '1';

      // Get current download info
      const [currentDownload] = await connection.query<RowDataPacket[]>(
        `SELECT file_path FROM downloads WHERE id = ?`,
        [id]
      );

      if (currentDownload.length === 0) {
        return res.status(404).json({ error: 'Download not found' });
      }

      let filePath = currentDownload[0].file_path;

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

        // Delete old file if it exists
        if (filePath && filePath !== '#') {
          const oldFilePath = join(process.cwd(), 'public', filePath);
          try {
            await fs.unlink(oldFilePath);
          } catch (err) {
            console.error('Error deleting old file:', err);
          }
        }

        const fileExt = uploadedFile.originalFilename?.split('.').pop() || 'bin';
        const newFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        const newPath = join(uploadsDir, newFileName);

        await fs.copyFile(uploadedFile.filepath, newPath);
        await fs.unlink(uploadedFile.filepath); // Clean up temp file

        filePath = `/downloads/${newFileName}`;
      }

      await connection.query<ResultSetHeader>(
        `UPDATE downloads 
         SET file_name = ?, file_path = ?, file_type = ?, file_size = ?, description = ?, is_active = ?, updated_at = NOW()
         WHERE id = ?`,
        [fileName, filePath, fileType, fileSize, description, isActive ? 1 : 0, id]
      );

      return res.status(200).json({ message: 'Download updated successfully' });

    } else if (req.method === 'DELETE') {
      // Delete download
      const [download] = await connection.query<RowDataPacket[]>(
        `SELECT file_path FROM downloads WHERE id = ?`,
        [id]
      );

      if (download.length === 0) {
        return res.status(404).json({ error: 'Download not found' });
      }

      // Delete file if it exists
      const filePath = download[0].file_path;
      if (filePath && filePath !== '#') {
        const fullPath = join(process.cwd(), 'public', filePath);
        try {
          await fs.unlink(fullPath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }

      // Delete from database
      await connection.query<ResultSetHeader>(
        `DELETE FROM downloads WHERE id = ?`,
        [id]
      );

      return res.status(200).json({ message: 'Download deleted successfully' });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

