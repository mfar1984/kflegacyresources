import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface BackupMetadata {
  timestamp: string;
  database: boolean;
  files: boolean;
  location: string;
  size: string;
}

interface BackupInfo {
  name: string;
  path: string;
  created: string;
  size: string;
  metadata: BackupMetadata | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const backupDir = path.join(process.cwd(), 'backups');

    // Check if backup directory exists
    if (!fs.existsSync(backupDir)) {
      return res.status(200).json({
        success: true,
        backups: [],
        message: 'No backups found',
      });
    }

    // Read all backup directories
    const files = fs.readdirSync(backupDir);
    const backups: BackupInfo[] = [];

    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);

      // Only process directories that start with 'backup-'
      if (stats.isDirectory() && file.startsWith('backup-')) {
        let metadata: BackupMetadata | null = null;
        const metadataPath = path.join(filePath, 'metadata.json');

        // Read metadata if exists
        if (fs.existsSync(metadataPath)) {
          try {
            const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
            metadata = JSON.parse(metadataContent);
          } catch (error) {
            console.error('Error reading metadata:', error);
          }
        }

        backups.push({
          name: file,
          path: filePath,
          created: stats.birthtime.toISOString(),
          size: metadata?.size || getDirectorySize(filePath),
          metadata,
        });
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return res.status(200).json({
      success: true,
      backups,
      count: backups.length,
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list backups: ' + (error as Error).message,
    });
  }
}

function getDirectorySize(dirPath: string): string {
  let totalSize = 0;

  function calculateSize(currentPath: string) {
    try {
      const stats = fs.statSync(currentPath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach((file) => {
          calculateSize(path.join(currentPath, file));
        });
      }
    } catch (error) {
      // Skip files that can't be accessed
    }
  }

  try {
    calculateSize(dirPath);
    // Convert to MB
    return (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
  } catch (error) {
    return '0 MB';
  }
}
