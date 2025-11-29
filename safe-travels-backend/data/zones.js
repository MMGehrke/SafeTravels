/**
 * Mock Database: Safe Zones Data
 * 
 * This file simulates a database of safe zones for LGBTQIA+ travelers.
 * Each zone has coordinates (latitude, longitude) and a safety score.
 * 
 * In a real application, this would be stored in a database like PostgreSQL or MongoDB.
 */

/**
 * Safe Zones Array
 * 
 * @typedef {Object} SafeZone
 * @property {number} lat - Latitude coordinate (-90 to 90)
 * @property {number} long - Longitude coordinate (-180 to 180)
 * @property {number} safetyScore - Safety score from 0-100 (higher = safer)
 */

const safeZones = [
  // North America - Safe Zones
  { lat: 43.6532, long: -79.3832, safetyScore: 95 }, // Toronto, Canada
  { lat: 45.5017, long: -73.5673, safetyScore: 94 }, // Montreal, Canada
  { lat: 49.2827, long: -123.1207, safetyScore: 96 }, // Vancouver, Canada
  { lat: 40.7128, long: -74.0060, safetyScore: 88 }, // New York, USA
  { lat: 37.7749, long: -122.4194, safetyScore: 90 }, // San Francisco, USA
  { lat: 34.0522, long: -118.2437, safetyScore: 87 }, // Los Angeles, USA
  
  // Europe - Safe Zones
  { lat: 52.5200, long: 13.4050, safetyScore: 93 }, // Berlin, Germany
  { lat: 48.8566, long: 2.3522, safetyScore: 89 }, // Paris, France
  { lat: 51.5074, long: -0.1278, safetyScore: 91 }, // London, UK
  { lat: 52.3676, long: 4.9041, safetyScore: 92 }, // Amsterdam, Netherlands
  { lat: 59.3293, long: 18.0686, safetyScore: 94 }, // Stockholm, Sweden
  { lat: 55.6761, long: 12.5683, safetyScore: 93 }, // Copenhagen, Denmark
  
  // Oceania - Safe Zones
  { lat: -33.8688, long: 151.2093, safetyScore: 95 }, // Sydney, Australia
  { lat: -37.8136, long: 144.9631, safetyScore: 94 }, // Melbourne, Australia
  { lat: -36.8485, long: 174.7633, safetyScore: 93 }, // Auckland, New Zealand
  
  // Asia - Mixed Zones
  { lat: 35.6762, long: 139.6503, safetyScore: 78 }, // Tokyo, Japan
  { lat: 1.3521, long: 103.8198, safetyScore: 72 }, // Singapore
  { lat: 25.0330, long: 121.5654, safetyScore: 75 }, // Taipei, Taiwan
  
  // South America - Mixed Zones
  { lat: -23.5505, long: -46.6333, safetyScore: 68 }, // São Paulo, Brazil
  { lat: -34.6037, long: -58.3816, safetyScore: 70 }, // Buenos Aires, Argentina
  
  // Africa - Limited Safe Zones
  { lat: -33.9249, long: 18.4241, safetyScore: 82 }, // Cape Town, South Africa
  
  // Areas to Avoid (for demonstration)
  { lat: 0.3476, long: 32.5825, safetyScore: 15 }, // Kampala, Uganda (Dangerous)
  { lat: 55.7558, long: 37.6173, safetyScore: 25 }, // Moscow, Russia (Avoid)
  { lat: 59.9343, long: 30.3351, safetyScore: 28 }, // St. Petersburg, Russia
];

/**
 * Find the nearest safe zone to given coordinates
 * Uses simple Euclidean distance (for demo purposes)
 * In production, use proper geospatial calculations (Haversine formula)
 * 
 * @param {number} latitude - Target latitude
 * @param {number} longitude - Target longitude
 * @returns {SafeZone|null} Nearest zone or null if none found
 */
function findNearestZone(latitude, longitude) {
  if (!safeZones || safeZones.length === 0) {
    return null;
  }

  let nearestZone = safeZones[0];
  let minDistance = calculateDistance(
    latitude,
    longitude,
    safeZones[0].lat,
    safeZones[0].long
  );

  for (const zone of safeZones) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.lat,
      zone.long
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestZone = zone;
    }
  }

  return {
    ...nearestZone,
    distance: minDistance
  };
}

/**
 * Calculate simple Euclidean distance between two coordinates
 * Note: This is a simplified calculation. For production, use Haversine formula
 * for accurate geographic distance calculations.
 * 
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in arbitrary units
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
}

/**
 * Get safety score for a location
 * 
 * @param {number} latitude - Target latitude
 * @param {number} longitude - Target longitude
 * @returns {Object} Safety information
 */
function getSafetyInfo(latitude, longitude) {
  const nearestZone = findNearestZone(latitude, longitude);
  
  if (!nearestZone) {
    return {
      safetyScore: null,
      message: 'No safety data available for this location',
      nearestZone: null
    };
  }

  // Determine safety level based on score
  let safetyLevel;
  let recommendation;
  
  if (nearestZone.safetyScore >= 80) {
    safetyLevel = 'Safe';
    recommendation = 'Generally safe for LGBTQIA+ travelers';
  } else if (nearestZone.safetyScore >= 60) {
    safetyLevel = 'Moderate';
    recommendation = 'Exercise caution and research local laws';
  } else if (nearestZone.safetyScore >= 40) {
    safetyLevel = 'Risky';
    recommendation = 'Significant risks - avoid if possible';
  } else {
    safetyLevel = 'Dangerous';
    recommendation = 'Extremely dangerous - avoid travel';
  }

  return {
    safetyScore: nearestZone.safetyScore,
    safetyLevel,
    recommendation,
    nearestZone: {
      latitude: nearestZone.lat,
      longitude: nearestZone.long,
      distance: nearestZone.distance
    }
  };
}

module.exports = {
  safeZones,
  findNearestZone,
  getSafetyInfo,
  calculateDistance
};
