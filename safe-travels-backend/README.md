# SafeTravels Backend API

A secure, production-ready Express.js backend server for the SafeTravels mobile application.

## 🏗️ Architecture Overview

This backend follows industry best practices for security, scalability, and maintainability.

## 📦 Dependencies

- **express**: Fast, unopinionated web framework for Node.js
- **helmet**: Security middleware that sets various HTTP headers
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Loads environment variables from `.env` file
- **express-validator**: Input validation and sanitization middleware

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=*
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 4. Test the Server

Open your browser or use curl:

```bash
# Health check endpoint
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/
```

You should see JSON responses indicating the server is running.

## 📚 Understanding Middleware in Express

### What is Middleware?

**Middleware** are functions that execute during the request-response cycle. They have access to:
- The request object (`req`)
- The response object (`res`)
- The `next` function (to pass control to the next middleware)

Think of middleware as a **chain of functions** that process requests before they reach your route handlers.

### How Middleware Works

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route Handler → Response
```

Each middleware can:
1. **Execute code** (log requests, parse data, etc.)
2. **Modify the request/response** (add headers, parse body, etc.)
3. **End the request-response cycle** (send a response)
4. **Call `next()`** to pass control to the next middleware

### Example Middleware Flow

```javascript
// Middleware 1: Logs every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Pass to next middleware
});

// Middleware 2: Parses JSON body
app.use(express.json());

// Route Handler: Processes the actual request
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
```

### Types of Middleware

1. **Application-level middleware**: Applied to all routes
   ```javascript
   app.use(helmet());
   ```

2. **Route-level middleware**: Applied to specific routes
   ```javascript
   app.get('/protected', authMiddleware, (req, res) => {
     // Only runs if authMiddleware passes
   });
   ```

3. **Error-handling middleware**: Catches errors
   ```javascript
   app.use((err, req, res, next) => {
     // Handle errors
   });
   ```

## 🔒 Security: Why We Use Helmet

### What is Helmet?

**Helmet** is a collection of 15+ smaller middleware functions that set security-related HTTP headers. It's like a "security helmet" for your Express app!

### Why Do We Need It?

By default, Express doesn't set many security headers, leaving your app vulnerable to common attacks. Helmet helps protect against:

#### 1. **Cross-Site Scripting (XSS) Attacks**
```javascript
// Helmet sets Content-Security-Policy header
// Prevents malicious scripts from executing
```

#### 2. **Clickjacking**
```javascript
// Sets X-Frame-Options: DENY
// Prevents your site from being embedded in iframes
```

#### 3. **MIME Type Sniffing**
```javascript
// Sets X-Content-Type-Options: nosniff
// Prevents browsers from guessing content types
```

#### 4. **Information Disclosure**
```javascript
// Removes X-Powered-By header
// Hides that you're using Express (security through obscurity)
```

#### 5. **HTTPS Enforcement** (in production)
```javascript
// Sets Strict-Transport-Security
// Forces browsers to use HTTPS
```

### Helmet in Action

```javascript
// Without Helmet
app.get('/data', (req, res) => {
  res.json({ data: 'sensitive info' });
});
// Response headers: X-Powered-By: Express

// With Helmet
app.use(helmet());
app.get('/data', (req, res) => {
  res.json({ data: 'sensitive info' });
});
// Response headers:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Content-Security-Policy: default-src 'self'
// - (X-Powered-By removed)
```

### Customizing Helmet

You can configure Helmet for your specific needs:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable if needed
}));
```

## 🌐 CORS Explained

**CORS (Cross-Origin Resource Sharing)** allows your React Native app to make requests to this API from different origins.

### Why We Need CORS

- Your React Native app runs on a different origin than your API
- Browsers block cross-origin requests by default (same-origin policy)
- CORS headers tell the browser: "It's okay to allow this request"

### Current Configuration

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

**⚠️ Security Note**: Using `'*'` allows ALL origins. In production, specify exact origins:

```javascript
origin: ['https://safetravels.app', 'https://www.safetravels.app']
```

## ✅ Input Validation with express-validator

### Why Server-Side Validation is Critical

**Never trust client-side validation alone!** Even if your React Native app validates inputs, you **must** validate on the server because:

1. **Client validation can be bypassed** - Users can send requests directly to your API
2. **Protects against malicious input** - Prevents injection attacks and data corruption
3. **Ensures data integrity** - Guarantees only valid data reaches your business logic
4. **Multiple client support** - Your API might be used by web apps, third-party integrations, etc.

### How We Use express-validator

We use express-validator as middleware to validate request data before it reaches our route handlers:

```javascript
[
  body('latitude')
    .exists()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .exists()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
]
```

**Learn More:** See [VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md) for a comprehensive explanation of why server-side validation is critical.

## 📍 API Endpoints

### `GET /health`
Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "status": "healthy",
  "message": "SafeTravels API is running",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### `GET /`
Root endpoint with API information.

**Response:**
```json
{
  "message": "Welcome to SafeTravels API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "checkSafety": "POST /api/check-safety"
  }
}
```

### `POST /api/check-safety`
Check safety information for a given location using latitude and longitude coordinates.

**Request Body:**
```json
{
  "latitude": 43.6532,
  "longitude": -79.3832
}
```

**Success Response (200):**
```json
{
  "success": true,
  "coordinates": {
    "latitude": 43.6532,
    "longitude": -79.3832
  },
  "safetyScore": 95,
  "safetyLevel": "Safe",
  "recommendation": "Generally safe for LGBTQIA+ travelers",
  "nearestZone": {
    "latitude": 43.6532,
    "longitude": -79.3832,
    "distance": 0.001
  }
}
```

**Validation Error Response (400):**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "latitude",
      "message": "Latitude must be a valid decimal number between -90 and 90",
      "value": 999
    }
  ]
}
```

**Validation Rules:**
- `latitude`: Required, must be a float between -90 and 90
- `longitude`: Required, must be a float between -180 and 180

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/check-safety \
  -H "Content-Type: application/json" \
  -d '{"latitude": 43.6532, "longitude": -79.3832}'
```

## 🏃 Running the Server Locally

### Method 1: Using npm scripts (Recommended)

```bash
# Development mode (auto-reloads on file changes)
npm run dev

# Production mode
npm start
```

### Method 2: Direct Node.js

```bash
# Make sure .env file exists first
node server.js
```

### Method 3: With nodemon (if installed globally)

```bash
nodemon server.js
```

### Verifying It's Running

1. **Check the console output:**
   ```
   ╔════════════════════════════════════════╗
   ║   SafeTravels Backend Server          ║
   ║   🚀 Server running on port 3000      ║
   ║   🌍 Environment: development         ║
   ║   📍 Health check: http://localhost:3000/health ║
   ╚════════════════════════════════════════╝
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Or open in browser:**
   - http://localhost:3000/health
   - http://localhost:3000/

## 🛠️ Project Structure

```
safe-travels-backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .env                   # Your local environment variables (not in git)
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── VALIDATION_GUIDE.md   # Comprehensive guide on input validation
└── data/
    └── zones.js           # Mock database of safe zones
```

## 🔐 Security Best Practices

1. ✅ **Helmet** - Security headers configured
2. ✅ **CORS** - Configured (update for production)
3. ✅ **Environment variables** - Sensitive data in `.env`
4. ✅ **Error handling** - Global error handler in place
5. ✅ **Input validation** - express-validator implemented
6. ✅ **Rate limiting** - express-rate-limit implemented (AI endpoint)
7. ⏳ **Authentication** - To be added
8. ⏳ **HTTPS** - Required in production

## 🚧 Next Steps

- [ ] Add database connection (PostgreSQL/MongoDB)
- [ ] Implement authentication (JWT)
- [x] Add rate limiting (✅ Completed for AI endpoint)
- [ ] Create country data endpoints
- [ ] Add news API integration
- [ ] Implement input validation
- [ ] Add logging (Winston/Morgan)
- [ ] Set up testing (Jest)
- [ ] Add API documentation (Swagger)

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Helmet Documentation](https://helmetjs.github.io/)
- [CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See main project README for details.
