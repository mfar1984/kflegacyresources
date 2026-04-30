import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import formidable from 'formidable';
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
  const { id, hash } = req.query;

  // Verify session
  const isValid = await verifySessionFromDB(hash as string);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
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

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      // Always update these fields
      updates.push('title = ?', 'slug = ?', 'excerpt = ?', 'content = ?', 'author = ?', 'category = ?');
      values.push(
        getField('title'),
        getField('slug'),
        getField('excerpt'),
        getField('content'),
        getField('author'),
        getField('category')
      );

      updates.push('tags = ?');
      values.push(getField('tags') || null);

      updates.push('read_time = ?');
      values.push(getField('read_time') || null);

      updates.push('status = ?');
      values.push(getField('status') || 'draft');

      updates.push('is_featured = ?');
      values.push(getField('is_featured') === 'true' ? 1 : 0);

      updates.push('published_date = ?');
      const publishedDate = getField('published_date');
      values.push(publishedDate ? new Date(publishedDate as string).toISOString().slice(0, 10) : null);

      // Handle file uploads
      const featured_image = getFilePath('featured_image');
      if (featured_image) {
        updates.push('featured_image = ?');
        values.push(featured_image);
      }

      const galleryFiles = files.gallery_images;
      if (galleryFiles) {
        const fileArray = Array.isArray(galleryFiles) ? galleryFiles : [galleryFiles];
        const gallery_images = fileArray.map(f => path.basename(f.filepath)).join(',');
        updates.push('gallery_images = ?');
        values.push(gallery_images);
      }

      values.push(id as string);

      await query(
        `UPDATE news_articles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.status(200).json({ success: true, message: 'Article updated successfully' });
    } catch (error) {
      console.error('News PUT error:', error);
      res.status(500).json({ error: 'Failed to update article' });
    }
  } 
  else if (req.method === 'DELETE') {
    try {
      // Get article to delete files
      const articles = await query(
        'SELECT featured_image, gallery_images FROM news_articles WHERE id = ?',
        [id as string]
      ) as any[];

      if (articles.length > 0) {
        const article = articles[0];
        
        // Delete featured image
        if (article.featured_image) {
          const imagePath = path.join(process.cwd(), 'public', 'uploads', 'news', article.featured_image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }

        // Delete gallery images
        if (article.gallery_images) {
          const galleryArray = article.gallery_images.split(',');
          galleryArray.forEach((img: string) => {
            const imagePath = path.join(process.cwd(), 'public', 'uploads', 'news', img.trim());
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          });
        }
      }

      await query('DELETE FROM news_articles WHERE id = ?', [id as string]);
      res.status(200).json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
      console.error('News DELETE error:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  } 
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

