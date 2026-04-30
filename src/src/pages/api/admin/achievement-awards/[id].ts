import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import db from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function verifySession(hash: string): Promise<boolean> {
  try {
    const [rows] = await db.query(
      'SELECT expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    );
    
    if ((rows as any[]).length === 0) return false;
    
    const expires = new Date((rows as any[])[0].expires_at);
    return expires > new Date();
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const form = new IncomingForm({
    maxFileSize: 20 * 1024 * 1024, // 20MB per file
    keepExtensions: true,
    multiples: true, // Allow multiple files
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id, hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isValid = await verifySession(hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM achievement_awards WHERE id = ?', [id]);
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }
    
    res.status(200).json({ award: (rows as any[])[0] });
  } catch (error) {
    console.error('Error fetching award:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isValid = await verifySession(hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  try {
    const { fields, files } = await parseForm(req);

    const award_name = Array.isArray(fields.award_name) ? fields.award_name[0] : fields.award_name;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const issuer = Array.isArray(fields.issuer) ? fields.issuer[0] : fields.issuer;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const is_active = Array.isArray(fields.is_active) ? fields.is_active[0] : fields.is_active;

    if (!award_name || !category || !issuer || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if new files are being uploaded
    const uploadedFiles = Array.isArray(files.files) ? files.files : (files.files ? [files.files] : []);
    
    if (uploadedFiles.length > 0) {
      // Get old file path to delete
      const [oldRows] = await db.query('SELECT file_path FROM achievement_awards WHERE id = ?', [id]);
      const oldFilePath = (oldRows as any[])[0]?.file_path;

      // Delete old file
      if (oldFilePath) {
        const oldFileFullPath = path.join(process.cwd(), 'public', oldFilePath);
        try {
          await fs.unlink(oldFileFullPath);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'achievement-awards');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Process first file for update (only one award can be updated at a time)
      const typedFile = uploadedFiles[0] as FormidableFile;

      // Validate PDF only
      const originalName = typedFile.originalFilename || 'award';
      const fileExt = path.extname(originalName).toLowerCase().replace('.', '');
      
      if (fileExt !== 'pdf') {
        return res.status(400).json({ message: 'Only PDF files are allowed' });
      }

      const fileSize = `${(typedFile.size / 1024 / 1024).toFixed(2)} MB`;

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const sanitizedName = award_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const newFileName = `${sanitizedName}_${timestamp}_${randomStr}.${fileExt}`;
      const newFilePath = path.join(uploadsDir, newFileName);

      // Move file from temp location
      await fs.copyFile(typedFile.filepath, newFilePath);
      await fs.unlink(typedFile.filepath);

      // Update with new file
      const filePath = `/uploads/achievement-awards/${newFileName}`;
      
      // Generate new view hash
      const viewHash = crypto.createHash('sha256').update(`${filePath}-${timestamp}-${randomStr}`).digest('hex');
      
      await db.query(
        `UPDATE achievement_awards 
         SET award_name = ?, category = ?, issuer = ?, file_type = ?, file_size = ?, description = ?, file_path = ?, view_hash = ?, is_active = ?
         WHERE id = ?`,
        [award_name, category, issuer, fileExt.toUpperCase(), fileSize, description, filePath, viewHash, is_active || 1, id]
      );
    } else {
      // Update without changing file
      await db.query(
        `UPDATE achievement_awards 
         SET award_name = ?, category = ?, issuer = ?, description = ?, is_active = ?
         WHERE id = ?`,
        [award_name, category, issuer, description, is_active || 1, id]
      );
    }

    res.status(200).json({ message: 'Award updated successfully' });
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id, hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isValid = await verifySession(hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  try {
    // Get file path to delete
    const [rows] = await db.query('SELECT file_path FROM achievement_awards WHERE id = ?', [id]);
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Award not found' });
    }

    const filePath = (rows as any[])[0].file_path;

    // Delete file
    if (filePath) {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete from database
    await db.query('DELETE FROM achievement_awards WHERE id = ?', [id]);

    res.status(200).json({ message: 'Award deleted successfully' });
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

