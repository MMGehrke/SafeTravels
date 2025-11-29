/**
 * Dynamic App Icon Utility
 * 
 * Allows changing the app icon dynamically (Android only).
 * iOS requires user interaction and shows an alert, so it's limited.
 * 
 * NOTE: For Expo SDK 50, we'll use a conditional approach:
 * - Android: Can change icon programmatically (if using expo-dynamic-app-icon or native module)
 * - iOS: Requires user interaction and shows system alert
 * 
 * For bare React Native workflow, you would need to:
 * 1. Add multiple app icons to native projects
 * 2. Use native modules to switch between them
 * 
 * For managed Expo workflow, this feature is limited.
 * We'll provide a structure that can be extended with native modules.
 */

import { Platform, Alert } from 'react-native';

// Available icon aliases (must match icon names in native projects)
const AVAILABLE_ICONS = {
  default: 'default', // Galois icon
  calculator: 'calculator',
  notes: 'notes',
  weather: 'weather',
};

/**
 * Change the app icon
 * 
 * @param {string} iconName - Name of the icon to switch to
 * @returns {Promise<boolean>} True if successful, false otherwise
 * 
 * @example
 * await changeAppIcon('calculator');
 */
export const changeAppIcon = async (iconName) => {
  if (!AVAILABLE_ICONS[iconName]) {
    console.error(`Invalid icon name: ${iconName}`);
    return false;
  }

  if (Platform.OS === 'ios') {
    // iOS limitations: Requires user interaction and shows system alert
    // This is a security feature by Apple
    Alert.alert(
      'Change App Icon',
      `To change the app icon on iOS, you need to use the system settings. This feature is limited on iOS for security reasons.`,
      [{ text: 'OK' }]
    );
    return false;
  }

  if (Platform.OS === 'android') {
    // Android: Can change icon programmatically
    // For managed Expo, this would require a custom native module
    // For bare workflow, you can use libraries like:
    // - react-native-change-icon
    // - expo-dynamic-app-icon (if available for your SDK)
    
    try {
      // TODO: Implement native module call
      // This is a placeholder for the actual implementation
      // In a bare workflow, you would call:
      // const { changeIcon } = require('react-native-change-icon');
      // await changeIcon(iconName);
      
      console.log(`[Dynamic Icon] Would change to: ${iconName}`);
      console.log('[Dynamic Icon] Note: Requires native module implementation');
      
      // For now, we'll just log it
      // In production, uncomment and implement the native module call
      /*
      const DynamicIcon = require('react-native-dynamic-app-icon');
      await DynamicIcon.setAppIcon(iconName);
      */
      
      return true;
    } catch (error) {
      console.error('Error changing app icon:', error);
      return false;
    }
  }

  return false;
};

/**
 * Get the current app icon
 * 
 * @returns {Promise<string>} Current icon name
 */
export const getCurrentAppIcon = async () => {
  // This would require native module implementation
  // For now, we'll return 'default'
  try {
    // TODO: Implement native module call to get current icon
    // const DynamicIcon = require('react-native-dynamic-app-icon');
    // return await DynamicIcon.getAppIcon();
    return 'default';
  } catch (error) {
    console.error('Error getting current app icon:', error);
    return 'default';
  }
};

/**
 * Get list of available icons
 * 
 * @returns {Array<string>} List of available icon names
 */
export const getAvailableIcons = () => {
  return Object.keys(AVAILABLE_ICONS);
};

/**
 * Check if dynamic icon changing is supported
 * 
 * @returns {boolean} True if supported on current platform
 */
export const isDynamicIconSupported = () => {
  // Android: Supported (with native module)
  // iOS: Limited (requires user interaction)
  return Platform.OS === 'android';
};

export default {
  changeAppIcon,
  getCurrentAppIcon,
  getAvailableIcons,
  isDynamicIconSupported,
  AVAILABLE_ICONS,
};
