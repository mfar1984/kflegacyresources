import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Generate hash for filename
function generateHash(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Get file extension
function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// Validate image file
function isValidImage(file: File): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.ico', '.svg', '.webp'];
  const ext = getExtension(file.originalFilename || '');
  return validExtensions.includes(ext);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Validate image
    if (!isValidImage(uploadedFile)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file type. Only PNG, JPG, JPEG, ICO, SVG, WEBP allowed' 
      });
    }

    // Generate hash filename
    const ext = getExtension(uploadedFile.originalFilename || '');
    const hash = generateHash();
    const newFilename = `${hash}${ext}`;
    
    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'img');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Define new file path
    const newFilePath = path.join(uploadDir, newFilename);

    // Move file from temp to upload directory
    fs.copyFileSync(uploadedFile.filepath, newFilePath);
    fs.unlinkSync(uploadedFile.filepath); // Delete temp file

    // Return public URL
    const publicUrl = `/assets/img/${newFilename}`;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      filename: newFilename,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload file' 
    });
  }
}
