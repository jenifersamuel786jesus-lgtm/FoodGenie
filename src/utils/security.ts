/**
 * Client-Side Input Security & Sanitization Utility
 * Guards against HTML Injection / XSS, SQL Injection, NoSQL Injection, and Malformed Payloads.
 */

/**
 * Common SQL Injection tokens and metacharacters
 */
const SQL_INJECTION_PATTERN =
  /(\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|CREATE|TABLE|DATABASE|EXEC|EXECUTE|FETCH|SHUTDOWN|TRUNCATE|GRANT)\b)|(--|\/\*|\*\/|;|\bOR\b\s+["'\d]+=["'\d]+|\bAND\b\s+["'\d]+=["'\d]+)/i;

/**
 * HTML Tag and Angle Bracket Detection Pattern
 * Detects tags like <h1>, </h1>, <script>, <img ...>, <div>, etc.
 */
const HTML_TAG_PATTERN = /<[^>]+>|<\s*[a-z/][^>]*>|[<>]/i;

/**
 * Checks whether an input contains HTML markup or angle brackets (<, >)
 */
export function containsHtml(input: string | undefined | null): boolean {
  if (!input) return false;
  return HTML_TAG_PATTERN.test(String(input));
}

/**
 * Tests if an input string contains suspicious SQL injection keywords
 */
export function containsSqlInjection(input: string | undefined | null): boolean {
  if (!input) return false;
  return SQL_INJECTION_PATTERN.test(String(input));
}

/**
 * Strips all HTML tags and angle brackets from a string
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return String(input)
    .replace(/<[^>]*>/g, '') // remove all HTML tags
    .replace(/[<>]/g, '')    // remove stray angle brackets
    .trim();
}

/**
 * Validates that an input field does not contain HTML tags or SQL injection.
 * Returns an error string if invalid, or null if valid.
 */
export function validateSecureInput(
  value: string,
  fieldName = 'Field'
): string | null {
  if (!value) return null;
  if (containsHtml(value)) {
    return `${fieldName} cannot contain HTML tags or angle brackets (e.g., <h1>, <script>).`;
  }
  if (containsSqlInjection(value)) {
    return `${fieldName} contains invalid characters or query keywords.`;
  }
  return null;
}

/**
 * Sanitize a general text input:
 * - Trims whitespace
 * - Strips null bytes
 * - Strips ALL HTML tags and angle brackets to strictly prevent HTML / XSS injection
 * - Strips dangerous SQL comments and raw quotes
 * - Enforces length bounds
 */
export function sanitizeInput(input: string, maxLength = 255): string {
  if (!input) return '';
  let str = String(input).trim();

  // Strip null bytes
  str = str.replace(/\0/g, '');

  // Strip ALL HTML tags (e.g. <h1>test</h1>, <script>, <b>, etc.)
  str = str.replace(/<[^>]*>/g, '');

  // Strip raw angle brackets (< and >)
  str = str.replace(/[<>]/g, '');

  // Neutralize common SQL comment sequences
  str = str.replace(/--+/g, '-').replace(/\/\*[\s\S]*?\*\//g, '');

  // Neutralize raw single and double quotes that could break SQL/NoSQL boundaries
  str = str.replace(/['";\\]/g, (char) => {
    switch (char) {
      case "'":
        return '’'; // replace with safe typographic apostrophe
      case '"':
        return '”'; // replace with safe typographic quote
      case ';':
        return ' ';
      case '\\':
        return '';
      default:
        return '';
    }
  });

  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Strictly sanitizes an email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  const clean = sanitizeInput(email, 120).toLowerCase();
  // Strip characters outside standard email charset and any angle brackets
  return clean.replace(/[^a-z0-9@._+-]/g, '');
}

/**
 * Strictly sanitizes a phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+()\s-]/g, '').slice(0, 30);
}

/**
 * Sanitizes promo coupon codes (alphanumeric, dashes, underscores only)
 */
export function sanitizeCouponCode(code: string): string {
  if (!code) return '';
  return code.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 20);
}
