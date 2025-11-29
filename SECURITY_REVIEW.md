# Security Review: SafeTravels Backend & Frontend API

**Reviewer:** Lead Security Researcher  
**Date:** 2025-01-27  
**Scope:** `server.js` and `services/api.js`  
**Framework:** OWASP Top 10 2021

---

## 🔍 Executive Summary

This security review identified **7 critical vulnerabilities** and **5 medium-risk issues** across the backend and frontend API code. The application has good foundational security practices (Helmet, rate limiting, input validation) but requires improvements in error handling, logging, and configuration.

**Risk Level:** ⚠️ **MEDIUM-HIGH**

---

## 🚨 Critical Vulnerabilities (OWASP Top 10)

### 1. **A09:2021 – Security Logging and Monitoring Failures**

#### Issue: Sensitive Data in Console Logs

**Location:** `server.js` lines 97-98, 117, 124

```javascript
// ❌ VULNERABLE: Logging sensitive data before anonymization
console.log('\n📋 BEFORE Anonymization:');
console.log(JSON.stringify(originalBody, null, 2));  // Contains emails, phone numbers!
console.log(`   Found ${emailMatches.length} email address(es):`, emailMatches);  // Logs actual emails!
console.log(`   Found ${phoneMatches.length} phone number(s):`, phoneMatches);  // Logs actual phone numbers!
```

**Risk:**
- **HIGH** - Personal Identifiable Information (PII) logged to console
- Console logs may be accessible to:
  - Server administrators
  - Log aggregation services
  - Anyone with server access
  - Log files on disk

**Impact:**
- GDPR/CCPA violations
- Data breach if logs are compromised
- Privacy violations

**Recommendation:**
```javascript
// ✅ SECURE: Only log after anonymization
const anonymizeRequest = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  const originalBody = JSON.parse(JSON.stringify(req.body));
  let bodyString = JSON.stringify(req.body);

  // Don't log original body with sensitive data!
  // Only log anonymized version
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}/g;

  // Count matches without logging actual values
  const emailCount = (bodyString.match(emailRegex) || []).length;
  const phoneCount = (bodyString.match(phoneRegex) || []).length;
  
  if (emailCount > 0 || phoneCount > 0) {
    console.log(`   Found ${emailCount} email(s) and ${phoneCount} phone number(s) - anonymized`);
  }

  bodyString = bodyString.replace(emailRegex, '[REDACTED_EMAIL]');
  bodyString = bodyString.replace(phoneRegex, '[REDACTED_PHONE]');

  try {
    req.body = JSON.parse(bodyString);
    // Only log anonymized version
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 AFTER Anonymization:');
      console.log(JSON.stringify(req.body, null, 2));
    }
  } catch (error) {
    console.error('Error parsing anonymized body:', error);
    return next();
  }

  next();
};
```

---

### 2. **A05:2021 – Security Misconfiguration**

#### Issue: CORS Allows All Origins in Development

**Location:** `server.js` line 46

```javascript
// ❌ VULNERABLE: Allows all origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',  // '*' allows ANY origin!
  credentials: true
}));
```

**Risk:**
- **MEDIUM** - In development, allows requests from any origin
- Could be exploited if deployed to staging with this config

**Recommendation:**
```javascript
// ✅ SECURE: Restrict origins even in development
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || (process.env.NODE_ENV === 'production' 
    ? []  // Fail closed in production
    : ['http://localhost:19006', 'http://10.0.2.2:19006']),  // Specific dev origins
  credentials: true
}));
```

---

### 3. **A03:2021 – Injection**

#### Issue: Error Messages Expose Stack Traces

**Location:** `server.js` lines 558-567

```javascript
// ❌ VULNERABLE: Exposes stack traces in development
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,  // Exposes error details
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })  // Exposes stack trace!
  });
});
```

**Risk:**
- **HIGH** - Stack traces reveal:
  - File paths and directory structure
  - Internal function names
  - Database queries (if any)
  - API keys (if accidentally logged)
  - Application architecture

**Impact:**
- Information disclosure
- Easier exploitation of other vulnerabilities
- Helps attackers understand codebase

**Recommendation:**
```javascript
// ✅ SECURE: Never expose stack traces to clients
app.use((err, req, res, next) => {
  // Log full error details server-side only
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Determine if error should be exposed
  const isClientError = err.status >= 400 && err.status < 500;
  const safeMessage = isClientError 
    ? err.message  // Client errors (400-499) are usually safe to show
    : 'An error occurred. Please try again later.';  // Server errors are not
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: safeMessage,
    // NEVER expose stack traces, even in development
    // Use error IDs for tracking instead
    errorId: generateErrorId()  // For support/debugging
  });
});

function generateErrorId() {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

### 4. **A07:2021 – Identification and Authentication Failures**

#### Issue: No Authentication/Authorization

**Location:** All endpoints

**Risk:**
- **HIGH** - All endpoints are publicly accessible
- No user identification
- No access control

**Current State:**
- No JWT tokens
- No session management
- No user authentication
- All endpoints accessible to anyone

**Recommendation:**
- Implement JWT-based authentication
- Add middleware to protect sensitive endpoints
- Implement role-based access control (RBAC)

---

### 5. **A05:2021 – Security Misconfiguration**

#### Issue: Health Endpoint Exposes Environment Info

**Location:** `server.js` lines 196-204

```javascript
// ❌ VULNERABLE: Exposes internal information
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'SafeTravels API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),  // Reveals server uptime
    environment: process.env.NODE_ENV || 'development'  // Reveals environment
  });
});
```

**Risk:**
- **LOW-MEDIUM** - Information disclosure
- Uptime can reveal server restart patterns
- Environment info can help attackers

**Recommendation:**
```javascript
// ✅ SECURE: Minimal health check response
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
    // Don't expose uptime, environment, or other internal details
  });
});
```

---

### 6. **A05:2021 – Security Misconfiguration**

#### Issue: No Request Size Limits

**Location:** `server.js` lines 54, 60

```javascript
// ❌ VULNERABLE: No size limits on request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Risk:**
- **MEDIUM** - Denial of Service (DoS) vulnerability
- Attackers can send huge payloads
- Can exhaust server memory

**Recommendation:**
```javascript
// ✅ SECURE: Add size limits
app.use(express.json({ limit: '10mb' }));  // Reasonable limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

### 7. **A03:2021 – Injection**

#### Issue: Error Messages May Leak Information

**Location:** `server.js` lines 482, 301-305

```javascript
// ❌ VULNERABLE: Error message might leak internal details
res.status(500).json({
  error: 'Internal Server Error',
  message: error.message || 'Failed to calculate path risk'  // Could expose internal errors
});
```

**Risk:**
- **MEDIUM** - Error messages might reveal:
  - Database errors
  - File system paths
  - Internal function names

**Recommendation:**
```javascript
// ✅ SECURE: Sanitize error messages
const sanitizeErrorMessage = (error) => {
  // Only expose safe, user-friendly messages
  if (error.message.includes('ENOENT')) {
    return 'Resource not found';
  }
  if (error.message.includes('ECONNREFUSED')) {
    return 'Service temporarily unavailable';
  }
  // Generic fallback
  return 'An error occurred. Please try again.';
};

// Usage:
res.status(500).json({
  error: 'Internal Server Error',
  message: sanitizeErrorMessage(error)
});
```

---

## ⚠️ Medium-Risk Issues

### 8. **Missing Request Timeout**

**Issue:** No timeout configuration for requests  
**Risk:** DoS vulnerability  
**Recommendation:** Add request timeout middleware

### 9. **No Rate Limiting on Other Endpoints**

**Issue:** Only AI endpoint has rate limiting  
**Risk:** Other endpoints vulnerable to abuse  
**Recommendation:** Add rate limiting to all endpoints

### 10. **IP Address Logging**

**Location:** `server.js` line 515

```javascript
console.log('Logout request received from IP:', req.ip);
```

**Risk:** GDPR concerns if IPs are considered PII  
**Recommendation:** Hash or anonymize IP addresses

### 11. **No HTTPS Enforcement**

**Issue:** No HTTPS redirect or enforcement  
**Risk:** Man-in-the-middle attacks  
**Recommendation:** Add HTTPS enforcement in production

### 12. **Validation Error Details**

**Location:** `server.js` lines 275-279

```javascript
details: errors.array().map(err => ({
  field: err.path,
  message: err.msg,
  value: err.value  // Exposes user input
}))
```

**Risk:** Could expose sensitive input  
**Recommendation:** Don't return input values in error responses

---

## 📊 OWASP Top 10 Mapping

| OWASP Category | Status | Severity |
|---------------|--------|----------|
| A01: Broken Access Control | ⚠️ No authentication | HIGH |
| A02: Cryptographic Failures | ✅ Using SecureStore | LOW |
| A03: Injection | ⚠️ Error message leaks | MEDIUM |
| A04: Insecure Design | ✅ Good design patterns | LOW |
| A05: Security Misconfiguration | ⚠️ Multiple issues | MEDIUM |
| A06: Vulnerable Components | ✅ Dependencies up to date | LOW |
| A07: Auth Failures | ⚠️ No authentication | HIGH |
| A08: Data Integrity | ✅ Input validation | LOW |
| A09: Logging Failures | ⚠️ Sensitive data logged | HIGH |
| A10: SSRF | ✅ No external requests | LOW |

---

## 🔧 Recommended Improvements

### Priority 1: Critical (Fix Immediately)

1. **Remove sensitive data from console logs**
   - Don't log emails/phone numbers before anonymization
   - Only log anonymized data

2. **Improve error handling**
   - Never expose stack traces to clients
   - Use error IDs for tracking
   - Sanitize error messages

3. **Add request size limits**
   - Prevent DoS attacks
   - Limit JSON and URL-encoded bodies

### Priority 2: High (Fix Soon)

4. **Implement authentication**
   - JWT-based auth
   - Protect sensitive endpoints
   - Session management

5. **Restrict CORS origins**
   - Don't use '*' even in development
   - Whitelist specific origins

6. **Add rate limiting to all endpoints**
   - Not just AI endpoint
   - Different limits for different endpoints

### Priority 3: Medium (Fix When Possible)

7. **Minimize health endpoint info**
   - Don't expose environment/uptime

8. **Add request timeouts**
   - Prevent hanging requests

9. **Anonymize IP addresses in logs**
   - GDPR compliance

---

## 📝 Console.log Security Audit

### Sensitive Data Found in Logs

| Line | File | Issue | Severity |
|------|------|-------|----------|
| 97-98 | server.js | Logs original body with PII | 🔴 CRITICAL |
| 117 | server.js | Logs actual email addresses | 🔴 CRITICAL |
| 124 | server.js | Logs actual phone numbers | 🔴 CRITICAL |
| 515 | server.js | Logs IP addresses | 🟡 MEDIUM |
| 176-179 | api.js | Logs API configuration | 🟢 LOW (dev only) |

### Recommendations

1. **Remove PII from logs** - Never log emails, phone numbers, or other PII
2. **Use structured logging** - Use a logging library (Winston, Pino)
3. **Log levels** - Use different log levels (info, warn, error)
4. **Log sanitization** - Automatically redact sensitive fields
5. **Production logging** - Different logging strategy for production

---

## 🛡️ Error Handling Improvement

### Current Implementation (Vulnerable)

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })  // ❌ EXPOSES STACK
  });
});
```

### Improved Implementation (Secure)

```javascript
/**
 * Secure Error Handler
 * 
 * Never exposes stack traces or internal error details to clients.
 * Uses error IDs for tracking and support.
 */
app.use((err, req, res, next) => {
  // Generate unique error ID for tracking
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Log full error details server-side only
  console.error('Error:', {
    errorId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  
  // Determine safe error message
  const statusCode = err.status || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  
  // Client errors (400-499) can show specific messages
  // Server errors (500+) should be generic
  const safeMessage = isClientError 
    ? err.message 
    : 'An error occurred. Please try again later. If the problem persists, contact support with error ID.';
  
  // Build response
  const response = {
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message: safeMessage,
    errorId: errorId  // For support/debugging
  };
  
  // In development, can include more details (but NOT stack traces)
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      // Only include safe debug info
      type: err.name,
      // Don't include: stack, file paths, internal details
    };
  }
  
  res.status(statusCode).json(response);
});
```

### Key Improvements

1. ✅ **Never expose stack traces** - Even in development
2. ✅ **Error IDs for tracking** - Users can report with error ID
3. ✅ **Sanitized messages** - Only safe, user-friendly messages
4. ✅ **Structured logging** - Full details logged server-side only
5. ✅ **Client vs Server errors** - Different handling for 4xx vs 5xx

---

## 🎓 Separation of Concerns: Client vs Server

### What is Separation of Concerns?

**Separation of Concerns** is a design principle that separates different responsibilities into distinct layers. In client-server architecture, this means:

- **Client (Frontend/App)** - Handles UI, user interaction, presentation
- **Server (Backend/API)** - Handles business logic, data processing, security

### What We've Learned

#### 1. **Client Responsibilities (Frontend)**

**What the client SHOULD do:**
- ✅ Display data to users
- ✅ Handle user input and interactions
- ✅ Format and present information
- ✅ Client-side validation (for UX)
- ✅ Manage UI state
- ✅ Handle navigation

**What the client SHOULD NOT do:**
- ❌ Make security decisions
- ❌ Trust client-side validation alone
- ❌ Store sensitive data insecurely
- ❌ Expose business logic
- ❌ Make direct database calls

**Example from our code:**
```javascript
// ✅ GOOD: Client handles UI and calls API
const handleLogin = async (username, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  // Handle response, update UI
};

// ❌ BAD: Client making security decisions
if (user.role === 'admin') {
  // Don't trust client-side role checks!
}
```

#### 2. **Server Responsibilities (Backend)**

**What the server SHOULD do:**
- ✅ Validate ALL input (never trust client)
- ✅ Enforce security policies
- ✅ Process business logic
- ✅ Access databases
- ✅ Handle authentication/authorization
- ✅ Rate limiting and abuse prevention
- ✅ Data sanitization and anonymization

**What the server SHOULD NOT do:**
- ❌ Return sensitive data unnecessarily
- ❌ Expose internal errors (stack traces)
- ❌ Trust client-provided security tokens
- ❌ Skip validation because "client already validated"

**Example from our code:**
```javascript
// ✅ GOOD: Server validates everything
app.post('/api/check-safety', [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 })
], (req, res) => {
  // Process validated data
});

// ❌ BAD: Server trusting client
app.post('/api/check-safety', (req, res) => {
  const { latitude, longitude } = req.body;
  // No validation - trusting client!
});
```

#### 3. **Key Principles We've Applied**

**A. Never Trust the Client**
```javascript
// Client-side validation (for UX)
if (!username || !password) {
  alert('Please fill all fields');
  return;
}

// Server-side validation (for security) - REQUIRED
app.post('/api/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], handler);
```

**B. Client Handles Presentation, Server Handles Logic**
```javascript
// Client: Formats and displays
<Text style={styles.safetyScore}>{safetyScore}</Text>

// Server: Calculates and validates
const safetyScore = calculatePathRisk(route);
```

**C. Sensitive Operations on Server**
```javascript
// Client: Sends request
await emergencyLogout();

// Server: Handles secure operations
app.post('/api/logout', (req, res) => {
  // Invalidate tokens, clear sessions, etc.
});
```

**D. Error Handling Separation**
```javascript
// Client: Shows user-friendly messages
catch (error) {
  Alert.alert('Error', 'Unable to connect to server');
}

// Server: Logs detailed errors (not exposed to client)
catch (error) {
  console.error('Detailed error:', error.stack);
  res.json({ error: 'An error occurred' }); // Generic message
}
```

#### 4. **Benefits of Separation**

✅ **Security** - Server enforces all security policies  
✅ **Maintainability** - Changes to logic don't affect UI  
✅ **Scalability** - Can scale client and server independently  
✅ **Reusability** - Same API can serve web, mobile, desktop  
✅ **Testability** - Can test client and server separately  

#### 5. **What We've Built**

**Client (React Native App):**
- `services/api.js` - API communication layer
- `components/*` - UI components
- `utils/secureStorage.js` - Secure local storage
- Handles: UI, user interaction, API calls

**Server (Node.js/Express):**
- `server.js` - API endpoints and middleware
- `data/*` - Business logic and data processing
- Handles: Validation, security, rate limiting, anonymization

**Clear Boundaries:**
- Client never makes security decisions
- Server never trusts client input
- Each layer has distinct responsibilities

---

## 📋 Summary

### Security Vulnerabilities Found: 7 Critical, 5 Medium

**Most Critical:**
1. Sensitive data in console logs (PII exposure)
2. Stack traces exposed to clients (information disclosure)
3. No authentication (all endpoints public)

### Key Takeaways

1. **Never log sensitive data** - Emails, phone numbers, passwords
2. **Never expose stack traces** - Use error IDs instead
3. **Always validate on server** - Never trust client
4. **Separate concerns** - Client = UI, Server = Logic + Security
5. **Defense in depth** - Multiple layers of security

### Next Steps

1. Fix console.log statements (remove PII)
2. Improve error handler (no stack traces)
3. Add request size limits
4. Implement authentication
5. Restrict CORS origins

---

**Remember:** Security is not a feature, it's a requirement. Every line of code is a potential vulnerability. Always think like an attacker! 🛡️
