# API Service Documentation

## Overview

The `api.js` service handles all communication between the React Native app and the backend server. It includes proper localhost handling for different platforms and development environments.

## Localhost Handling

React Native has different requirements for accessing localhost based on the platform:

### iOS Simulator
- Uses: `http://localhost:3000`
- Works out of the box

### Android Emulator
- Uses: `http://10.0.2.2:3000`
- `10.0.2.2` is a special IP that maps to the host machine's localhost
- This is automatically handled by the `getBaseURL()` function

### Physical Devices (iOS & Android)
- Cannot use `localhost` (it refers to the device itself, not your computer)
- Use your computer's local IP address instead
- Example: `http://192.168.1.100:3000`

## Finding Your Computer's IP Address

### macOS/Linux
```bash
# Find your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use:
ipconfig getifaddr en0  # macOS
```

### Windows
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

## Using Physical Devices

If you want to test on a physical device, you have two options:

### Option 1: Modify API_BASE_URL (Temporary)
```javascript
// In services/api.js, temporarily change:
const getBaseURL = () => {
  if (__DEV__ === false) {
    return 'https://api.galois.app';
  }
  
  // Replace with your computer's IP address
  return 'http://192.168.1.100:3000'; // Your IP here
};
```

### Option 2: Use Environment Variables (Recommended)
Install `react-native-config` and use environment variables:

```bash
npm install react-native-config
```

Create `.env` file:
```
API_BASE_URL=http://192.168.1.100:3000
```

## API Functions

### `checkServerHealth()`
Checks if the backend server is running and accessible.

**Returns:**
```javascript
{
  success: true,
  data: {
    status: 'healthy',
    message: 'Galois API is running',
    timestamp: '2025-01-27T...',
    uptime: 123.45,
    environment: 'development'
  },
  timestamp: '2025-01-27T...'
}
```

**Usage:**
```javascript
import { checkServerHealth } from '../services/api';

const result = await checkServerHealth();
if (result.success) {
  console.log('Server is online!');
} else {
  console.log('Server is offline:', result.error);
}
```

### `checkSafety(latitude, longitude)`
Checks safety information for given coordinates.

**Parameters:**
- `latitude` (number): Latitude coordinate (-90 to 90)
- `longitude` (number): Longitude coordinate (-180 to 180)

**Returns:**
```javascript
{
  success: true,
  coordinates: { latitude: 43.6532, longitude: -79.3832 },
  safetyScore: 95,
  safetyLevel: 'Safe',
  recommendation: 'Generally safe for LGBTQIA+ travelers',
  nearestZone: {
    latitude: 43.6532,
    longitude: -79.3832,
    distance: 0.001
  }
}
```

**Usage:**
```javascript
import { checkSafety } from '../services/api';

try {
  const result = await checkSafety(43.6532, -79.3832);
  console.log('Safety score:', result.safetyScore);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Error Handling

The API service handles common errors:

- **Network errors**: Returns user-friendly message
- **Server errors**: Returns error details from server
- **Validation errors**: Returns specific validation messages

## Testing

### 1. Start the Backend Server
```bash
cd safe-travels-backend
npm run dev
```

### 2. Run the React Native App
```bash
# From the root directory
npm start
# Then press 'i' for iOS or 'a' for Android
```

### 3. Check the Login Screen
The server status should appear at the bottom of the login screen:
- 🟢 Green dot = Server connected
- 🔴 Red dot = Server offline

## Troubleshooting

### "Unable to connect to server"
1. Make sure the backend server is running (`npm run dev` in `safe-travels-backend`)
2. Check that the port matches (default: 3000)
3. For Android Emulator, ensure it's using `10.0.2.2`
4. For physical devices, use your computer's IP address

### "Network request failed"
- Check your firewall settings
- Ensure your device/emulator is on the same network as your computer
- Verify the backend server is accessible from your browser

### Server Status Shows Offline
- Check the backend server logs for errors
- Verify the `/health` endpoint works in your browser
- Check the API_BASE_URL in the login screen (shown in dev mode)

## Production

For production, update the `getBaseURL()` function:

```javascript
const getBaseURL = () => {
  if (__DEV__ === false) {
    return 'https://api.galois.app'; // Your production URL
  }
  // ... development URLs
};
```

