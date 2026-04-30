import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

// Rate limiting storage (in-memory - for production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface SecurityConfig {
  requireToken: boolean;
  checkCORS: boolean;
  checkRateLimit: boolean;
  maxRequestsPerHour?: number;
}

interface IntegrationSettings {
  api_token: string | null;
  api_allowed_origins: string;
  api_cors_allow_all: boolean;
}

/**
 * Apply CORS headers based on integration settings
 */
export async function applyCORS(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  try {
    // Get integration settings
    const settings: any = await query(
      'SELECT api_allowed_origins, api_cors_allow_all FROM integrations WHERE id = 1 LIMIT 1'
    );

    if (!Array.isArray(settings) || settings.length === 0) {
      return false;
    }

    const config = settings[0];
    
    // Extract origin from headers
    let origin = req.headers.origin || '';
    
    // If no origin header, try to extract from referer
    if (!origin && req.headers.referer) {
      try {
        const refererUrl = new URL(req.headers.referer);
        origin = `${refererUrl.protocol}//${refererUrl.host}`;
      } catch (e) {
        origin = '';
      }
    }

    // Always set CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Token');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Allow all origins
    if (config.api_cors_allow_all) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return true;
    }

    // Parse allowed origins
    let allowedOrigins: string[] = [];
    try {
      const parsed = JSON.parse(config.api_allowed_origins || '[]');
      // Handle case where origins are stored as one string instead of array items
      if (Array.isArray(parsed) && parsed.length === 1 && parsed[0].includes(' ')) {
        // Split by space if stored as single string
        allowedOrigins = parsed[0].split(/\s+/).filter((o: string) => o.length > 0);
      } else {
        allowedOrigins = parsed;
      }
    } catch {
      allowedOrigins = [];
    }

    // If no origins configured, BLOCK all (strict mode)
    if (allowedOrigins.length === 0) {
      // No CORS configured = no external access allowed
      return false;
    }

    // If no origin header (same-origin request from same server), allow it
    if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return true;
    }

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed.includes('*')) {
        // Wildcard subdomain matching
        const pattern = allowed.replace(/\*/g, '.*').replace(/\./g, '\\.');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      return true;
    }

    return false;
  } catch (error) {
    console.error('CORS error:', error);
    return false;
  }
}

/**
 * Verify API token from request headers
 */
export async function verifyAPIToken(req: NextApiRequest): Promise<boolean> {
  try {
    const token = req.headers['x-api-token'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    // Get valid token from database
    const settings: any = await query(
      'SELECT api_token FROM integrations WHERE id = 1 LIMIT 1'
    );

    if (!Array.isArray(settings) || settings.length === 0 || !settings[0].api_token) {
      return false;
    }

    // Update usage count and last used
    if (token === settings[0].api_token) {
      await query(
        'UPDATE integrations SET api_token_last_used = NOW(), api_token_usage_count = api_token_usage_count + 1 WHERE id = 1'
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Rate limiting check
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;

  // Get or create rate limit entry
  let limitData = rateLimitMap.get(identifier);

  if (!limitData || now > limitData.resetTime) {
    // Create new or reset expired entry
    limitData = {
      count: 0,
      resetTime: now + hourInMs,
    };
    rateLimitMap.set(identifier, limitData);
  }

  // Increment count
  limitData.count++;

  // Check if limit exceeded
  const allowed = limitData.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - limitData.count);

  return {
    allowed,
    remaining,
    resetTime: limitData.resetTime,
  };
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(req: NextApiRequest): string {
  // Try to get API token first (more specific)
  const token = req.headers['x-api-token'] || req.headers['authorization']?.replace('Bearer ', '');
  if (token) {
    return `token:${token}`;
  }

  // Fall back to IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket.remoteAddress;

  return `ip:${ip || 'unknown'}`;
}

/**
 * Log API request for audit trail
 */
export async function logAPIRequest(
  req: NextApiRequest,
  endpoint: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    const identifier = getRateLimitIdentifier(req);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const origin = req.headers.origin || req.headers.referer || 'unknown';

    // In production, you might want to store this in a dedicated table
    console.log('[API Request]', {
      timestamp: new Date().toISOString(),
      endpoint,
      identifier,
      ip,
      origin,
      userAgent,
      success,
      errorMessage,
    });

    // Optional: Store in database
    // await query(
    //   'INSERT INTO api_logs (endpoint, identifier, ip, origin, user_agent, success, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //   [endpoint, identifier, ip, origin, userAgent, success, errorMessage || null]
    // );
  } catch (error) {
    console.error('Logging error:', error);
  }
}

/**
 * Main security middleware
 */
export async function securePublicAPI(
  req: NextApiRequest,
  res: NextApiResponse,
  config: SecurityConfig = {
    requireToken: true,
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 1000,
  }
): Promise<{ allowed: boolean; error?: string }> {
  const endpoint = req.url || 'unknown';

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    if (config.checkCORS) {
      await applyCORS(req, res);
    }
    res.status(200).end();
    return { allowed: false }; // Don't process OPTIONS further
  }

  // Apply CORS
  if (config.checkCORS) {
    const corsAllowed = await applyCORS(req, res);
    if (!corsAllowed) {
      await logAPIRequest(req, endpoint, false, 'CORS: Origin not allowed');
      res.status(403).json({ error: 'Origin not allowed' });
      return { allowed: false, error: 'CORS violation' };
    }
  }

  // Check API Token
  if (config.requireToken) {
    const tokenValid = await verifyAPIToken(req);
    if (!tokenValid) {
      await logAPIRequest(req, endpoint, false, 'Invalid or missing API token');
      res.status(401).json({ error: 'Invalid or missing API token' });
      return { allowed: false, error: 'Invalid token' };
    }
  }

  // Check Rate Limit
  if (config.checkRateLimit) {
    const identifier = getRateLimitIdentifier(req);
    const rateLimit = checkRateLimit(identifier, config.maxRequestsPerHour || 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequestsPerHour || 1000);
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(rateLimit.resetTime / 1000));

    if (!rateLimit.allowed) {
      await logAPIRequest(req, endpoint, false, 'Rate limit exceeded');
      res.status(429).json({
        error: 'Rate limit exceeded',
        limit: config.maxRequestsPerHour,
        resetTime: Math.floor(rateLimit.resetTime / 1000),
      });
      return { allowed: false, error: 'Rate limit exceeded' };
    }
  }

  // Log successful request
  await logAPIRequest(req, endpoint, true);

  return { allowed: true };
}

/**
 * Cleanup old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);

