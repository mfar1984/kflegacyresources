import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Backup name is required',
      });
    }

    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, name);

    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found',
      });
    }

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.zip"`);

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add backup directory to archive
    archive.directory(backupPath, false);

    // Finalize archive
    await archive.finalize();
  } catch (error) {
    console.error('Error downloading backup:', error);
    
    // Check if headers already sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to download backup: ' + (error as Error).message,
      });
    }
  }
}
