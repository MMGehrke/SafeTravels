/**
 * Secure Storage Utility
 * 
 * Provides secure token storage using expo-secure-store.
 * This is the recommended way to store sensitive data like authentication tokens,
 * API keys, and other credentials in React Native apps.
 * 
 * Why SecureStore over AsyncStorage?
 * - SecureStore encrypts data using the device's secure keychain/keystore
 * - AsyncStorage stores data in plain text, easily accessible if device is compromised
 * - SecureStore requires device authentication (biometrics/passcode) to access
 * - AsyncStorage can be read by anyone with physical access to the device
 */

import * as SecureStore from 'expo-secure-store';

// ============================================
// SECURE STORAGE FUNCTIONS
// ============================================

/**
 * Save a token securely to the device's keychain/keystore
 * 
 * @param {string} key - The key to store the token under
 * @param {string} value - The token value to store
 * @returns {Promise<void>} Resolves when token is saved
 * @throws {Error} If saving fails
 * 
 * @example
 * await saveToken('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export const saveToken = async (key, value) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
    
    if (!value || typeof value !== 'string') {
      throw new Error('Value must be a non-empty string');
    }

    // SecureStore automatically encrypts and stores in keychain/keystore
    await SecureStore.setItemAsync(key, value);
    
    console.log(`✅ Token saved securely: ${key}`);
  } catch (error) {
    console.error(`❌ Error saving token "${key}":`, error.message);
    throw new Error(`Failed to save token: ${error.message}`);
  }
};

/**
 * Retrieve a token from secure storage
 * 
 * @param {string} key - The key of the token to retrieve
 * @returns {Promise<string|null>} The token value, or null if not found
 * @throws {Error} If retrieval fails
 * 
 * @example
 * const token = await getToken('authToken');
 * if (token) {
 *   // Use token for authenticated requests
 * }
 */
export const getToken = async (key) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    // SecureStore automatically decrypts from keychain/keystore
    const value = await SecureStore.getItemAsync(key);
    
    if (value) {
      console.log(`✅ Token retrieved: ${key}`);
      return value;
    }
    
    console.log(`ℹ️ Token not found: ${key}`);
    return null;
  } catch (error) {
    console.error(`❌ Error retrieving token "${key}":`, error.message);
    throw new Error(`Failed to retrieve token: ${error.message}`);
  }
};

/**
 * Delete a token from secure storage
 * 
 * @param {string} key - The key of the token to delete
 * @returns {Promise<void>} Resolves when token is deleted
 * @throws {Error} If deletion fails
 * 
 * @example
 * await deleteToken('authToken');
 */
export const deleteToken = async (key) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    // Check if token exists before attempting to delete
    const exists = await SecureStore.getItemAsync(key);
    
    if (exists) {
      await SecureStore.deleteItemAsync(key);
      console.log(`✅ Token deleted: ${key}`);
    } else {
      console.log(`ℹ️ Token not found, nothing to delete: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting token "${key}":`, error.message);
    throw new Error(`Failed to delete token: ${error.message}`);
  }
};

// ============================================
// CONVENIENCE FUNCTIONS FOR COMMON USE CASES
// ============================================

/**
 * Save authentication token
 * Convenience wrapper for saveToken with 'authToken' key
 * 
 * @param {string} token - The authentication token
 */
export const saveAuthToken = async (token) => {
  return saveToken('authToken', token);
};

/**
 * Get authentication token
 * Convenience wrapper for getToken with 'authToken' key
 */
export const getAuthToken = async () => {
  return getToken('authToken');
};

/**
 * Delete authentication token (logout)
 * Convenience wrapper for deleteToken with 'authToken' key
 */
export const deleteAuthToken = async () => {
  return deleteToken('authToken');
};

/**
 * Check if a token exists
 * 
 * @param {string} key - The key to check
 * @returns {Promise<boolean>} True if token exists, false otherwise
 */
export const hasToken = async (key) => {
  try {
    const value = await getToken(key);
    return value !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Clear all tokens (use with caution)
 * This will delete all tokens stored via SecureStore
 * 
 * Note: SecureStore doesn't have a "clear all" method,
 * so you need to track your keys and delete them individually.
 * 
 * @param {string[]} keys - Array of keys to delete
 */
export const clearAllTokens = async (keys = []) => {
  try {
    const defaultKeys = ['authToken', 'refreshToken', 'apiKey'];
    const keysToDelete = keys.length > 0 ? keys : defaultKeys;
    
    await Promise.all(
      keysToDelete.map(key => deleteToken(key))
    );
    
    console.log('✅ All tokens cleared');
  } catch (error) {
    console.error('❌ Error clearing tokens:', error.message);
    throw error;
  }
};
