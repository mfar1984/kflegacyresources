import { query } from '@/lib/db';
import { startBackupScheduler } from '@/lib/backup-scheduler';

let initialized = false;

export async function initializeBackupScheduler() {
  if (initialized) {
    return;
  }

  try {
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

    initialized = true;
    console.log('Backup scheduler initialized');
  } catch (error) {
    console.error('Failed to initialize backup scheduler:', error);
  }
}
