const geolib = require('geolib');

exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  return geolib.getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  ) / 1000; // Return distance in km
};

exports.findNearbyHackathons = (userLat, userLon, hackathons, radiusKm = 50) => {
  return hackathons.filter((hackathon) => {
    if (!hackathon.location || !hackathon.location.coordinates) {
      return false;
    }

    const [hackaLon, hackaLat] = hackathon.location.coordinates.coordinates;
    const distance = exports.calculateDistance(userLat, userLon, hackaLat, hackaLon);

    return distance <= radiusKm;
  });
};

exports.sortByDistance = (userLat, userLon, hackathons) => {
  return hackathons.sort((a, b) => {
    if (!a.location || !a.location.coordinates || !b.location || !b.location.coordinates) {
      return 0;
    }

    const [lonA, latA] = a.location.coordinates.coordinates;
    const [lonB, latB] = b.location.coordinates.coordinates;

    const distA = exports.calculateDistance(userLat, userLon, latA, lonA);
    const distB = exports.calculateDistance(userLat, userLon, latB, lonB);

    return distA - distB;
  });
};
