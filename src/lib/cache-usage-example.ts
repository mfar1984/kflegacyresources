/**
 * Example usage of the caching layer for categories and settings
 * 
 * This demonstrates how to integrate the cache with database queries
 * to reduce database load and improve performance.
 */

import { categoryCache, settingsCache } from './cache';
import { query } from './db';

/**
 * Get all categories with caching
 * Cache TTL: 10 minutes (configured in cache.ts)
 */
export async function getCachedCategories(): Promise<unknown[]> {
  const cacheKey = 'categories:all';
  
  // Try to get from cache first
  const cached = categoryCache.get(cacheKey);
  if (cached !== undefined) {
    return cached as unknown[];
  }
  
  // Cache miss - fetch from database
  const categories = await query('SELECT * FROM categories ORDER BY name ASC');
  
  // Store in cache
  categoryCache.set(cacheKey, categories);
  
  return categories as unknown[];
}

/**
 * Get a specific category by ID with caching
 */
export async function getCachedCategory(id: number): Promise<unknown | null> {
  const cacheKey = `category:${id}`;
  
  // Try to get from cache first
  const cached = categoryCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  // Cache miss - fetch from database
  const result = await query('SELECT * FROM categories WHERE id = ?', [id]);
  const category = Array.isArray(result) && result.length > 0 ? result[0] : null;
  
  // Store in cache
  if (category) {
    categoryCache.set(cacheKey, category);
  }
  
  return category;
}

/**
 * Invalidate category cache when categories are updated
 * Call this after INSERT, UPDATE, or DELETE operations on categories
 */
export function invalidateCategoryCache(categoryId?: number): void {
  if (categoryId) {
    // Invalidate specific category
    categoryCache.delete(`category:${categoryId}`);
  }
  
  // Always invalidate the "all categories" cache
  categoryCache.delete('categories:all');
}

/**
 * Get all site settings with caching
 * Cache TTL: 5 minutes (configured in cache.ts)
 */
export async function getCachedSettings(): Promise<Record<string, string>> {
  const cacheKey = 'settings:all';
  
  // Try to get from cache first
  const cached = settingsCache.get(cacheKey);
  if (cached !== undefined) {
    return cached as Record<string, string>;
  }
  
  // Cache miss - fetch from database
  const rows = await query('SELECT setting_key, setting_value FROM site_settings');
  
  // Convert to key-value object
  const settings: Record<string, string> = {};
  if (Array.isArray(rows)) {
    for (const row of rows) {
      const r = row as { setting_key: string; setting_value: string };
      settings[r.setting_key] = r.setting_value;
    }
  }
  
  // Store in cache
  settingsCache.set(cacheKey, settings);
  
  return settings;
}

/**
 * Get a specific setting by key with caching
 */
export async function getCachedSetting(key: string): Promise<string | null> {
  const cacheKey = `setting:${key}`;
  
  // Try to get from cache first
  const cached = settingsCache.get(cacheKey);
  if (cached !== undefined) {
    return cached as string;
  }
  
  // Cache miss - fetch from database
  const result = await query(
    'SELECT setting_value FROM site_settings WHERE setting_key = ?',
    [key]
  );
  
  const value = Array.isArray(result) && result.length > 0 
    ? (result[0] as { setting_value: string }).setting_value 
    : null;
  
  // Store in cache
  if (value !== null) {
    settingsCache.set(cacheKey, value);
  }
  
  return value;
}

/**
 * Invalidate settings cache when settings are updated
 * Call this after INSERT, UPDATE, or DELETE operations on site_settings
 */
export function invalidateSettingsCache(settingKey?: string): void {
  if (settingKey) {
    // Invalidate specific setting
    settingsCache.delete(`setting:${settingKey}`);
  }
  
  // Always invalidate the "all settings" cache
  settingsCache.delete('settings:all');
}

/**
 * Get cache metrics for monitoring
 */
export function getCacheMetrics() {
  return {
    categories: categoryCache.getMetrics(),
    settings: settingsCache.getMetrics(),
  };
}

/**
 * Example: Update a category and invalidate cache
 */
export async function updateCategory(id: number, name: string): Promise<void> {
  // Update database
  await query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  
  // Invalidate cache
  invalidateCategoryCache(id);
}

/**
 * Example: Update a setting and invalidate cache
 */
export async function updateSetting(key: string, value: string): Promise<void> {
  // Update database
  await query(
    'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
    [value, key]
  );
  
  // Invalidate cache
  invalidateSettingsCache(key);
}
