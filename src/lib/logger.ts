/**
 * Production Logger
 * 
 * Implements dual logging (console + file) for production environments.
 * Provides log rotation to prevent disk space exhaustion.
 * Supports request ID generation and tracking for distributed tracing.
 * 
 * Requirements: 9.5, 9.6
 */

import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  context?: Record<string, unknown>;
}

export interface LoggerConfig {
  enableFileLogging: boolean;
  logDirectory: string;
  maxFileSize: number;        // in bytes (default: 10MB)
  maxFiles: number;           // number of rotated files to keep
  logLevel: LogLevel;
}

const isProduction = process.env.NODE_ENV === 'production';

// Default configuration
const defaultConfig: LoggerConfig = {
  enableFileLogging: isProduction,
  logDirectory: path.join(process.cwd(), 'logs'),
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  maxFiles: 5,
  logLevel: isProduction ? 'info' : 'debug',
};

let config: LoggerConfig = defaultConfig;
let currentLogFile: string | null = null;
let currentLogStream: fs.WriteStream | null = null;

// Log level priorities for filtering
const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * Generate a unique request ID for tracking
 * Uses cryptographically secure random bytes
 */
export function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Initialize logger with custom configuration
 */
export function initializeLogger(userConfig?: Partial<LoggerConfig>): void {
  config = { ...defaultConfig, ...userConfig };

  // Create log directory if it doesn't exist
  if (config.enableFileLogging && !fs.existsSync(config.logDirectory)) {
    fs.mkdirSync(config.logDirectory, { recursive: true });
  }

  // Initialize log file
  if (config.enableFileLogging) {
    rotateLogFileIfNeeded();
  }

  log('info', 'Logger initialized', {
    environment: isProduction ? 'production' : 'development',
    fileLogging: config.enableFileLogging,
    logDirectory: config.logDirectory,
    logLevel: config.logLevel,
  });
}

/**
 * Get current log file path
 */
function getCurrentLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(config.logDirectory, `app-${date}.log`);
}

/**
 * Check if log rotation is needed and perform rotation
 */
function rotateLogFileIfNeeded(): void {
  const logFilePath = getCurrentLogFilePath();

  // Check if we need to switch to a new day's log file
  if (currentLogFile !== logFilePath) {
    closeCurrentLogStream();
    currentLogFile = logFilePath;
    currentLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }

  // Check file size for rotation
  if (fs.existsSync(logFilePath)) {
    const stats = fs.statSync(logFilePath);
    
    if (stats.size >= config.maxFileSize) {
      // Rotate by timestamp
      const timestamp = Date.now();
      const rotatedPath = logFilePath.replace('.log', `.${timestamp}.log`);
      
      closeCurrentLogStream();
      fs.renameSync(logFilePath, rotatedPath);
      
      // Create new log file
      currentLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });
      
      // Clean up old rotated files
      cleanupOldLogFiles();
    }
  }
}

/**
 * Close current log stream
 */
function closeCurrentLogStream(): void {
  if (currentLogStream) {
    currentLogStream.end();
    currentLogStream = null;
  }
}

/**
 * Clean up old rotated log files
 * Keeps only the most recent maxFiles rotated logs
 */
function cleanupOldLogFiles(): void {
  try {
    const files = fs.readdirSync(config.logDirectory);
    
    // Filter for rotated log files (contain timestamp)
    const rotatedFiles = files
      .filter(file => file.match(/app-\d{4}-\d{2}-\d{2}\.\d+\.log$/))
      .map(file => ({
        name: file,
        path: path.join(config.logDirectory, file),
        mtime: fs.statSync(path.join(config.logDirectory, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

    // Delete old files beyond maxFiles limit
    if (rotatedFiles.length > config.maxFiles) {
      const filesToDelete = rotatedFiles.slice(config.maxFiles);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`Deleted old log file: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old log files:', error);
  }
}

/**
 * Write log entry to file
 */
function writeToFile(logEntry: LogEntry): void {
  if (!config.enableFileLogging || !currentLogStream) {
    return;
  }

  try {
    // Check if rotation is needed before writing
    rotateLogFileIfNeeded();

    const logLine = JSON.stringify(logEntry) + '\n';
    currentLogStream.write(logLine);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

/**
 * Format log entry for console output
 */
function formatConsoleLog(logEntry: LogEntry): string {
  const { timestamp, level, message, requestId, context } = logEntry;
  
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m',   // Cyan
    info: '\x1b[32m',    // Green
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    fatal: '\x1b[35m',   // Magenta
  };
  
  const reset = '\x1b[0m';
  const color = levelColors[level] || reset;
  
  let output = `${color}[${timestamp}] [${level.toUpperCase()}]${reset}`;
  
  if (requestId) {
    output += ` [${requestId}]`;
  }
  
  output += ` ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    output += `\n${JSON.stringify(context, null, 2)}`;
  }
  
  return output;
}

/**
 * Core logging function
 */
export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  requestId?: string
): void {
  // Filter by log level
  if (logLevelPriority[level] < logLevelPriority[config.logLevel]) {
    return;
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    requestId,
    context,
  };

  // Console logging (always enabled)
  const consoleLog = formatConsoleLog(logEntry);
  
  switch (level) {
    case 'debug':
    case 'info':
      console.log(consoleLog);
      break;
    case 'warn':
      console.warn(consoleLog);
      break;
    case 'error':
    case 'fatal':
      console.error(consoleLog);
      break;
  }

  // File logging (production only by default)
  writeToFile(logEntry);
}

/**
 * Convenience logging methods
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>, requestId?: string) => 
    log('debug', message, context, requestId),
  
  info: (message: string, context?: Record<string, unknown>, requestId?: string) => 
    log('info', message, context, requestId),
  
  warn: (message: string, context?: Record<string, unknown>, requestId?: string) => 
    log('warn', message, context, requestId),
  
  error: (message: string, context?: Record<string, unknown>, requestId?: string) => 
    log('error', message, context, requestId),
  
  fatal: (message: string, context?: Record<string, unknown>, requestId?: string) => 
    log('fatal', message, context, requestId),
};

/**
 * Graceful shutdown - close log streams
 */
export function shutdownLogger(): void {
  log('info', 'Logger shutting down');
  closeCurrentLogStream();
}

// Initialize logger on module load
initializeLogger();
