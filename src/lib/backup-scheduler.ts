/**
 * Backup Scheduler
 * 
 * Production-safe backup scheduling with lifecycle management.
 * Prevents auto-start in production and includes concurrency controls.
 * 
 * Requirements: 1.3, 3.2, 3.4, 10.1, 10.3, 10.5
 */

import lifecycleManager from './lifecycle-manager';

let scheduledTask: NodeJS.Timeout | null = null;
let isBackupRunning = false;
let backupStartTime: number | null = null;

const MAX_EXECUTION_TIME = 30 * 60 * 1000; // 30 minutes

export interface BackupSchedulerConfig {
  enabled: boolean;
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  maxExecutionTime?: number;
}

/**
 * Check if backup scheduler should auto-start based on environment
 * @returns true if auto-start is allowed
 */
function shouldAutoStart(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  
  // Never auto-start in production
  if (nodeEnv === 'production') {
    console.log('[BackupScheduler] Auto-start disabled in production environment');
    return false;
  }
  
  return true;
}

/**
 * Start the backup scheduler
 * @param config - Scheduler configuration
 */
export function startBackupScheduler(config: BackupSchedulerConfig): void {
  // Prevent duplicate initialization
  if (lifecycleManager.isInitialized('backup-scheduler')) {
    console.warn('[BackupScheduler] Already initialized, skipping');
    return;
  }

  // Check environment before auto-starting
  if (!shouldAutoStart()) {
    console.log('[BackupScheduler] Scheduler not started (production environment)');
    console.log('[BackupScheduler] Use explicit API call to trigger backups in production');
    lifecycleManager.markInitialized('backup-scheduler');
    return;
  }

  // Stop existing task if any
  if (scheduledTask) {
    clearInterval(scheduledTask);
    scheduledTask = null;
  }

  if (!config.enabled) {
    console.log('[BackupScheduler] Scheduler disabled by configuration');
    lifecycleManager.markInitialized('backup-scheduler');
    return;
  }

  // Convert schedule to milliseconds
  let intervalMs: number;
  switch (config.schedule) {
    case 'hourly':
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case 'monthly':
      intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      break;
    default:
      intervalMs = 24 * 60 * 60 * 1000; // Default to daily
  }

  // Schedule the backup task
  scheduledTask = setInterval(async () => {
    await runScheduledBackup(config.schedule, config.maxExecutionTime || MAX_EXECUTION_TIME);
  }, intervalMs);

  // Register with lifecycle manager for cleanup
  lifecycleManager.registerInterval(scheduledTask, 'backup-scheduler');
  lifecycleManager.markInitialized('backup-scheduler');

  console.log(`[BackupScheduler] Started: ${config.schedule} (every ${intervalMs}ms)`);
}

/**
 * Run a scheduled backup with mutex and timeout protection
 * @param schedule - Schedule type for logging
 * @param maxExecutionTime - Maximum execution time in milliseconds
 */
async function runScheduledBackup(schedule: string, maxExecutionTime: number): Promise<void> {
  // Mutex: Prevent concurrent backups
  if (isBackupRunning) {
    console.warn('[BackupScheduler] Backup already running, skipping this execution');
    return;
  }

  isBackupRunning = true;
  backupStartTime = Date.now();

  console.log(`[BackupScheduler] Running scheduled backup (${schedule})...`);

  // Set up execution timeout
  const timeoutId = setTimeout(() => {
    const elapsed = Date.now() - (backupStartTime || 0);
    console.error(`[BackupScheduler] Backup exceeded maximum execution time (${elapsed}ms > ${maxExecutionTime}ms)`);
    console.error('[BackupScheduler] Backup may still be running but will be marked as failed');
    isBackupRunning = false;
    backupStartTime = null;
  }, maxExecutionTime);

  try {
    // Call the backup API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/backup/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.success) {
      const elapsed = Date.now() - (backupStartTime || 0);
      console.log(`[BackupScheduler] Backup completed successfully in ${elapsed}ms:`, data.backupName);
      
      // Run cleanup after backup
      const cleanupResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/backup/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const cleanupData = await cleanupResponse.json();
      if (cleanupData.success) {
        console.log('[BackupScheduler] Cleanup completed:', cleanupData.message);
      }
    } else {
      console.error('[BackupScheduler] Backup failed:', data.message);
    }
  } catch (error) {
    console.error('[BackupScheduler] Backup error:', error);
  } finally {
    // Clear timeout and release mutex
    clearTimeout(timeoutId);
    isBackupRunning = false;
    backupStartTime = null;
  }
}

/**
 * Stop the backup scheduler
 */
export function stopBackupScheduler(): void {
  if (scheduledTask) {
    clearInterval(scheduledTask);
    scheduledTask = null;
    console.log('[BackupScheduler] Stopped');
  }
}

/**
 * Check if a backup is currently running
 * @returns true if backup is in progress
 */
export function isBackupInProgress(): boolean {
  return isBackupRunning;
}

/**
 * Get backup scheduler status
 * @returns Status information
 */
export function getBackupSchedulerStatus() {
  return {
    isRunning: scheduledTask !== null,
    isBackupInProgress: isBackupRunning,
    backupStartTime: backupStartTime ? new Date(backupStartTime).toISOString() : null,
    environment: process.env.NODE_ENV || 'development',
    autoStartAllowed: shouldAutoStart(),
  };
}
