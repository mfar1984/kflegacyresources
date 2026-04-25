// Authentication Configuration
// This file centralizes auth settings and reads from database

import { query } from '@/lib/db';

interface SettingRow {
  setting_key: string;
  setting_value: string;
}

// Cache for settings to avoid repeated database queries
let settingsCache: Record<string, any> = {};
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute cache

async function getSettingFromDB(key: string, defaultValue: any): Promise<any> {
  try {
    // Check cache first
    const now = Date.now();
    if (settingsCache[key] !== undefined && (now - lastCacheUpdate) < CACHE_TTL) {
      return settingsCache[key];
    }

    // Fetch from database
    const rows = await query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      [key]
    ) as SettingRow[];

    if (rows.length > 0) {
      let value: any = rows[0].setting_value;
      
      // Convert string to appropriate type
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      
      settingsCache[key] = value;
      lastCacheUpdate = now;
      return value;
    }

    return defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

// Export async function to get auth config
export async function getAuthConfig() {
  const adminUsername = await getSettingFromDB('admin_username', process.env.ADMIN_USERNAME || 'administrator@root');
  const adminPassword = await getSettingFromDB('admin_password', process.env.ADMIN_PASSWORD || 'S0m3b0dy!984');
  const sessionSecret = await getSettingFromDB('session_secret', process.env.SESSION_SECRET || 'default-session-secret-change-in-production');
  const bcryptRounds = await getSettingFromDB('bcrypt_rounds', 10);
  const maxLoginAttempts = await getSettingFromDB('brute_force_max_attempts', 5);
  const lockoutDuration = await getSettingFromDB('brute_force_lockout_minutes', 15);

  return {
    adminUsername,
    adminPassword,
    sessionSecret,
    sessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
    bcryptRounds,
    maxLoginAttempts,
    lockoutDuration: lockoutDuration * 60 * 1000, // Convert to milliseconds
  };
}

// Synchronous fallback for backward compatibility (uses cache or env vars)
export const AUTH_CONFIG = {
  adminUsername: process.env.ADMIN_USERNAME || 'administrator@root',
  adminPassword: process.env.ADMIN_PASSWORD || 'S0m3b0dy!984',
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
  sessionExpiry: 24 * 60 * 60 * 1000,
  bcryptRounds: 10,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
};

// Clear cache function (call after settings update)
export function clearAuthCache() {
  settingsCache = {};
  lastCacheUpdate = 0;
}

export default AUTH_CONFIG;
