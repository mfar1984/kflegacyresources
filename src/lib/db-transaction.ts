import pool from './db';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

/**
 * Transaction helper for multi-query operations
 * Ensures all queries succeed or all rollback
 * Properly releases connection after transaction
 * 
 * Requirements: 8.4, 8.5
 */

export interface TransactionResult<T> {
  success: true;
  data: T;
}

export interface TransactionError {
  success: false;
  error: Error;
}

/**
 * Execute multiple queries within a transaction
 * All queries must succeed or all will be rolled back
 * 
 * @param callback - Function that receives a connection and executes queries
 * @returns Result object with success status and data or error
 * 
 * @example
 * const result = await withTransaction(async (conn) => {
 *   const [orderResult] = await conn.query<ResultSetHeader>(
 *     'INSERT INTO orders (customer_email, total) VALUES (?, ?)',
 *     [email, total]
 *   );
 *   
 *   const orderId = orderResult.insertId;
 *   
 *   for (const item of items) {
 *     await conn.query(
 *       'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
 *       [orderId, item.productId, item.quantity]
 *     );
 *   }
 *   
 *   return orderId;
 * });
 * 
 * if (result.success) {
 *   console.log('Order created:', result.data);
 * } else {
 *   console.error('Transaction failed:', result.error);
 * }
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<TransactionResult<T> | TransactionError> {
  let connection: PoolConnection | null = null;

  try {
    // Get connection from pool
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Execute callback with connection
    const result = await callback(connection);

    // Commit transaction
    await connection.commit();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    return {
      success: false,
      error: error as Error,
    };
  } finally {
    // Always release connection back to pool
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Type-safe query helper for use within transactions
 * Provides better TypeScript support for query results
 */
export async function transactionQuery<T extends RowDataPacket[] | ResultSetHeader>(
  connection: PoolConnection,
  sql: string,
  params?: unknown[]
): Promise<T> {
  const [rows] = await connection.query<T>(sql, params);
  return rows;
}
