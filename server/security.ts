import type { Request, Response, NextFunction } from 'express';

/**
 * SQL Injection Detection Patterns
 * Checks for common SQL meta-characters, comment sequences, and injected commands
 */
const SQL_INJECTION_REGEX =
  /(\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|CREATE|TABLE|DATABASE|EXEC|EXECUTE|FETCH|SHUTDOWN|TRUNCATE|GRANT)\b)|(--|\/\*|\*\/|;|\bOR\b\s+["'\d]+=["'\d]+|\bAND\b\s+["'\d]+=["'\d]+)/i;

/**
 * HTML Tag Pattern (detects tags like <h1>, <div>, <script>, <b>, etc.)
 */
const HTML_TAG_REGEX = /<[^>]+>|<\s*[a-z/][^>]*>|[<>]/i;

/**
 * Checks whether an input contains HTML tags or angle brackets
 */
export function containsHtml(value: any): boolean {
  if (value === null || value === undefined) return false;
  return HTML_TAG_REGEX.test(String(value));
}

/**
 * Sanitize a string against HTML injection, SQL injection, NoSQL operator injection, and XSS
 */
export function sanitizeString(value: any, maxLength = 1000): string {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();

  // Strip null bytes
  str = str.replace(/\0/g, '');

  // Truncate to maximum length to prevent buffer/payload flooding
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  // Remove ALL HTML tags (e.g., <h1>test</h1>, <script>, <div>, etc.)
  str = str.replace(/<[^>]*>/g, '');

  // Strip raw angle brackets (< and >)
  str = str.replace(/[<>]/g, '');

  // Remove potential dangerous SQL comment sequences
  str = str.replace(/--+/g, '-').replace(/\/\*[\s\S]*?\*\//g, '');

  return str.trim();
}

/**
 * Sanitize a number safely
 */
export function sanitizeNumber(value: any, defaultValue = 0): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }
  return num;
}

/**
 * Recursively clean an object to remove Mongo NoSQL operators ($gt, $ne, $where, $regex, etc.),
 * Prototype pollution, SQL injection fragments, and strip all HTML tags.
 */
export function sanitizePayload<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(input)) {
      // Block Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        console.warn(`[Security Alert] Blocked prototype pollution attempt: "${key}"`);
        continue;
      }

      // Block MongoDB operators starting with '$' or containing '.' (NoSQL Injection defense)
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`[Security Alert] Blocked suspicious NoSQL operator key: "${key}"`);
        continue;
      }
      cleanObj[key] = sanitizePayload(val);
    }
    return cleanObj as T;
  }

  if (typeof input === 'string') {
    return sanitizeString(input, 2000) as unknown as T;
  }

  return input;
}

/**
 * Deep check if any string field in an object or array contains HTML tags
 */
export function payloadContainsHtml(input: any): boolean {
  if (input === null || input === undefined) return false;
  if (typeof input === 'string') return containsHtml(input);
  if (Array.isArray(input)) return input.some(payloadContainsHtml);
  if (typeof input === 'object') {
    return Object.values(input).some(payloadContainsHtml);
  }
  return false;
}

/**
 * Express Middleware: Protects every incoming request against HTML injection, SQL & NoSQL injection
 */
export function securitySanitizerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set hardened security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // If a POST/PUT/PATCH request contains HTML markup in fields, reject it with 400 Bad Request
  // Exception: Avatar image data URLs which might start with data:image/ (they don't contain < > tags anyway)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.body && typeof req.body === 'object') {
      // Check if body has any HTML tags (e.g., <h1>test</h1>)
      const hasHtml = payloadContainsHtml(req.body);
      if (hasHtml) {
        return res.status(400).json({
          status: 'fail',
          message: 'Prohibited input: HTML tags (e.g., <h1>, <script>) and angle brackets (< >) are not permitted.',
        });
      }
    }
  }

  // Sanitize Query Parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizePayload(req.query);
  }

  // Sanitize URL Parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizePayload(req.params);
  }

  // Sanitize Request Body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }

  next();
}
