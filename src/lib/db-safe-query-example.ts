/**
 * Example usage of safeQuery in API endpoints
 * 
 * This file demonstrates how to use the database safety wrapper
 * in your API handlers to ensure proper error handling and logging.
 */

import { safeQuery, safeQueryResult } from './db-safe-query';
import type { NextApiRequest, NextApiResponse } from 'next';

// Example 1: Using safeQuery with try-catch (throws on error)
export async function getUserById(userId: number) {
  try {
    const users = await safeQuery<Array<{ id: number; name: string; email: string }>>(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );
    
    return users[0] || null;
  } catch (error) {
    // Error is already logged by safeQuery
    // Just handle the error appropriately
    throw error;
  }
}

// Example 2: Using safeQueryResult (returns result object)
export async function getUserByIdSafe(userId: number) {
  const result = await safeQueryResult<Array<{ id: number; name: string; email: string }>>(
    'SELECT id, name, email FROM users WHERE id = ?',
    [userId]
  );
  
  if (!result.success) {
    // Handle error without try-catch
    console.error('Failed to fetch user:', result.errorId);
    return null;
  }
  
  return result.data[0] || null;
}

// Example 3: API endpoint using safeQuery
export async function apiGetUser(req: NextApiRequest, res: NextApiResponse) {
  const userId = parseInt(req.query.id as string);
  
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }
  
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    // Error is already logged with context by safeQuery
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user',
      // Error ID is included in the error message
    });
  }
}

// Example 4: API endpoint using safeQueryResult
export async function apiGetUserSafe(req: NextApiRequest, res: NextApiResponse) {
  const userId = parseInt(req.query.id as string);
  
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }
  
  const result = await safeQueryResult<Array<{ id: number; name: string; email: string }>>(
    'SELECT id, name, email FROM users WHERE id = ?',
    [userId]
  );
  
  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user',
      errorId: result.errorId,
    });
  }
  
  const user = result.data[0];
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  return res.status(200).json({ success: true, data: user });
}

// Example 5: Multiple queries with proper error handling
export async function createOrderWithItems(
  userId: number,
  items: Array<{ productId: number; quantity: number; price: number }>
) {
  // Note: For transactions, you should use the pool.getConnection() approach
  // This is a simplified example showing individual queries
  
  // Insert order
  const orderResult = await safeQueryResult<{ insertId: number }>(
    'INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, ?, NOW())',
    [userId, items.reduce((sum, item) => sum + item.price * item.quantity, 0), 'pending']
  );
  
  if (!orderResult.success) {
    throw new Error(`Failed to create order: ${orderResult.errorId}`);
  }
  
  const orderId = (orderResult.data as any).insertId;
  
  // Insert order items
  for (const item of items) {
    const itemResult = await safeQueryResult(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, item.productId, item.quantity, item.price]
    );
    
    if (!itemResult.success) {
      // In a real scenario, you'd want to rollback the order
      throw new Error(`Failed to create order item: ${itemResult.errorId}`);
    }
  }
  
  return orderId;
}

// Example 6: Query with multiple parameters
export async function searchProducts(
  minPrice: number,
  maxPrice: number,
  category: string,
  inStock: boolean
) {
  return await safeQuery<Array<{ id: number; name: string; price: number }>>(
    `SELECT id, name, price, stock 
     FROM products 
     WHERE price >= ? AND price <= ? AND category = ? AND stock > ?`,
    [minPrice, maxPrice, category, inStock ? 0 : -1]
  );
}

// Example 7: Query without parameters
export async function getActiveCategories() {
  return await safeQuery<Array<{ id: number; name: string }>>(
    'SELECT id, name FROM categories WHERE active = 1 ORDER BY name'
  );
}
