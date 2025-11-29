/**
 * StealthLayout Component - "Plausible Deniability" Calculator
 * 
 * This component disguises the Galois app as a functional iOS Calculator.
 * It appears as a legitimate calculator app to pass cursory inspection.
 * 
 * SECURITY FEATURES:
 * - No persistent "unlocked" state (resets on app kill)
 * - Secret PIN sequence unlocks the real app (STEALTH_PIN)
 * - Duress PIN triggers emergency wipe + decoy mode (DURESS_PIN)
 * - Fully functional calculator to avoid suspicion
 * 
 * PIN FORMAT: Enter sequence ending with "=" (e.g., "5555=")
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearAllTokens } from '../utils/secureStorage';
import { emergencyLogout } from '../services/api';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 60) / 4; // 4 buttons per row with padding

// PIN Configuration (from environment or defaults)
// SECURITY WARNING: Default PINs are weak and for development only.
// In production, users MUST set custom PINs via SecureStore.
// NEVER use EXPO_PUBLIC_ for secrets - they are bundled into the app!
const STEALTH_PIN = process.env.EXPO_PUBLIC_STEALTH_PIN || '5555=';
const DURESS_PIN = process.env.EXPO_PUBLIC_DURESS_PIN || '9999=';

// TODO: Implement custom PIN setup flow:
// 1. Check SecureStore for user-set PINs on first launch
// 2. If not found, force user to set custom PINs
// 3. Store PINs in SecureStore (hashed) instead of environment variables
// 4. Add PIN complexity requirements (min 6-8 chars, variety)
// 5. Add attempt limiting (lock after 5 failed attempts)

const StealthLayout = () => {
  const navigation = useNavigation();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const inputSequence = useRef(''); // Track button presses for PIN detection
  const sequenceTimeout = useRef(null);

  // Reset input sequence after 3 seconds of inactivity
  useEffect(() => {
    if (inputSequence.current.length > 0) {
      if (sequenceTimeout.current) {
        clearTimeout(sequenceTimeout.current);
      }
      sequenceTimeout.current = setTimeout(() => {
        inputSequence.current = '';
      }, 3000);
    }
    return () => {
      if (sequenceTimeout.current) {
        clearTimeout(sequenceTimeout.current);
      }
    };
  }, [inputSequence.current]);

  const handleNumberPress = (num) => {
    // Track input for PIN detection
    inputSequence.current += num.toString();
    checkPinSequence();

    if (waitingForOperand) {
      setDisplay(num.toString());
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num.toString() : display + num);
    }
  };

  const handleOperationPress = (nextOperation) => {
    // Track "=" for PIN detection
    if (nextOperation === '=') {
      inputSequence.current += '=';
      checkPinSequence();
    } else {
      inputSequence.current = ''; // Reset sequence on operation (except =)
    }

    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    try {
      let result;
      switch (operation) {
        case '+':
          result = firstValue + secondValue;
          break;
        case '-':
          result = firstValue - secondValue;
          break;
        case '×':
          result = firstValue * secondValue;
          break;
        case '÷':
          // Handle divide by zero gracefully
          if (secondValue === 0) {
            return 0; // iOS Calculator shows 0 on divide by zero
          }
          result = firstValue / secondValue;
          break;
        case '=':
          result = secondValue;
          break;
        default:
          result = secondValue;
      }
      
      // SECURITY: Never crash - always return valid number
      // Check for NaN, Infinity, or invalid results
      if (!isFinite(result) || isNaN(result)) {
        return 0;
      }
      
      return result;
    } catch (error) {
      // CRITICAL: Never crash - always return 0 on error
      // A crash would reveal it's a React Native app
      return 0;
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    inputSequence.current = ''; // Reset PIN sequence on clear
  };

  const handleToggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const checkPinSequence = () => {
    const sequence = inputSequence.current;
    const startTime = Date.now(); // Track timing for attack prevention

    // Check for STEALTH_PIN (unlock real app)
    if (sequence.endsWith(STEALTH_PIN)) {
      // SECURITY: Never log PIN detection in production
      if (__DEV__) {
        console.log('🔓 Stealth PIN detected - Unlocking Galois');
      }
      inputSequence.current = ''; // Clear sequence
      
      // SECURITY: Add artificial delay to match duress PIN timing
      // This prevents timing attacks where guard can detect which PIN was used
      const stealthDelay = async () => {
        // Simulate same operations as duress mode for timing consistency
        const minDelay = 300; // Minimum delay to match duress (ms)
        const maxDelay = 600; // Maximum delay to match duress (ms)
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        
        // Perform fake operations to match duress timing
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Now navigate
        if (navigation) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
        }
      };
      
      stealthDelay();
      return;
    }

    // Check for DURESS_PIN (emergency wipe + decoy)
    if (sequence.endsWith(DURESS_PIN)) {
      // SECURITY: Never log duress PIN detection in production
      if (__DEV__) {
        console.log('🚨 Duress PIN detected - Activating emergency wipe');
      }
      inputSequence.current = ''; // Clear sequence
      
      // Trigger emergency wipe and navigate to decoy
      handleDuressMode(startTime);
      return;
    }
  };

  const handleDuressMode = async (startTime = Date.now()) => {
    try {
      // Step 1: Clear all secure storage (with secure overwrite)
      await clearAllTokens();
      // SECURITY: Only log in development mode
      if (__DEV__) {
        console.log('✅ Emergency wipe: All secure data cleared');
      }

      // Step 2: Send logout request (fire and forget)
      emergencyLogout().catch(() => {
        // Silently ignore errors
      });

      // Step 3: Ensure minimum delay to match stealth PIN timing
      // This prevents timing attacks where guard can detect duress PIN
      const minDelay = 300; // Minimum delay (ms)
      const maxDelay = 600; // Maximum delay (ms)
      const elapsed = Date.now() - startTime;
      const targetDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      const remainingDelay = Math.max(0, targetDelay - elapsed);
      
      if (remainingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }

      // Step 4: Navigate to Decoy Mode (NOT Login - this is the key difference)
      // Decoy mode shows generic tourist info to satisfy attacker
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DecoyMode' }],
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error during duress mode:', error);
      }
      
      // Even on error, ensure timing consistency
      const minDelay = 300;
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minDelay - elapsed);
      await new Promise(resolve => setTimeout(resolve, remainingDelay));
      
      // Navigate to decoy
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DecoyMode' }],
        });
      }
    }
  };

  // Format display value (handle long numbers)
  const formatDisplay = (value) => {
    try {
      // SECURITY: Handle invalid values gracefully
      if (!value || value === 'NaN' || value === 'Infinity' || value === '-Infinity') {
        return '0';
      }
      
      if (value.length > 9) {
        // Convert to scientific notation for very large numbers
        const num = parseFloat(value);
        if (!isFinite(num)) {
          return '0';
        }
        return num.toExponential(3);
      }
      return value;
    } catch (error) {
      // CRITICAL: Never crash - always return '0' on error
      return '0';
    }
  };

  // Calculator button layout (iOS style)
  const Button = ({ label, onPress, style, textStyle }) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {formatDisplay(display)}
        </Text>
      </View>

      {/* Button Grid */}
      <View style={styles.buttonContainer}>
        {/* Row 1 */}
        <Button label="C" onPress={handleClear} style={styles.functionButton} />
        <Button label="±" onPress={handleToggleSign} style={styles.functionButton} />
        <Button label="%" onPress={handlePercentage} style={styles.functionButton} />
        <Button
          label="÷"
          onPress={() => handleOperationPress('÷')}
          style={styles.operatorButton}
        />

        {/* Row 2 */}
        <Button label="7" onPress={() => handleNumberPress(7)} style={styles.numberButton} />
        <Button label="8" onPress={() => handleNumberPress(8)} style={styles.numberButton} />
        <Button label="9" onPress={() => handleNumberPress(9)} style={styles.numberButton} />
        <Button
          label="×"
          onPress={() => handleOperationPress('×')}
          style={styles.operatorButton}
        />

        {/* Row 3 */}
        <Button label="4" onPress={() => handleNumberPress(4)} style={styles.numberButton} />
        <Button label="5" onPress={() => handleNumberPress(5)} style={styles.numberButton} />
        <Button label="6" onPress={() => handleNumberPress(6)} style={styles.numberButton} />
        <Button
          label="−"
          onPress={() => handleOperationPress('-')}
          style={styles.operatorButton}
        />

        {/* Row 4 */}
        <Button label="1" onPress={() => handleNumberPress(1)} style={styles.numberButton} />
        <Button label="2" onPress={() => handleNumberPress(2)} style={styles.numberButton} />
        <Button label="3" onPress={() => handleNumberPress(3)} style={styles.numberButton} />
        <Button
          label="+"
          onPress={() => handleOperationPress('+')}
          style={styles.operatorButton}
        />

        {/* Row 5 */}
        <Button
          label="0"
          onPress={() => handleNumberPress(0)}
          style={[styles.numberButton, styles.zeroButton]}
        />
        <Button label="." onPress={() => handleNumberPress('.')} style={styles.numberButton} />
        <Button
          label="="
          onPress={() => handleOperationPress('=')}
          style={styles.operatorButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // iOS Calculator black background
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  displayText: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '200',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  buttonText: {
    fontSize: 36,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  numberButton: {
    backgroundColor: '#505050', // Dark gray for numbers
  },
  functionButton: {
    backgroundColor: '#D4D4D2', // Light gray for functions
  },
  functionButtonText: {
    color: '#000000',
  },
  operatorButton: {
    backgroundColor: '#FF9500', // Orange for operators
  },
  zeroButton: {
    width: BUTTON_SIZE * 2 + 10, // Double width for zero
  },
});

export default StealthLayout;
