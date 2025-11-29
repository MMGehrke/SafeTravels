import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import CountryModal from './CountryModal';
import { clearAllTokens } from '../utils/secureStorage';
import { emergencyLogout } from '../services/api';

const { width, height } = Dimensions.get('window');

// Mock data for countries
const mockCountries = [
  { id: 1, name: 'Canada', x: 0.2, y: 0.3, color: '#4CAF50' },
  { id: 2, name: 'Uganda', x: 0.6, y: 0.5, color: '#FF9800' },
  { id: 3, name: 'Brazil', x: 0.3, y: 0.7, color: '#FFC107' },
  { id: 4, name: 'Russia', x: 0.8, y: 0.2, color: '#F44336' },
  { id: 5, name: 'Australia', x: 0.8, y: 0.8, color: '#4CAF50' },
  { id: 6, name: 'Japan', x: 0.9, y: 0.4, color: '#4CAF50' },
  { id: 7, name: 'Germany', x: 0.5, y: 0.3, color: '#4CAF50' },
  { id: 8, name: 'South Africa', x: 0.5, y: 0.8, color: '#FF9800' },
];

const HomePage = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState(null);

  // Animation values for globe rotation
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockCountries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setSearchResults([]);
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      setIsModalVisible(true);
    }, 800);
  };

  const handleGlobeTap = (country) => {
    setHighlightedCountry(country.id);
    setTimeout(() => {
      setHighlightedCountry(null);
      handleCountrySelect(country);
    }, 300);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCountry(null);
  };

  /**
   * Emergency Wipe Function
   * 
   * This function performs a complete security wipe:
   * 1. Deletes all data from SecureStore
   * 2. Resets navigation to Login screen
   * 3. Sends logout request to backend (fire and forget)
   * 
   * This is a security feature for users who need to quickly
   * clear all sensitive data from their device.
   */
  const emergencyWipe = async () => {
    try {
      // Step 1: Clear all secure storage
      await clearAllTokens();
      console.log('✅ All secure data cleared');

      // Step 2: Send logout request to backend (fire and forget)
      // We don't wait for this - it's fire and forget
      emergencyLogout().catch(error => {
        // Silently handle errors - this is fire and forget
        console.log('Logout request sent (fire and forget)');
      });

      // Step 3: Reset navigation to Login screen
      // This clears the navigation stack and goes back to login
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error during emergency wipe:', error);
      // Even if there's an error, try to navigate to login
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  };

  /**
   * Handle Panic Button Press
   * 
   * Shows an Alert dialog to confirm the emergency wipe action
   * before executing it. This prevents accidental data loss.
   */
  const handlePanicButtonPress = () => {
    Alert.alert(
      'Emergency Wipe',
      'This will delete all stored data and log you out. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel', // iOS: shows in red, Android: shows as cancel
          onPress: () => {
            // User cancelled - do nothing
            console.log('Emergency wipe cancelled');
          },
        },
        {
          text: 'Wipe All Data',
          style: 'destructive', // iOS: shows in red, Android: shows as destructive
          onPress: emergencyWipe, // Execute emergency wipe
        },
      ],
      {
        cancelable: true, // Allow dismissing by tapping outside (Android)
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Interactive Globe Background */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.globeContainer, animatedStyle]}>
          <View style={styles.globe}>
            {/* Globe outline */}
            <View style={styles.globeOutline} />
            
            {/* Country markers */}
            {mockCountries.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={[
                  styles.countryMarker,
                  {
                    left: country.x * width * 0.8,
                    top: country.y * height * 0.6,
                    backgroundColor: highlightedCountry === country.id ? '#FFD700' : country.color,
                  },
                ]}
                onPress={() => handleGlobeTap(country)}
                activeOpacity={0.7}
              >
                <Text style={styles.countryMarkerText}>{country.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a city or country..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.searchResultText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.searchResultsList}
            />
          </View>
        )}
      </View>

      {/* Map Navigation Button */}
      {navigation && (
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.8}
        >
          <Text style={styles.mapButtonText}>🗺️ Safe Pathfinding</Text>
        </TouchableOpacity>
      )}

      {/* Emergency Wipe / Panic Button (FAB) */}
      {navigation && (
        <TouchableOpacity
          style={styles.panicButton}
          onPress={handlePanicButtonPress}
          activeOpacity={0.8}
        >
          <Text style={styles.panicButtonIcon}>🗑️</Text>
        </TouchableOpacity>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading country data...</Text>
        </View>
      )}

      {/* Country Detail Modal */}
      <CountryModal
        visible={isModalVisible}
        country={selectedCountry}
        onClose={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  globeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  globe: {
    width: width * 0.8,
    height: height * 0.6,
    position: 'relative',
  },
  globeOutline: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.8) / 2,
    borderWidth: 3,
    borderColor: '#4a90e2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    position: 'absolute',
  },
  countryMarker: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  countryMarkerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  mapButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  panicButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F44336', // Red color for emergency
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Android shadow
    zIndex: 10,
  },
  panicButtonIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

export default HomePage; 