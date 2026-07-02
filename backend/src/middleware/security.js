const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();
}

function sanitizeValue(value) {
  if (typeof value === 'string') return stripHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj) {
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    clean[key] = sanitizeValue(value);
  }
  return clean;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
}

function validateEmail(email) {
  return EMAIL_RE.test(email);
}

module.exports = { sanitizeInput, securityHeaders, stripHtml, validateEmail };
