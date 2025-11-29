/**
 * SafeTravels Backend Server
 * 
 * A secure Express.js server for the SafeTravels mobile application.
 * Provides API endpoints for country safety data and news.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { getSafetyInfo } = require('./data/zones');
const { calculatePathRisk } = require('./data/pathfinding');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * Helmet helps secure Express apps by setting various HTTP headers.
 * It's a collection of smaller middleware functions that set security-related HTTP headers.
 * 
 * What it does:
 * - Sets Content-Security-Policy headers to prevent XSS attacks
 * - Sets X-Frame-Options to prevent clickjacking
 * - Removes X-Powered-By header (hides that we're using Express)
 * - Sets X-Content-Type-Options to prevent MIME type sniffing
 * - And many more security headers...
 */
app.use(helmet());

/**
 * CORS (Cross-Origin Resource Sharing) middleware
 * Allows our React Native app (or web frontend) to make requests to this API
 * from different origins (domains/ports).
 * 
 * SECURITY: Never use '*' even in development. Whitelist specific origins.
 */
app.use(cors({
  origin: (origin, callback) => {
    // If ALLOWED_ORIGINS is set, use it
    if (process.env.ALLOWED_ORIGINS) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: Allow common React Native and localhost origins
      const devOrigins = [
        'http://localhost:19006',      // Expo web
        'http://localhost:3000',       // Local dev server
        'http://10.0.2.2:19006',       // Android emulator
        'http://127.0.0.1:19006',      // Localhost alternative
        'exp://localhost:19000',       // Expo dev client
      ];
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || devOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, log but allow (for flexibility)
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️  CORS: Unlisted origin "${origin}" - allowing in development`);
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Body parsing middleware
 * Allows Express to parse JSON request bodies
 * SECURITY: Added size limit to prevent DoS attacks
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL-encoded body parsing middleware
 * Allows Express to parse form data
 * SECURITY: Added size limit to prevent DoS attacks
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Anonymize IP Address
 * 
 * Hashes IP addresses for logging to comply with GDPR and privacy regulations.
 * IPv4 addresses are partially masked, IPv6 addresses are hashed.
 * 
 * @param {string} ip - IP address to anonymize
 * @returns {string} Anonymized IP address
 * 
 * @example
 * anonymizeIP('192.168.1.100') // Returns: '192.168.1.xxx'
 * anonymizeIP('::1') // Returns: 'hashed_ip_abc123'
 */
function anonymizeIP(ip) {
  if (!ip) return 'unknown';
  
  // Handle IPv4 addresses (e.g., 192.168.1.100)
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      // Keep first 3 octets, mask last: 192.168.1.xxx
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  
  // Handle IPv6 addresses (e.g., ::1, 2001:0db8::1)
  if (ip.includes(':')) {
    // Hash IPv6 addresses for privacy
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 8);
    return `ipv6_${hash}`;
  }
  
  // Fallback: hash any other format
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 8);
  return `hashed_${hash}`;
}

/**
 * Sanitize Error Messages
 * 
 * Prevents information disclosure by sanitizing error messages before sending to clients.
 * Internal error details are logged server-side only.
 * 
 * @param {Error} error - The error object
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Safe, user-friendly error message
 * 
 * @example
 * sanitizeErrorMessage(new Error('ENOENT: file not found'), 500)
 * // Returns: 'An internal error occurred. Please try again later.'
 */
function sanitizeErrorMessage(error, statusCode = 500) {
  if (!error || !error.message) {
    return 'An error occurred. Please try again.';
  }

  const message = error.message;

  // Client errors (400-499) are usually safe to show (already validated)
  if (statusCode >= 400 && statusCode < 500) {
    return message;
  }

  // Server errors (500+) should be sanitized
  // Don't expose file paths
  if (message.includes('/') || message.includes('\\')) {
    return 'A file system error occurred. Please contact support.';
  }

  // Don't expose database connection errors
  if (message.includes('ECONNREFUSED') || message.includes('ENOTFOUND') || message.includes('ETIMEDOUT')) {
    return 'Service temporarily unavailable. Please try again later.';
  }

  // Don't expose internal module errors
  if (message.includes('Cannot find module') || message.includes('require(') || message.includes('Module not found')) {
    return 'A configuration error occurred. Please contact support.';
  }

  // Don't expose permission errors
  if (message.includes('EACCES') || message.includes('EPERM')) {
    return 'A permission error occurred. Please contact support.';
  }

  // Generic fallback for server errors
  return 'An internal error occurred. Please try again later. If the problem persists, contact support.';
}

// ============================================
// CUSTOM MIDDLEWARE
// ============================================

/**
 * Anonymize Request Middleware
 * 
 * Strips personal information (emails, phone numbers) from request body
 * before sending data to external AI services. This protects user privacy
 * and ensures compliance with data protection regulations.
 * 
 * This middleware:
 * 1. Logs the original request body (BEFORE anonymization)
 * 2. Finds and replaces email addresses with [REDACTED_EMAIL]
 * 3. Finds and replaces phone numbers with [REDACTED_PHONE]
 * 4. Logs the anonymized request body (AFTER anonymization)
 * 5. Modifies req.body with the anonymized data
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const anonymizeRequest = (req, res, next) => {
  // Only process if there's a request body
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  // Convert body to string for regex processing
  let bodyString = JSON.stringify(req.body);

  // Email regex pattern
  // Matches: user@example.com, user.name@example.co.uk, etc.
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  
  // Phone number regex patterns
  // Matches various formats:
  // - (123) 456-7890
  // - 123-456-7890
  // - 123.456.7890
  // - 1234567890
  // - +1 123 456 7890
  // - +1-123-456-7890
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}/g;

  // Count matches WITHOUT logging actual sensitive data
  const emailMatches = bodyString.match(emailRegex);
  const phoneMatches = bodyString.match(phoneRegex);
  const emailCount = emailMatches ? emailMatches.length : 0;
  const phoneCount = phoneMatches ? phoneMatches.length : 0;

  // Log counts only (never log actual PII)
  if (emailCount > 0 || phoneCount > 0) {
    console.log(`   Found ${emailCount} email(s) and ${phoneCount} phone number(s) - anonymizing`);
  }

  // Replace emails and phone numbers
  if (emailCount > 0) {
    bodyString = bodyString.replace(emailRegex, '[REDACTED_EMAIL]');
  }
  if (phoneCount > 0) {
    bodyString = bodyString.replace(phoneRegex, '[REDACTED_PHONE]');
  }

  // Parse the anonymized string back to object
  try {
    req.body = JSON.parse(bodyString);
    
    // Only log anonymized version in development (safe - no PII)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 AFTER Anonymization:');
      console.log(JSON.stringify(req.body, null, 2));
      console.log(''); // Empty line for readability
    }
  } catch (error) {
    console.error('Error parsing anonymized body:', error);
    // If parsing fails, continue with original body
    return next();
  }

  // Continue to next middleware
  next();
};

/**
 * Rate Limiter for AI Advisor Endpoint
 * 
 * Protects the AI endpoint from abuse and excessive API costs by limiting
 * the number of requests per IP address.
 * 
 * Configuration:
 * - max: 5 requests per window
 * - windowMs: 15 minutes (900,000 milliseconds)
 * - StandardHeaders: true (returns rate limit info in `RateLimit-*` headers)
 * - LegacyHeaders: false (disables `X-RateLimit-*` headers)
 * 
 * When limit is exceeded:
 * - Returns HTTP 429 (Too Many Requests)
 * - Includes retry-after information
 * - Prevents additional requests until window resets
 */
const aiAdvisorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit of 5 requests per 15 minutes. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit of 5 requests per 15 minutes. Please try again later.',
      retryAfter: '15 minutes',
      limit: 5,
      window: '15 minutes'
    });
  }
});

/**
 * General Rate Limiter for API Endpoints
 * 
 * Protects all API endpoints from abuse with a more lenient limit than AI endpoint.
 * 
 * Configuration:
 * - max: 100 requests per window
 * - windowMs: 15 minutes
 * 
 * This is more lenient than the AI limiter since these endpoints are less expensive.
 */
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes (more lenient than AI endpoint)
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: '15 minutes',
      limit: 100,
      window: '15 minutes'
    });
  }
});

/**
 * Request Timeout Middleware
 * 
 * Prevents requests from hanging indefinitely, protecting against DoS attacks.
 * Sets a timeout of 30 seconds for all requests.
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // Set timeout
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'The request took too long to process. Please try again.'
        });
      }
    });
    
    next();
  };
};

// Apply request timeout to all routes
app.use(requestTimeout(30000)); // 30 seconds

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Endpoint
 * GET /health
 * 
 * Simple endpoint to verify the server is running and responsive.
 * Useful for monitoring, load balancers, and deployment checks.
 */
app.get('/health', (req, res) => {
  // SECURITY: Minimal health check - don't expose internal details
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
    // Intentionally NOT exposing: uptime, environment, version, etc.
  });
});

/**
 * Root endpoint
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SafeTravels API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      checkSafety: 'POST /api/check-safety',
      aiAdvisor: 'POST /api/ai-advisor',
      pathRisk: 'POST /api/path-risk',
      logout: 'POST /api/logout'
    }
  });
});

/**
 * Check Safety Endpoint
 * POST /api/check-safety
 * 
 * Validates latitude and longitude coordinates and returns safety information
 * for the nearest safe zone.
 * 
 * Request Body:
 * {
 *   "latitude": 43.6532,
 *   "longitude": -79.3832
 * }
 * 
 * Response:
 * {
 *   "safetyScore": 95,
 *   "safetyLevel": "Safe",
 *   "recommendation": "Generally safe for LGBTQIA+ travelers",
 *   "nearestZone": {
 *     "latitude": 43.6532,
 *     "longitude": -79.3832,
 *     "distance": 0.001
 *   }
 * }
 */
app.post(
  '/api/check-safety',
  generalApiLimiter, // Apply rate limiting
  [
    // Validation middleware: Check latitude
    body('latitude')
      .exists()
      .withMessage('Latitude is required')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be a valid decimal number between -90 and 90'),
    
    // Validation middleware: Check longitude
    body('longitude')
      .exists()
      .withMessage('Longitude is required')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be a valid decimal number between -180 and 180')
  ],
  (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Return 400 Bad Request with specific error messages
      // SECURITY: Don't expose input values in error responses
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
          // Intentionally NOT including: err.value (could be sensitive)
        }))
      });
    }

    // If validation passes, extract the validated data
    const { latitude, longitude } = req.body;

    try {
      // Get safety information for the coordinates
      const safetyInfo = getSafetyInfo(latitude, longitude);

      // Return success response with safety data
      res.status(200).json({
        success: true,
        coordinates: {
          latitude,
          longitude
        },
        ...safetyInfo
      });
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error checking safety:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check safety information'
      });
    }
  }
);

/**
 * AI Advisor Endpoint
 * POST /api/ai-advisor
 * 
 * Provides AI-powered travel advice. Personal information (emails, phone numbers)
 * is automatically anonymized before processing to protect user privacy.
 * 
 * Request Body:
 * {
 *   "question": "Is it safe to travel to Brazil as an LGBTQIA+ person?",
 *   "userEmail": "user@example.com",  // Will be anonymized
 *   "phoneNumber": "123-456-7890",     // Will be anonymized
 *   "destination": "Brazil"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "advice": "Based on safety data, Brazil has varying safety levels...",
 *   "anonymized": true
 * }
 */
app.post(
  '/api/ai-advisor',
  aiAdvisorLimiter, // Apply rate limiting (5 requests per 15 minutes)
  anonymizeRequest, // Apply anonymization middleware
  (req, res) => {
    try {
      const { question, destination } = req.body;

      // Validate required fields
      if (!question) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Question is required'
        });
      }

      // At this point, req.body has been anonymized
      // Personal info like emails and phone numbers are replaced with [REDACTED_EMAIL] and [REDACTED_PHONE]
      
      // Simulate AI processing (in production, this would call an external AI service)
      // Note: The anonymized data is what gets sent to the AI service
      const aiResponse = {
        success: true,
        advice: `Based on the safety data for ${destination || 'your destination'}, here's my advice: ${question}. Always research current local laws and social attitudes before traveling.`,
        anonymized: true,
        timestamp: new Date().toISOString()
      };

      // In a real implementation, you would:
      // 1. Send the anonymized req.body to your AI service (OpenAI, Anthropic, etc.)
      // 2. Process the response
      // 3. Return the result
      
      // Example:
      // const aiServiceResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     model: 'gpt-4',
      //     messages: [{
      //       role: 'user',
      //       content: JSON.stringify(req.body) // Anonymized data
      //     }]
      //   })
      // });

      res.status(200).json(aiResponse);
    } catch (error) {
      console.error('Error in AI advisor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process AI advisor request'
      });
    }
  }
);

/**
 * Safe Pathfinding Endpoint
 * POST /api/path-risk
 * 
 * Calculates the safety score for a route by checking proximity to danger zones.
 * Uses the Haversine formula to calculate distances on Earth's surface.
 * 
 * Request Body:
 * {
 *   "route": [
 *     { "lat": 43.6532, "lon": -79.3832 },
 *     { "lat": 43.6510, "lon": -79.3800 },
 *     { "lat": 43.6488, "lon": -79.3768 }
 *   ],
 *   "dangerThresholdKm": 0.5  // Optional, default: 0.5
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "safetyScore": 85.5,
 *   "safetyLevel": "Safe",
 *   "totalPoints": 3,
 *   "flaggedPoints": [...],
 *   "flaggedCount": 0,
 *   "routeLength": 2.34,
 *   "recommendation": "Route appears safe. Exercise normal caution."
 * }
 */
app.post(
  '/api/path-risk',
  generalApiLimiter, // Apply rate limiting
  [
    // Validate route array
    body('route')
      .exists()
      .withMessage('Route is required')
      .isArray({ min: 1 })
      .withMessage('Route must be a non-empty array'),
    
    // Validate each coordinate in route
    body('route.*.lat')
      .exists()
      .withMessage('Each point must have a latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    
    body('route.*.lon')
      .exists()
      .withMessage('Each point must have a longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    
    // Optional: danger threshold
    body('dangerThresholdKm')
      .optional()
      .isFloat({ min: 0.1, max: 10 })
      .withMessage('Danger threshold must be between 0.1 and 10 km')
  ],
  (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid route data',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
          // Intentionally NOT including: err.value (could be sensitive)
        }))
      });
    }

    try {
      const { route, dangerThresholdKm = 0.5 } = req.body;

      // Calculate path risk using the pathfinding algorithm
      const pathAnalysis = calculatePathRisk(route, dangerThresholdKm);

      res.status(200).json({
        success: true,
        ...pathAnalysis,
        dangerThresholdKm: dangerThresholdKm,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error calculating path risk:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: sanitizeErrorMessage(error, 500)
      });
    }
  }
);

/**
 * Logout Endpoint (Stub)
 * POST /api/logout
 * 
 * Stub endpoint for logout functionality. Currently just acknowledges
 * the logout request. In production, this would:
 * - Invalidate JWT tokens
 * - Clear server-side sessions
 * - Log the logout event
 * - Update user activity records
 * 
 * This endpoint is used by the emergency wipe feature to notify
 * the backend that a user has logged out.
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */
app.post('/api/logout', generalApiLimiter, (req, res) => {
  try {
    // TODO: In production, implement:
    // - Token invalidation
    // - Session clearing
    // - Activity logging
    
    // SECURITY: Anonymize IP address for GDPR compliance
    console.log('Logout request received from IP:', anonymizeIP(req.ip));
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in logout:', error);
    // Even if there's an error, return success (fire and forget)
    res.status(200).json({
      success: true,
      message: 'Logout processed'
    });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

/**
 * 404 Handler - Catch all unmatched routes
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /',
      'POST /api/check-safety',
      'POST /api/ai-advisor',
      'POST /api/path-risk',
      'POST /api/logout'
    ]
  });
});

/**
 * Global Error Handler
 * Catches any errors thrown in route handlers
 * 
 * SECURITY: Never exposes stack traces or internal error details to clients.
 * Uses error IDs for tracking and support.
 */
app.use((err, req, res, next) => {
  // Generate unique error ID for tracking
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Log full error details server-side only (never sent to client)
  // SECURITY: Anonymize IP address for GDPR compliance
  console.error('Error:', {
    errorId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: anonymizeIP(req.ip),  // Anonymized IP
    timestamp: new Date().toISOString()
  });
  
  // Determine safe error message
  const statusCode = err.status || 500;
  
  // Use sanitization function to prevent information disclosure
  const safeMessage = sanitizeErrorMessage(err, statusCode);
  
  // Build response - NEVER include stack traces
  const response = {
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message: safeMessage,
    errorId: errorId  // For support/debugging - users can report with this ID
  };
  
  // In development, can include error type (but NOT stack traces)
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      type: err.name
      // Intentionally NOT including: stack, file paths, internal details
    };
  }
  
  res.status(statusCode).json(response);
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   SafeTravels Backend Server          ║
║   🚀 Server running on port ${PORT}      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}          ║
║   📍 Health check: http://localhost:${PORT}/health ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
