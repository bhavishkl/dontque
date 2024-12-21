export const cityCoordinates = {
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Kalaburagi': { lat: 17.3297, lng: 76.8343 }
};

export const getCityFromCoordinates = (lat, lng) => {
  let nearestCity = null;
  let shortestDistance = Infinity;

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    const distance = Math.sqrt(
      Math.pow(lat - coords.lat, 2) + 
      Math.pow(lng - coords.lng, 2)
    );
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestCity = city;
    }
  }
  return nearestCity;
}; 