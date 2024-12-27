import { useState, useEffect } from 'react';
import { getCityFromCoordinates } from '../utils/cities';

export function useLocation() {
  const [location, setLocation] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const stored = sessionStorage.getItem('userLocation');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        city: getCityFromCoordinates(position.coords.latitude, position.coords.longitude),
        timestamp: new Date().toISOString()
      };

      sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to get location';
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = () => {
    const stored = sessionStorage.getItem('userLocation');
    if (stored) {
      const parsedLocation = JSON.parse(stored);
      const locationAge = new Date() - new Date(parsedLocation.timestamp);
      // Refresh if location is older than 30 minutes
      if (locationAge > 1800000) {
        requestLocation();
      } else {
        setLocation(parsedLocation);
      }
    } else {
      requestLocation();
    }
  };

  return { location, isLoading, error, requestLocation, refreshLocation };
} 