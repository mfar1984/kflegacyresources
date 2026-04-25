import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import AdmZip from 'adm-zip';

const execAsync = promisify(exec);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload (ZIP file)
      const form = formidable({ multiples: false });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Failed to parse upload: ' + err.message,
          });
        }

        const backupFile = Array.isArray(files.backup) ? files.backup[0] : files.backup;

        if (!backupFile) {
          return res.status(400).json({
            success: false,
            message: 'No backup file provided',
          });
        }

        try {
          await restoreFromZip(backupFile.filepath);

          return res.status(200).json({
            success: true,
            message: 'Backup restored successfully from uploaded ZIP file',
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to restore backup: ' + (error as Error).message,
          });
        }
      });
    } else {
      // Handle restore from existing backup name - parse JSON body manually
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const { backupName } = JSON.parse(body);

          if (!backupName) {
            return res.status(400).json({
              success: false,
              message: 'No backup name provided',
            });
          }

          const backupDir = path.join(process.cwd(), 'backups', backupName);

          if (!fs.existsSync(backupDir)) {
            return res.status(404).json({
              success: false,
              message: 'Backup not found',
            });
          }

          await restoreFromDirectory(backupDir);

          return res.status(200).json({
            success: true,
            message: `Backup "${backupName}" restored successfully`,
          });
        } catch (error) {
          console.error('Restore error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to restore backup: ' + (error as Error).message,
          });
        }
      });
    }
  } catch (error) {
    console.error('Restore error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore backup: ' + (error as Error).message,
    });
  }
}

async function restoreFromZip(zipPath: string): Promise<void> {
  const tempDir = path.join(process.cwd(), 'temp-restore');

  // Extract ZIP
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tempDir, true);

  // Restore from extracted directory
  await restoreFromDirectory(tempDir);

  // Cleanup temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
}

async function restoreFromDirectory(backupDir: string): Promise<void> {
  const results: string[] = [];

  // Restore Database
  const dbFile = path.join(backupDir, 'database.sql');
  if (fs.existsSync(dbFile)) {
    try {
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbUser = process.env.DB_USER || 'root';
      const dbPassword = process.env.DB_PASSWORD || '';
      const dbName = process.env.DB_NAME || 'kflr';

      const restoreCommand = `mysql -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} < "${dbFile}"`;
      
      await execAsync(restoreCommand);
      results.push('Database restored successfully');
    } catch (error) {
      console.error('Database restore error:', error);
      throw new Error('Database restore failed: ' + (error as Error).message);
    }
  }

  // Restore Files
  const uploadsBackup = path.join(backupDir, 'uploads');
  if (fs.existsSync(uploadsBackup)) {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const uploadsDir = path.join(publicDir, 'uploads');

      // Backup current uploads before overwriting
      if (fs.existsSync(uploadsDir)) {
        const backupCurrent = path.join(publicDir, `uploads-backup-${Date.now()}`);
        fs.renameSync(uploadsDir, backupCurrent);
      }

      // Copy restored uploads
      fs.cpSync(uploadsBackup, uploadsDir, { recursive: true });
      results.push('Files restored successfully');
    } catch (error) {
      console.error('Files restore error:', error);
      throw new Error('Files restore failed: ' + (error as Error).message);
    }
  }

  if (results.length === 0) {
    throw new Error('No data found in backup to restore');
  }
}
