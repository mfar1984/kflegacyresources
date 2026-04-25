import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Force www only in production; allow localhost during development
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') || '';
    const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0') || host.endsWith('.local');
    if (host && !isLocalHost && !host.startsWith('www.kflegacyresources.com')) {
      const url = request.nextUrl.clone();
      url.hostname = 'www.kflegacyresources.com';
      url.port = '';
      return NextResponse.redirect(url, 308);
    }
  }
  if (request.nextUrl.pathname === "/contact") {
    const url = request.nextUrl.clone();
    url.pathname = "/request-quotation";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();

  // Security Headers
  // Content Security Policy - Prevents XSS and injection attacks
  const isProd = process.env.NODE_ENV === 'production';
  const scriptPolicies = ["'self'", "'unsafe-inline'"].concat(isProd ? [] : ["'unsafe-eval'"]).join(' ');
  const csp = [
    "default-src 'self'",
    `script-src ${scriptPolicies}`,
    `script-src-elem ${scriptPolicies}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' https: data:",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  
  // Prevent MIME type sniffing
  res.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy - Control referrer information
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy - Disable unnecessary browser features
  res.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), microphone=(), geolocation=(), payment=()');
  
  // Prevent clickjacking attacks
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Enable XSS protection (legacy browsers)
  res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Force HTTPS in production
  if (isProd) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return res;
}

export const config = {
  matcher: ["/contact", "/(.*)"],
};


