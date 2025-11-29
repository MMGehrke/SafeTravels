/**
 * Secure Storage Usage Examples
 * 
 * This file demonstrates how to use the secure storage functions
 * in your React Native app for handling authentication tokens.
 */

import {
  saveToken,
  getToken,
  deleteToken,
  saveAuthToken,
  getAuthToken,
  deleteAuthToken,
  hasToken,
  clearAllTokens,
} from './secureStorage';

// ============================================
// EXAMPLE 1: Basic Token Storage
// ============================================

export const exampleBasicUsage = async () => {
  try {
    // Save a token
    await saveToken('apiKey', 'sk-1234567890abcdef');
    console.log('Token saved');

    // Retrieve the token
    const apiKey = await getToken('apiKey');
    console.log('Retrieved token:', apiKey);

    // Delete the token
    await deleteToken('apiKey');
    console.log('Token deleted');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ============================================
// EXAMPLE 2: Authentication Flow
// ============================================

export const exampleAuthenticationFlow = async () => {
  try {
    // After successful login
    const loginResponse = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'user', password: 'pass' }),
    });
    
    const { token, refreshToken } = await loginResponse.json();

    // Save tokens securely
    await saveAuthToken(token);
    await saveToken('refreshToken', refreshToken);
    
    console.log('✅ Login successful, tokens saved securely');

    // Later, when making authenticated requests
    const authToken = await getAuthToken();
    
    if (authToken) {
      const response = await fetch('/api/protected', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Use response...
    }

    // On logout
    await deleteAuthToken();
    await deleteToken('refreshToken');
    console.log('✅ Logged out, tokens deleted');
  } catch (error) {
    console.error('Authentication error:', error.message);
  }
};

// ============================================
// EXAMPLE 3: Check if User is Logged In
// ============================================

export const exampleCheckLoginStatus = async () => {
  const isLoggedIn = await hasToken('authToken');
  
  if (isLoggedIn) {
    console.log('User is logged in');
    // Navigate to home screen
  } else {
    console.log('User is not logged in');
    // Navigate to login screen
  }
  
  return isLoggedIn;
};

// ============================================
// EXAMPLE 4: Handle Token Refresh
// ============================================

export const exampleTokenRefresh = async () => {
  try {
    // Get current refresh token
    const refreshToken = await getToken('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Request new access token
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const { token: newToken } = await response.json();

    // Save new token securely
    await saveAuthToken(newToken);
    console.log('✅ Token refreshed');
    
    return newToken;
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    // Redirect to login
    await clearAllTokens();
    throw error;
  }
};

// ============================================
// EXAMPLE 5: Complete Login Component
// ============================================

export const exampleLoginComponent = async (username, password) => {
  try {
    // 1. Call login API
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { token, refreshToken, user } = await response.json();

    // 2. Save tokens securely
    await saveAuthToken(token);
    if (refreshToken) {
      await saveToken('refreshToken', refreshToken);
    }

    // 3. Save user info (non-sensitive, can use AsyncStorage)
    // await AsyncStorage.setItem('user', JSON.stringify(user));

    console.log('✅ Login successful');
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// EXAMPLE 6: Logout Function
// ============================================

export const exampleLogout = async () => {
  try {
    // Delete all authentication tokens
    await deleteAuthToken();
    await deleteToken('refreshToken');
    
    // Optionally clear other app data
    // await AsyncStorage.clear();
    
    console.log('✅ Logout successful');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// EXAMPLE 7: API Request with Token
// ============================================

export const exampleAuthenticatedRequest = async (endpoint, options = {}) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Make authenticated request
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle 401 (unauthorized) - token might be expired
    if (response.status === 401) {
      // Try to refresh token
      const newToken = await exampleTokenRefresh();
      
      // Retry request with new token
      return fetch(`http://localhost:3000${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      });
    }

    return response;
  } catch (error) {
    console.error('Authenticated request failed:', error.message);
    throw error;
  }
};
