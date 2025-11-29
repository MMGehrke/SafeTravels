/**
 * SafeTravels API Service
 * 
 * Handles all API communication between the React Native app and the backend server.
 * Includes proper localhost handling for different platforms.
 */

import { Platform } from 'react-native';

// ============================================
// API CONFIGURATION
// ============================================

/**
 * Get the base URL for API requests based on the platform
 * 
 * React Native Localhost Handling:
 * - iOS Simulator: Uses 'localhost' or '127.0.0.1'
 * - Android Emulator: Uses '10.0.2.2' (special IP that maps to host machine's localhost)
 * - Physical Devices: Use your computer's IP address (e.g., '192.168.1.100')
 * 
 * Production: Replace with your actual API URL
 */
const getBaseURL = () => {
  // For production, use your actual API URL
  if (__DEV__ === false) {
    return 'https://api.safetravels.app'; // Replace with your production URL
  }

  // Development mode - handle localhost based on platform
  const PORT = 3000; // Match your backend server port
  
  if (Platform.OS === 'android') {
    // Android Emulator uses 10.0.2.2 to access host machine's localhost
    return `http://10.0.2.2:${PORT}`;
  } else {
    // iOS Simulator and physical iOS devices
    return `http://localhost:${PORT}`;
  }
};

// Base URL constant
export const API_BASE_URL = getBaseURL();

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Generic API request function
 * Handles errors and provides consistent response format
 * 
 * @param {string} endpoint - API endpoint (e.g., '/health')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} Response data or throws error
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Merge default options with provided options
  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Add body if provided (and not GET request)
  if (options.body && requestOptions.method !== 'GET') {
    requestOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, requestOptions);
    
    // Parse JSON response
    const data = await response.json();
    
    // Check if response is ok (status 200-299)
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error.message.includes('Network request failed')) {
      throw new Error('Unable to connect to server. Make sure the backend is running.');
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Check server health status
 * GET /health
 * 
 * @returns {Promise<Object>} Server health information
 * @throws {Error} If server is unreachable or returns error
 */
export const checkServerHealth = async () => {
  try {
    const response = await apiRequest('/health');
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check safety for coordinates
 * POST /api/check-safety
 * 
 * @param {number} latitude - Latitude coordinate (-90 to 90)
 * @param {number} longitude - Longitude coordinate (-180 to 180)
 * @returns {Promise<Object>} Safety information
 * @throws {Error} If validation fails or server error
 */
export const checkSafety = async (latitude, longitude) => {
  return apiRequest('/api/check-safety', {
    method: 'POST',
    body: {
      latitude,
      longitude,
    },
  });
};

/**
 * Check path risk for a route
 * POST /api/path-risk
 * 
 * @param {Array<{lat: number, lon: number}>} route - Array of coordinate objects
 * @param {number} dangerThresholdKm - Optional distance threshold in kilometers (default: 0.5)
 * @returns {Promise<Object>} Path risk analysis with safety score
 * @throws {Error} If validation fails or server error
 */
export const checkPathRisk = async (route, dangerThresholdKm = 0.5) => {
  return apiRequest('/api/path-risk', {
    method: 'POST',
    body: {
      route,
      dangerThresholdKm,
    },
  });
};

// ============================================
// DEBUG HELPERS
// ============================================

/**
 * Log current API configuration (for debugging)
 */
export const logApiConfig = () => {
  console.log('📡 API Configuration:');
  console.log(`   Platform: ${Platform.OS}`);
  console.log(`   Base URL: ${API_BASE_URL}`);
  console.log(`   Environment: ${__DEV__ ? 'Development' : 'Production'}`);
};

/**
 * Emergency Logout (Fire and Forget)
 * POST /api/logout
 * 
 * Sends a logout request to the backend without waiting for a response.
 * This is used for emergency wipe scenarios where we want to notify the
 * backend but don't want to block the user experience.
 * 
 * @returns {Promise<void>} Does not wait for response
 */
export const emergencyLogout = async () => {
  try {
    // Fire and forget - we don't await or handle errors
    // This ensures the request is sent but doesn't block execution
    fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't wait for response - fire and forget
    }).catch(() => {
      // Silently ignore errors - this is intentional for fire and forget
    });
  } catch (error) {
    // Silently ignore errors - this is fire and forget
    console.log('Emergency logout request sent (fire and forget)');
  }
};

// Log config on import (only in development)
if (__DEV__) {
  logApiConfig();
}
