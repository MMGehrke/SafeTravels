/**
 * MainApp Component - Real Galois Application
 * 
 * This is the actual Galois app that appears after the stealth PIN is entered.
 * It contains all the real functionality: Login, Home, Map screens.
 * 
 * SECURITY: This component is only accessible after entering the STEALTH_PIN
 * in the StealthLayout (Calculator) component.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import MapScreen from './MapScreen';
import CamouflageSettings from './CamouflageSettings';

const Stack = createStackNavigator();

const MainApp = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: true,
          title: 'Safe Pathfinding',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="CamouflageSettings"
        component={CamouflageSettings}
        options={{
          headerShown: true,
          title: 'Camouflage Settings',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default MainApp;
