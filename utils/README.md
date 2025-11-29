# Secure Storage Utilities

This directory contains secure storage utilities for handling sensitive data like authentication tokens.

## Files

- **`secureStorage.js`** - Main secure storage functions
- **`secureStorage.example.js`** - Usage examples
- **`SECURITY_GUIDE.md`** - Comprehensive security guide

## Quick Start

```javascript
import { saveAuthToken, getAuthToken, deleteAuthToken } from '../utils/secureStorage';

// After login
await saveAuthToken('your-jwt-token-here');

// When making API requests
const token = await getAuthToken();

// On logout
await deleteAuthToken();
```

## Available Functions

### Core Functions

- `saveToken(key, value)` - Save any token securely
- `getToken(key)` - Retrieve a token
- `deleteToken(key)` - Delete a token

### Convenience Functions

- `saveAuthToken(token)` - Save authentication token
- `getAuthToken()` - Get authentication token
- `deleteAuthToken()` - Delete authentication token
- `hasToken(key)` - Check if token exists
- `clearAllTokens(keys)` - Clear multiple tokens

## Why SecureStore?

**Never use AsyncStorage for sensitive tokens!**

- ✅ SecureStore encrypts data using device keychain/keystore
- ✅ Requires device authentication (biometric/PIN)
- ✅ Protects against theft and malware
- ❌ AsyncStorage stores data in plain text
- ❌ Anyone with device access can read it

See `SECURITY_GUIDE.md` for detailed explanation.

## Usage Examples

See `secureStorage.example.js` for complete usage examples including:
- Basic token storage
- Authentication flow
- Token refresh
- Logout handling
- Authenticated API requests
