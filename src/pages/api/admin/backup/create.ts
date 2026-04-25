import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { logError } from '@/lib/error-handler';
import { isBackupInProgress } from '@/lib/backup-scheduler';

const execAsync = promisify(exec);

interface BackupSettings {
  backup_include_database: boolean;
  backup_include_files: boolean;
  backup_location: string;
}

// Maximum execution time: 30 minutes
const MAX_EXECUTION_TIME = 30 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Requirement 10.2: Admin authentication check
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Admin authentication required' 
    });
  }

  // Verify admin token
  try {
    const [sessions] = await query(
      'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    ) as any[];

    if (!sessions) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired admin session' 
      });
    }
  } catch (authError) {
    logError(authError as Error, { 
      context: 'backup-api-authentication',
      url: req.url 
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication verification failed' 
    });
  }

  // Requirement 10.3: Prevent concurrent backup operations
  if (isBackupInProgress()) {
    return res.status(409).json({ 
      success: false, 
      message: 'A backup is already in progress. Please wait for it to complete.' 
    });
  }

  // Set up execution time limit (Requirement 10.5)
  const startTime = Date.now();
  let timeoutExceeded = false;
  
  const timeoutId = setTimeout(() => {
    timeoutExceeded = true;
    const elapsed = Date.now() - startTime;
    logError(new Error('Backup execution time limit exceeded'), {
      context: 'backup-api-timeout',
      elapsed,
      maxExecutionTime: MAX_EXECUTION_TIME
    });
  }, MAX_EXECUTION_TIME);

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

    const backupSettings: BackupSettings = {
      backup_include_database: settings.backup_include_database || false,
      backup_include_files: settings.backup_include_files || false,
      backup_location: settings.backup_location || 'local',
    };

    // Create backup directory if not exists
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(backupDir, backupName);

    // Create backup subdirectory
    fs.mkdirSync(backupPath, { recursive: true });

    const results: string[] = [];

    // Check timeout before starting backup operations
    if (timeoutExceeded) {
      throw new Error('Backup operation timed out before completion');
    }

    // Backup Database
    if (backupSettings.backup_include_database) {
      try {
        // Check timeout
        if (timeoutExceeded) {
          throw new Error('Backup operation timed out');
        }

        const dbHost = process.env.DB_HOST || 'localhost';
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbName = process.env.DB_NAME || 'kflr';

        const dumpFile = path.join(backupPath, 'database.sql');
        
        // Use mysqldump command
        const dumpCommand = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${dumpFile}"`;
        
        await execAsync(dumpCommand);
        results.push('Database backed up successfully');
      } catch (error) {
        // Requirement 10.4: Log backup errors
        logError(error as Error, { 
          context: 'backup-database',
          backupName,
          url: req.url 
        });
        results.push('Database backup failed: ' + (error as Error).message);
      }
    }

    // Backup Files
    if (backupSettings.backup_include_files) {
      try {
        // Check timeout
        if (timeoutExceeded) {
          throw new Error('Backup operation timed out');
        }

        const publicDir = path.join(process.cwd(), 'public');
        const uploadsBackup = path.join(backupPath, 'uploads');
        
        // Copy public/uploads directory if exists
        if (fs.existsSync(path.join(publicDir, 'uploads'))) {
          fs.cpSync(path.join(publicDir, 'uploads'), uploadsBackup, { recursive: true });
          results.push('Files backed up successfully');
        } else {
          results.push('No uploads directory found');
        }
      } catch (error) {
        // Requirement 10.4: Log backup errors
        logError(error as Error, { 
          context: 'backup-files',
          backupName,
          url: req.url 
        });
        results.push('Files backup failed: ' + (error as Error).message);
      }
    }

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      database: backupSettings.backup_include_database,
      files: backupSettings.backup_include_files,
      location: backupSettings.backup_location,
      size: getDirectorySize(backupPath),
      executionTime: Date.now() - startTime,
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Log backup to database
    await query(
      `INSERT INTO site_settings_audit (setting_key, old_value, new_value, changed_by) 
       VALUES (?, ?, ?, ?)`,
      ['backup_created', '', backupName, 'admin']
    );

    const executionTime = Date.now() - startTime;
    console.log(`[BackupAPI] Backup completed in ${executionTime}ms`);

    return res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      backupName,
      results,
      path: backupPath,
      executionTime,
    });
  } catch (error) {
    // Requirement 10.4: Error logging and notification
    const errorId = logError(error as Error, {
      context: 'backup-api-error',
      url: req.url,
      method: req.method,
      executionTime: Date.now() - startTime,
    });

    console.error('[BackupAPI] Backup creation error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create backup: ' + (error as Error).message,
      errorId,
    });
  } finally {
    // Requirement 10.6: Resource cleanup on completion
    clearTimeout(timeoutId);
    
    const totalTime = Date.now() - startTime;
    console.log(`[BackupAPI] Request completed in ${totalTime}ms`);
  }
}

function getDirectorySize(dirPath: string): string {
  let totalSize = 0;

  function calculateSize(currentPath: string) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach((file) => {
        calculateSize(path.join(currentPath, file));
      });
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
