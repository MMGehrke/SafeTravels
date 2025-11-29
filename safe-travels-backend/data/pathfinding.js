/**
 * Safe Pathfinding Algorithm
 * 
 * Rule-based algorithm for calculating route safety by checking proximity
 * to known danger zones using the Haversine formula for distance calculation.
 */

/**
 * Mock Danger Zones
 * 
 * These represent areas with known safety risks for LGBTQIA+ travelers.
 * In production, this would come from a database with real-time incident data.
 * 
 * @typedef {Object} DangerZone
 * @property {number} lat - Latitude coordinate
 * @property {number} long - Longitude coordinate
 * @property {string} name - Name/description of the danger zone
 * @property {number} riskLevel - Risk level (1-10, higher = more dangerous)
 */
const dangerZones = [
  // High-risk areas (examples - these are fictional for demonstration)
  { lat: 0.3476, long: 32.5825, name: 'Kampala Central', riskLevel: 9 },
  { lat: 0.3136, long: 32.5811, name: 'Kampala Suburbs', riskLevel: 8 },
  { lat: 55.7558, long: 37.6173, name: 'Moscow Central District', riskLevel: 7 },
  { lat: 55.7520, long: 37.6156, name: 'Moscow Red Square Area', riskLevel: 7 },
  { lat: 59.9343, long: 30.3351, name: 'St. Petersburg Center', riskLevel: 6 },
  { lat: -23.5505, long: -46.6333, name: 'São Paulo - Certain Districts', riskLevel: 5 },
  { lat: -34.6037, long: -58.3816, name: 'Buenos Aires - Some Areas', riskLevel: 4 },
  
  // Medium-risk areas
  { lat: 1.3521, long: 103.8198, name: 'Singapore - Conservative Areas', riskLevel: 4 },
  { lat: 35.6762, long: 139.6503, name: 'Tokyo - Some Districts', riskLevel: 3 },
  
  // Lower-risk but still flagged areas
  { lat: -33.9249, long: 18.4241, name: 'Cape Town - Some Neighborhoods', riskLevel: 3 },
];

/**
 * Calculate distance between two points on Earth using Haversine formula
 * 
 * The Haversine formula calculates the great-circle distance between two points
 * on a sphere (like Earth) given their latitude and longitude.
 * 
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @returns {number} Distance in kilometers
 * 
 * @example
 * const distance = haversineDistance(43.6532, -79.3832, 45.5017, -73.5673);
 * // Returns: ~504 km (distance between Toronto and Montreal)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  // Haversine formula
  // a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  // c = 2 × atan2(√a, √(1−a))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance = R × c
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a coordinate is within a certain distance of any danger zone
 * 
 * @param {number} lat - Latitude of the point to check
 * @param {number} lon - Longitude of the point to check
 * @param {number} thresholdKm - Distance threshold in kilometers (default: 0.5)
 * @returns {Object|null} Danger zone information if within threshold, null otherwise
 */
function checkProximityToDangerZone(lat, lon, thresholdKm = 0.5) {
  for (const zone of dangerZones) {
    const distance = haversineDistance(lat, lon, zone.lat, zone.long);
    
    if (distance <= thresholdKm) {
      return {
        zone: zone,
        distance: distance,
        withinThreshold: true
      };
    }
  }
  
  return null;
}

/**
 * Calculate path risk and safety score for a route
 * 
 * This function:
 * 1. Takes a list of coordinates (the route)
 * 2. Checks each coordinate against danger zones
 * 3. Flags coordinates within 0.5km of danger zones
 * 4. Calculates a safety score (0-100) based on risk factors
 * 
 * @param {Array<{lat: number, lon: number}>} route - Array of coordinate objects
 * @param {number} dangerThresholdKm - Distance threshold in kilometers (default: 0.5)
 * @returns {Object} Path risk analysis with safety score and flagged points
 * 
 * @example
 * const route = [
 *   { lat: 43.6532, lon: -79.3832 },
 *   { lat: 43.6510, lon: -79.3800 },
 *   { lat: 43.6488, lon: -79.3768 }
 * ];
 * const result = calculatePathRisk(route);
 * // Returns: { safetyScore: 85, flaggedPoints: [...], totalPoints: 3, ... }
 */
function calculatePathRisk(route, dangerThresholdKm = 0.5) {
  if (!route || !Array.isArray(route) || route.length === 0) {
    throw new Error('Route must be a non-empty array of coordinates');
  }

  // Validate route format
  for (const point of route) {
    if (typeof point.lat !== 'number' || typeof point.lon !== 'number') {
      throw new Error('Each route point must have lat and lon as numbers');
    }
    if (point.lat < -90 || point.lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (point.lon < -180 || point.lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }

  const flaggedPoints = [];
  let totalRiskScore = 0;
  let maxRiskLevel = 0;

  // Check each point in the route
  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    const proximityCheck = checkProximityToDangerZone(
      point.lat,
      point.lon,
      dangerThresholdKm
    );

    if (proximityCheck) {
      const riskScore = proximityCheck.zone.riskLevel * 10; // Convert 1-10 to 0-100 scale
      totalRiskScore += riskScore;
      
      if (proximityCheck.zone.riskLevel > maxRiskLevel) {
        maxRiskLevel = proximityCheck.zone.riskLevel;
      }

      flaggedPoints.push({
        index: i,
        coordinate: { lat: point.lat, lon: point.lon },
        dangerZone: {
          name: proximityCheck.zone.name,
          riskLevel: proximityCheck.zone.riskLevel,
          location: { lat: proximityCheck.zone.lat, lon: proximityCheck.zone.long }
        },
        distance: proximityCheck.distance,
        riskScore: riskScore
      });
    }
  }

  // Calculate safety score (0-100, higher = safer)
  // Base score starts at 100
  let safetyScore = 100;

  if (flaggedPoints.length > 0) {
    // Calculate average risk per flagged point
    const averageRisk = totalRiskScore / flaggedPoints.length;
    
    // Calculate percentage of route that's flagged
    const flaggedPercentage = (flaggedPoints.length / route.length) * 100;
    
    // Reduce safety score based on:
    // 1. Average risk level of flagged points (weight: 60%)
    // 2. Percentage of route flagged (weight: 40%)
    const riskPenalty = averageRisk * 0.6;
    const coveragePenalty = (flaggedPercentage / 100) * 40 * 0.4;
    
    safetyScore = Math.max(0, 100 - riskPenalty - coveragePenalty);
    
    // Additional penalty for very high-risk zones
    if (maxRiskLevel >= 8) {
      safetyScore = Math.max(0, safetyScore - 15);
    }
  }

  // Round to 2 decimal places
  safetyScore = Math.round(safetyScore * 100) / 100;

  // Determine safety level
  let safetyLevel;
  if (safetyScore >= 80) {
    safetyLevel = 'Safe';
  } else if (safetyScore >= 60) {
    safetyLevel = 'Moderate';
  } else if (safetyScore >= 40) {
    safetyLevel = 'Risky';
  } else {
    safetyLevel = 'Dangerous';
  }

  return {
    safetyScore: safetyScore,
    safetyLevel: safetyLevel,
    totalPoints: route.length,
    flaggedPoints: flaggedPoints,
    flaggedCount: flaggedPoints.length,
    flaggedPercentage: route.length > 0 
      ? Math.round((flaggedPoints.length / route.length) * 100 * 100) / 100 
      : 0,
    recommendation: generateRecommendation(safetyScore, flaggedPoints.length, route.length),
    routeLength: calculateRouteLength(route) // Total route distance in km
  };
}

/**
 * Calculate total route length
 * 
 * @param {Array<{lat: number, lon: number}>} route - Array of coordinates
 * @returns {number} Total route distance in kilometers
 */
function calculateRouteLength(route) {
  if (route.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const distance = haversineDistance(
      route[i].lat,
      route[i].lon,
      route[i + 1].lat,
      route[i + 1].lon
    );
    totalDistance += distance;
  }

  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate safety recommendation based on analysis
 * 
 * @param {number} safetyScore - Safety score (0-100)
 * @param {number} flaggedCount - Number of flagged points
 * @param {number} totalPoints - Total points in route
 * @returns {string} Recommendation message
 */
function generateRecommendation(safetyScore, flaggedCount, totalPoints) {
  if (safetyScore >= 80) {
    return 'Route appears safe. Exercise normal caution.';
  } else if (safetyScore >= 60) {
    return 'Route has some risk areas. Consider alternative paths or travel during daylight hours.';
  } else if (safetyScore >= 40) {
    return 'Route passes through multiple risk areas. Strongly consider alternative routes.';
  } else {
    return 'Route is highly risky. Avoid this route if possible. Seek alternative transportation.';
  }
}

module.exports = {
  calculatePathRisk,
  haversineDistance,
  checkProximityToDangerZone,
  dangerZones,
  calculateRouteLength
};
