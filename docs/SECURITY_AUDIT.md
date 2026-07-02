# Security Audit — SERVICE SHELF

**Week:** 9 — Performance, Testing & Security  
**Date:** June 2026  
**Auditor:** Development Team (automated + manual review)

---

## 1. Audit Scope

| Area | Components Reviewed |
|---|---|
| Authentication | JWT login/register, token validation, role checks |
| API Security | CORS, rate limiting, input sanitization, headers |
| Frontend | XSS prevention, protected routes, token storage |
| Database | SQL injection, password hashing, data exposure |
| Infrastructure | Error handling, env secrets, request size limits |

---

## 2. Findings & Fixes

### CRITICAL — Fixed ✅

| # | Finding | Risk | Fix Applied |
|---|---|---|---|
| C1 | No rate limiting on auth endpoints | Brute-force attacks on login/register | `express-rate-limit`: 20 req/15min on `/api/auth` |
| C2 | JWT accepted any algorithm | Algorithm confusion attack | Explicit `algorithms: ['HS256']` in verify |
| C3 | No input sanitization | Stored XSS via user profile/booking notes | `sanitizeInput` middleware strips HTML tags |

### HIGH — Fixed ✅

| # | Finding | Risk | Fix Applied |
|---|---|---|---|
| H1 | CORS allowed any origin reflection | CSRF / data theft from malicious sites | Strict origin whitelist callback |
| H2 | No security response headers | Clickjacking, MIME sniffing | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection` |
| H3 | JWT payload not validated | Forged tokens with missing fields | Validate `id`, `email`, `role` in payload |
| H4 | No payment rate limiting | Payment endpoint abuse | 10 req/min limit on `/api/payments` |
| H5 | Passwords returned in API responses | Credential leakage | Password stripped before response (existing, verified) |

### MEDIUM — Fixed ✅

| # | Finding | Risk | Fix Applied |
|---|---|---|---|
| M1 | No global rate limit | DoS on API | 200 req/15min global limiter |
| M2 | Large JSON payloads possible | DoS via body size | `express.json({ limit: '10kb' })` |
| M3 | Email format not validated | Invalid data / enumeration | `validateEmail()` regex on register |
| M4 | `X-Powered-By` header exposed | Server fingerprinting | Header removed |
| M5 | Expired tokens generic error | Poor UX / security ambiguity | Specific "Token expired" message |

### LOW — Addressed ✅

| # | Finding | Risk | Fix Applied |
|---|---|---|---|
| L1 | No Referrer-Policy header | Information leakage | `strict-origin-when-cross-origin` |
| L2 | Frontend no HTML escape utility | Potential XSS in future features | `escapeHtml()` utility + tests |
| L3 | SQLite dynamic SQL in search | SQL injection risk | Parameterized prepared statements only |

---

## 3. Security Controls Summary

### Authentication & Authorization

```
✅ bcrypt password hashing (cost factor 10)
✅ JWT with 7-day expiry, HS256 only
✅ Bearer token validation on protected routes
✅ Role-based access control (customer / admin)
✅ Admin routes require admin role middleware
✅ Token payload validation (id, email, role)
```

### API Protection

```
✅ CORS — whitelist single frontend origin
✅ Rate limiting — global (200/15min), auth (20/15min), payments (10/min)
✅ Input sanitization — HTML tag stripping on body/query
✅ Request size limit — 10KB JSON max
✅ Security headers — X-Frame-Options, X-Content-Type-Options, etc.
✅ Error handling — no stack traces exposed to client
✅ Compression — gzip via compression middleware
```

### Frontend Protection

```
✅ React auto-escaping of JSX output
✅ escapeHtml() utility for dynamic HTML (tested)
✅ ProtectedRoute component — auth + admin guards
✅ Token stored in localStorage (acceptable for demo; use httpOnly cookies in production)
✅ No dangerouslySetInnerHTML usage
```

### Database Security

```
✅ Parameterized queries (better-sqlite3 .prepare())
✅ Foreign key constraints enabled
✅ No raw SQL string concatenation with user input
✅ Passwords never returned in SELECT queries for API
```

---

## 4. Test Coverage for Security

| Test | File | Status |
|---|---|---|
| Rejects unauthenticated requests | `security.test.js` | ✅ |
| Rejects invalid JWT | `security.test.js` | ✅ |
| Rejects expired JWT | `security.test.js` | ✅ |
| Sanitizes XSS in registration | `security.test.js` | ✅ |
| Blocks non-admin from admin routes | `security.test.js` | ✅ |
| Sets security headers | `security.test.js` | ✅ |
| stripHtml removes script tags | `security-utils.test.js` | ✅ |
| validateEmail rejects invalid | `security-utils.test.js` | ✅ |
| escapeHtml prevents XSS (frontend) | `sanitize.test.js` | ✅ |

---

## 5. Remaining Recommendations (Production)

| Priority | Recommendation |
|---|---|
| HIGH | Use `httpOnly` + `Secure` cookies instead of localStorage for JWT |
| HIGH | Add `helmet` package for comprehensive security headers |
| HIGH | Rotate `JWT_SECRET` via environment/secrets manager |
| MEDIUM | Implement refresh token rotation |
| MEDIUM | Add CSRF protection if using cookie-based auth |
| MEDIUM | Enable HTTPS only in production |
| LOW | Add account lockout after N failed login attempts |
| LOW | Implement request logging and anomaly detection |

---

## 6. Environment Security

```env
# Required — never commit to git
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=http://localhost:5173

# .gitignore excludes:
# - .env
# - *.db (database files)
# - node_modules/
```

---

## 7. Conclusion

All **critical** and **high** severity findings from the Week 9 audit have been remediated. The platform now implements industry-standard security controls appropriate for a development/demo deployment. Production deployment should address the remaining recommendations in Section 5.

**Audit Status: PASSED** ✅ (with production recommendations noted)
