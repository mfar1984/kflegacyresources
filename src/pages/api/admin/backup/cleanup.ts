import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Fetch backup retention setting from database
    const rows = await query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ? AND setting_type = ?',
      ['backup_retention', 'backup']
    ) as any[];

    const retentionDays = rows.length > 0 ? parseInt(rows[0].setting_value) : 7;
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
      return res.status(200).json({
        success: true,
        message: 'No backups directory found',
        deleted: 0,
      });
    }

    // Get all backup folders
    const backups = fs.readdirSync(backupDir)
      .filter(file => {
        const fullPath = path.join(backupDir, file);
        return fs.statSync(fullPath).isDirectory() && file.startsWith('backup-');
      });

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deletedCount = 0;
    const deletedBackups: string[] = [];

    for (const backup of backups) {
      const backupPath = path.join(backupDir, backup);
      const metadataPath = path.join(backupPath, 'metadata.json');

      // Check if metadata exists
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const backupDate = new Date(metadata.timestamp);

        // Delete if older than retention period
        if (backupDate < cutoffDate) {
          fs.rmSync(backupPath, { recursive: true, force: true });
          deletedCount++;
          deletedBackups.push(backup);
        }
      } else {
        // No metadata, check folder creation date
        const stats = fs.statSync(backupPath);
        if (stats.birthtime < cutoffDate) {
          fs.rmSync(backupPath, { recursive: true, force: true });
          deletedCount++;
          deletedBackups.push(backup);
        }
      }
    }

    // Log cleanup to database
    if (deletedCount > 0) {
      await query(
        `INSERT INTO site_settings_audit (setting_key, old_value, new_value, changed_by) 
         VALUES (?, ?, ?, ?)`,
        ['backup_cleanup', '', `Deleted ${deletedCount} old backups`, 'system']
      );
    }

    return res.status(200).json({
      success: true,
      message: deletedCount > 0 
        ? `Successfully deleted ${deletedCount} backup(s) older than ${retentionDays} days`
        : `No backups older than ${retentionDays} days found`,
      deleted: deletedCount,
      backups: deletedBackups,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cleanup old backups: ' + (error as Error).message,
    });
  }
}
