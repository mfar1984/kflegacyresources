import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false
  }
};

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
  const { hash } = req.query;

  // Verify session
  const isValid = await verifySessionFromDB(hash as string);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const articles = await query(
        'SELECT * FROM news_articles ORDER BY published_date DESC, created_at DESC',
        []
      );
      res.status(200).json(articles);
    } catch (error) {
      console.error('News GET error:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'news');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        multiples: true
      });

      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const getField = (field: string) => {
        const value = fields[field];
        return Array.isArray(value) ? value[0] : value || '';
      };

      const getFilePath = (fileKey: string) => {
        const file = files[fileKey];
        if (!file) return null;
        const fileObj = Array.isArray(file) ? file[0] : file;
        return fileObj ? path.basename(fileObj.filepath) : null;
      };

      const featured_image = getFilePath('featured_image');
      
      // Handle gallery images
      let gallery_images = null;
      const galleryFiles = files.gallery_images;
      if (galleryFiles) {
        const fileArray = Array.isArray(galleryFiles) ? galleryFiles : [galleryFiles];
        gallery_images = fileArray.map(f => path.basename(f.filepath)).join(',');
      }

      // Convert published_date to MySQL DATE format (YYYY-MM-DD)
      const publishedDate = getField('published_date');
      const formattedDate = publishedDate ? new Date(publishedDate as string).toISOString().slice(0, 10) : null;

      await query(
        `INSERT INTO news_articles (
          title, slug, excerpt, content, author, category, tags,
          featured_image, gallery_images, read_time, status, is_featured, published_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          getField('title'),
          getField('slug'),
          getField('excerpt'),
          getField('content'),
          getField('author'),
          getField('category'),
          getField('tags') || null,
          featured_image,
          gallery_images,
          getField('read_time') || null,
          getField('status') || 'draft',
          getField('is_featured') === 'true' ? 1 : 0,
          formattedDate
        ]
      );

      res.status(201).json({ success: true, message: 'Article created successfully' });
    } catch (error) {
      console.error('News POST error:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  } 
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

