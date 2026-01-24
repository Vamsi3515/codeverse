const axios = require('axios');

/**
 * Convert address to latitude and longitude using Google Geocoding API
 * Falls back to OpenStreetMap Nominatim if Google API is not configured
 */
exports.geocodeAddress = async (address) => {
  if (!address) {
    throw new Error('Address is required for geocoding');
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Try Google Geocoding API if key is available
  if (googleApiKey) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: googleApiKey
        },
        timeout: 5000
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: response.data.results[0].formatted_address
        };
      }

      console.warn('Google Geocoding API returned no results for:', address);
    } catch (error) {
      console.error('Google Geocoding API error:', error.message);
    }
  }

  // Fallback to OpenStreetMap Nominatim (free, no API key required)
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'Codeverse-Campus-Hackathon-Platform/1.0'
      },
      timeout: 5000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name
      };
    }

    throw new Error('No geocoding results found for address: ' + address);
  } catch (error) {
    console.error('Nominatim geocoding error:', error.message);
    throw new Error('Failed to geocode address: ' + address);
  }
};

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
