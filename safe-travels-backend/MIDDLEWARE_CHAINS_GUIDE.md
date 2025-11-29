# Understanding Middleware Chains in Express

## 🎯 What is Middleware?

**Middleware** are functions that execute during the request-response cycle. They have access to:
- `req` (request object)
- `res` (response object)
- `next` (function to pass control to the next middleware)

Think of middleware as a **chain of functions** that process requests before they reach your route handlers.

---

## 🔗 What is a Middleware Chain?

A **middleware chain** is the sequence of middleware functions that execute in order for a specific request. Each middleware can:
1. Execute code
2. Modify the request/response
3. End the request-response cycle
4. Call `next()` to pass control to the next middleware

### Visual Representation

```
Request
   ↓
┌─────────────────────┐
│ Middleware 1        │ → next()
└─────────────────────┘
   ↓
┌─────────────────────┐
│ Middleware 2        │ → next()
└─────────────────────┘
   ↓
┌─────────────────────┐
│ Middleware 3        │ → next()
└─────────────────────┘
   ↓
┌─────────────────────┐
│ Route Handler       │ → res.send()
└─────────────────────┘
   ↓
Response
```

---

## 📝 Types of Middleware

### 1. Application-Level Middleware

Applied to **all routes** using `app.use()`:

```javascript
// This runs for EVERY request
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.path);
  next(); // Pass to next middleware
});
```

**Example in our server:**
```javascript
app.use(helmet());        // Security headers for all routes
app.use(cors());          // CORS for all routes
app.use(express.json());  // Parse JSON for all routes
```

### 2. Route-Level Middleware

Applied to **specific routes**:

```javascript
// Only applies to /api/ai-advisor
app.post('/api/ai-advisor', anonymizeRequest, (req, res) => {
  // Route handler
});
```

**Example in our server:**
```javascript
app.post(
  '/api/ai-advisor',
  anonymizeRequest,  // Route-level middleware
  (req, res) => {
    // Handler only runs after anonymizeRequest completes
  }
);
```

### 3. Multiple Middleware on One Route

You can apply **multiple middleware** to a single route:

```javascript
app.post(
  '/api/ai-advisor',
  middleware1,  // Runs first
  middleware2,  // Runs second
  middleware3,  // Runs third
  (req, res) => {
    // Handler runs last
  }
);
```

**Real example:**
```javascript
app.post(
  '/api/check-safety',
  body('latitude').isFloat(),    // Validation middleware 1
  body('longitude').isFloat(),   // Validation middleware 2
  (req, res) => {
    // Handler
  }
);
```

---

## 🔄 How Middleware Chains Work

### Execution Order

Middleware executes in the **order it's defined**:

```javascript
// 1. This runs FIRST (for all requests)
app.use((req, res, next) => {
  console.log('1. First middleware');
  next();
});

// 2. This runs SECOND (for all requests)
app.use((req, res, next) => {
  console.log('2. Second middleware');
  next();
});

// 3. This runs THIRD (only for /api/ai-advisor)
app.post('/api/ai-advisor', (req, res, next) => {
  console.log('3. Route-specific middleware');
  next();
}, (req, res) => {
  console.log('4. Route handler');
  res.json({ message: 'Done' });
});
```

**Output for POST /api/ai-advisor:**
```
1. First middleware
2. Second middleware
3. Route-specific middleware
4. Route handler
```

### The `next()` Function

**`next()`** passes control to the next middleware in the chain:

```javascript
app.use((req, res, next) => {
  // Do something
  console.log('Processing request...');
  
  // Pass to next middleware
  next();
  
  // Code after next() runs AFTER the response is sent
  console.log('Request processed');
});
```

**Without `next()`:** The chain stops, and the request hangs!

```javascript
app.use((req, res, next) => {
  console.log('This runs');
  // Forgot to call next()!
  // Request hangs here forever
});
```

---

## 🎬 Real Example: Our AI Advisor Endpoint

Let's trace through what happens when a request hits `/api/ai-advisor`:

### Step 1: Application-Level Middleware

```javascript
// 1. Helmet - Security headers
app.use(helmet());
// → Adds security headers to response

// 2. CORS - Cross-origin handling
app.use(cors());
// → Adds CORS headers

// 3. Body Parser - Parse JSON
app.use(express.json());
// → Parses JSON body into req.body
```

### Step 2: Route-Specific Middleware

```javascript
app.post('/api/ai-advisor', anonymizeRequest, ...)
// → anonymizeRequest middleware runs
// → Logs BEFORE
// → Replaces emails/phones with [REDACTED_*]
// → Logs AFTER
// → Calls next()
```

### Step 3: Route Handler

```javascript
(req, res) => {
  // Handler receives anonymized req.body
  // Process request
  // Send response
}
```

### Complete Flow

```
POST /api/ai-advisor
{
  "question": "Is Brazil safe?",
  "email": "user@example.com",
  "phone": "123-456-7890"
}

↓
[Helmet Middleware]
→ Adds security headers

↓
[CORS Middleware]
→ Adds CORS headers

↓
[Body Parser Middleware]
→ Parses JSON into req.body
req.body = {
  question: "Is Brazil safe?",
  email: "user@example.com",
  phone: "123-456-7890"
}

↓
[Anonymize Middleware]
→ Logs BEFORE (original data)
→ Replaces email → [REDACTED_EMAIL]
→ Replaces phone → [REDACTED_PHONE]
→ Logs AFTER (anonymized data)
req.body = {
  question: "Is Brazil safe?",
  email: "[REDACTED_EMAIL]",
  phone: "[REDACTED_PHONE]"
}

↓
[Route Handler]
→ Receives anonymized req.body
→ Processes request
→ Sends response
```

---

## 🛠️ Building Custom Middleware

### Basic Middleware Structure

```javascript
const myMiddleware = (req, res, next) => {
  // 1. Do something with req/res
  console.log('Middleware executing');
  
  // 2. Modify req or res if needed
  req.customProperty = 'value';
  
  // 3. Call next() to continue
  next();
  
  // OR end the request
  // res.status(400).json({ error: 'Bad request' });
};
```

### Our Anonymize Middleware

```javascript
const anonymizeRequest = (req, res, next) => {
  // 1. Check if body exists
  if (!req.body) return next();
  
  // 2. Log BEFORE
  console.log('BEFORE:', req.body);
  
  // 3. Anonymize data
  let bodyString = JSON.stringify(req.body);
  bodyString = bodyString.replace(emailRegex, '[REDACTED_EMAIL]');
  bodyString = bodyString.replace(phoneRegex, '[REDACTED_PHONE]');
  req.body = JSON.parse(bodyString);
  
  // 4. Log AFTER
  console.log('AFTER:', req.body);
  
  // 5. Continue to next middleware
  next();
};
```

---

## 🔀 Middleware Execution Patterns

### Pattern 1: Sequential Execution

```javascript
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);

// All run in order for every request
```

### Pattern 2: Conditional Execution

```javascript
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    // Only for API routes
    console.log('API request');
  }
  next();
});
```

### Pattern 3: Early Termination

```javascript
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    // Stop the chain, send error
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Continue if authorized
  next();
});
```

### Pattern 4: Multiple Middleware on Route

```javascript
app.post(
  '/api/endpoint',
  validateInput,      // 1. Validate
  authenticate,       // 2. Authenticate
  authorize,          // 3. Authorize
  processRequest,     // 4. Process
  (req, res) => {     // 5. Respond
    res.json({ success: true });
  }
);
```

---

## 🎯 Common Middleware Patterns

### 1. Logging Middleware

```javascript
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};

app.use(logger);
```

### 2. Authentication Middleware

```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Verify token
  const user = verifyToken(token);
  req.user = user; // Attach user to request
  next();
};

app.use('/api/protected', authenticate);
```

### 3. Error Handling Middleware

```javascript
// Must be last (after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

**Note:** Error middleware has **4 parameters** (err, req, res, next)!

### 4. Request Modification Middleware

```javascript
const addTimestamp = (req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
};

app.use(addTimestamp);
```

---

## 📊 Middleware Chain Visualization

### Our Server's Middleware Chain

```
Request arrives
    ↓
┌─────────────────────────┐
│ Helmet                  │ → Security headers
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ CORS                    │ → CORS headers
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ express.json()         │ → Parse JSON body
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ express.urlencoded()    │ → Parse form data
└─────────────────────────┘
    ↓
    ├─→ GET /health
    │   └─→ Route handler
    │
    ├─→ POST /api/check-safety
    │   ├─→ Validation middleware
    │   └─→ Route handler
    │
    └─→ POST /api/ai-advisor
        ├─→ anonymizeRequest middleware
        └─→ Route handler
    ↓
┌─────────────────────────┐
│ 404 Handler             │ → If no route matches
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Error Handler           │ → If error occurs
└─────────────────────────┘
    ↓
Response sent
```

---

## ⚠️ Common Mistakes

### Mistake 1: Forgetting `next()`

```javascript
// ❌ WRONG - Request hangs
app.use((req, res, next) => {
  console.log('Processing...');
  // Forgot next()!
});

// ✅ CORRECT
app.use((req, res, next) => {
  console.log('Processing...');
  next();
});
```

### Mistake 2: Wrong Middleware Order

```javascript
// ❌ WRONG - Body parser after route
app.post('/api/endpoint', handler);
app.use(express.json()); // Too late!

// ✅ CORRECT - Body parser before routes
app.use(express.json());
app.post('/api/endpoint', handler);
```

### Mistake 3: Not Handling Errors

```javascript
// ❌ WRONG - No error handling
app.post('/api/endpoint', (req, res) => {
  throw new Error('Oops!'); // Crashes server
});

// ✅ CORRECT - Error middleware
app.post('/api/endpoint', (req, res) => {
  throw new Error('Oops!');
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

---

## 🎓 Key Takeaways

1. **Middleware executes in order** - First defined, first executed
2. **Always call `next()`** - Unless you're ending the request
3. **Application-level** - Runs for all routes (`app.use()`)
4. **Route-level** - Runs for specific routes (in route definition)
5. **Error middleware** - Must have 4 parameters and be last
6. **Modify `req`/`res`** - Middleware can add properties to request/response
7. **Chain stops** - If middleware doesn't call `next()` or send response

---

## 🔗 Additional Resources

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Middleware Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Remember:** Middleware chains are like an assembly line - each piece does its job and passes the work to the next! 🔗
