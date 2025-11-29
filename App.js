import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { View, Text, ActivityIndicator } from 'react-native';

// Stealth and Decoy components
import StealthLayout from './components/StealthLayout';
import DecoyMode from './components/DecoyMode';

// Real app components (only accessible after stealth PIN)
import MainApp from './components/MainApp';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'DancingScript': require('./assets/fonts/DancingScript-Regular.ttf'),
          'DancingScript-Bold': require('./assets/fonts/DancingScript-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading fonts:', error);
        // Fallback to system fonts if custom fonts fail to load
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading Galois...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="StealthLayout"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animationEnabled: false, // Disable animations for security (faster transitions)
        }}
      >
        {/* Stealth Layout - Appears as Calculator (initial route) */}
        <Stack.Screen
          name="StealthLayout"
          component={StealthLayout}
          options={{
            headerShown: false,
          }}
        />

        {/* Decoy Mode - Generic tourist info (after duress PIN) */}
        <Stack.Screen
          name="DecoyMode"
          component={DecoyMode}
          options={{
            headerShown: false,
          }}
        />

        {/* Main App - Real Galois (after stealth PIN) */}
        <Stack.Screen
          name="MainApp"
          component={MainApp}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 