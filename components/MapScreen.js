/**
 * MapScreen Component
 * 
 * Displays a map with the user's current location and a route path.
 * The path color changes based on safety score from the backend:
 * - GREEN: Safe (score >= 70)
 * - RED: Risky/Dangerous (score < 70)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { checkPathRisk } from '../services/api';

const MapScreen = () => {
  const [safetyScore, setSafetyScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);

  // Mock user's current location (Toronto, Canada)
  const userLocation = {
    latitude: 43.6532,
    longitude: -79.3832,
  };

  // Hardcoded route points (from Toronto to a nearby location)
  const routePoints = [
    { lat: 43.6532, lon: -79.3832 }, // Start: Toronto
    { lat: 43.6510, lon: -79.3800 }, // Middle point
    { lat: 43.6488, lon: -79.3768 }, // End point
  ];

  // Convert route points to MapView format (lat/latitude, lon/longitude)
  const mapRoutePoints = routePoints.map(point => ({
    latitude: point.lat,
    longitude: point.lon,
  }));

  // Calculate initial region to show both start and end points
  const initialRegion = {
    latitude: (routePoints[0].lat + routePoints[routePoints.length - 1].lat) / 2,
    longitude: (routePoints[0].lon + routePoints[routePoints.length - 1].lon) / 2,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Fetch safety score from backend
  useEffect(() => {
    const fetchSafetyScore = async () => {
      try {
        setIsLoading(true);
        
        // Call the path-risk API endpoint
        const response = await checkPathRisk(routePoints);
        
        if (response.success) {
          setSafetyScore(response.safetyScore);
          setRouteData(response);
        } else {
          Alert.alert('Error', 'Failed to fetch route safety data');
          // Default to safe if API fails
          setSafetyScore(85);
        }
      } catch (error) {
        console.error('Error fetching safety score:', error);
        Alert.alert(
          'Connection Error',
          'Could not connect to server. Using default safe route.',
          [{ text: 'OK' }]
        );
        // Default to safe if server is unavailable
        setSafetyScore(85);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafetyScore();
  }, []);

  // Determine line color based on safety score
  const getLineColor = () => {
    if (safetyScore === null) {
      return '#808080'; // Gray while loading
    }
    // GREEN for safe (score >= 70), RED for risky (score < 70)
    return safetyScore >= 70 ? '#4CAF50' : '#F44336';
  };

  // Get safety level text
  const getSafetyLevelText = () => {
    if (safetyScore === null) {
      return 'Calculating...';
    }
    if (safetyScore >= 80) {
      return 'Safe';
    } else if (safetyScore >= 60) {
      return 'Moderate';
    } else if (safetyScore >= 40) {
      return 'Risky';
    } else {
      return 'Dangerous';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
      >
        {/* User's current location marker */}
        <Marker
          coordinate={userLocation}
          title="Your Location"
          description="Current position"
          pinColor="blue"
        />

        {/* Start point marker */}
        <Marker
          coordinate={mapRoutePoints[0]}
          title="Start"
          description="Route starting point"
          pinColor="green"
        />

        {/* End point marker */}
        <Marker
          coordinate={mapRoutePoints[mapRoutePoints.length - 1]}
          title="End"
          description="Route destination"
          pinColor="red"
        />

        {/* Route path polyline */}
        {!isLoading && (
          <Polyline
            coordinates={mapRoutePoints}
            strokeColor={getLineColor()}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* Safety Info Overlay */}
      <View style={styles.infoOverlay}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Calculating route safety...</Text>
          </View>
        ) : (
          <View style={styles.safetyInfo}>
            <View style={[styles.safetyBadge, { backgroundColor: getLineColor() }]}>
              <Text style={styles.safetyScore}>
                {safetyScore !== null ? Math.round(safetyScore) : '--'}
              </Text>
              <Text style={styles.safetyLabel}>Safety Score</Text>
            </View>
            <View style={styles.safetyDetails}>
              <Text style={styles.safetyLevel}>{getSafetyLevelText()}</Text>
              {routeData && (
                <>
                  <Text style={styles.safetyDetail}>
                    Route Length: {routeData.routeLength?.toFixed(2) || 'N/A'} km
                  </Text>
                  {routeData.flaggedCount > 0 && (
                    <Text style={styles.warningText}>
                      ⚠️ {routeData.flaggedCount} risk area(s) detected
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  safetyScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  safetyLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  safetyDetails: {
    flex: 1,
  },
  safetyLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  safetyDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default MapScreen;
