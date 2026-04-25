import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { startBackupScheduler, stopBackupScheduler, getBackupSchedulerStatus } from '@/lib/backup-scheduler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // GET: Return scheduler status
    if (req.method === 'GET') {
      const status = getBackupSchedulerStatus();
      return res.status(200).json({
        success: true,
        status,
      });
    }

    // POST: Start or stop scheduler
    const { action } = req.body;

    if (action === 'start') {
      // Fetch backup settings from database
      const rows = await query(
        'SELECT setting_key, setting_value FROM site_settings WHERE setting_type = ?',
        ['backup']
      ) as any[];

      const settings: any = {};
      rows.forEach((row) => {
        let value: any = row.setting_value;
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        settings[row.setting_key] = value;
      });

      const enabled = settings.backup_enabled || false;
      const schedule = settings.backup_schedule || 'daily';

      // Start the scheduler with new config format
      startBackupScheduler({
        enabled,
        schedule: schedule as 'hourly' | 'daily' | 'weekly' | 'monthly',
      });

      return res.status(200).json({
        success: true,
        message: enabled 
          ? `Backup scheduler started: ${schedule}` 
          : 'Backup scheduler is disabled',
        enabled,
        schedule,
      });
    } else if (action === 'stop') {
      // Stop the scheduler
      stopBackupScheduler();

      return res.status(200).json({
        success: true,
        message: 'Backup scheduler stopped',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "start" or "stop"',
      });
    }
  } catch (error) {
    console.error('Scheduler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to manage backup scheduler: ' + (error as Error).message,
    });
  }
}
