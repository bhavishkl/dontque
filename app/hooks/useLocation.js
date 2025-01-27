import { useState, useEffect, useCallback } from 'react';
import { getCityFromCoordinates } from '../utils/cities';

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Retry utility with exponential backoff
const retry = async (fn, retriesLeft = 3, interval = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, interval));
    return retry(fn, retriesLeft - 1, interval * 2);
  }
};

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

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false, // Changed to false since we only need approximate city location
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      });
    });
  };

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await retry(getPosition);

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
  }, []);

  // Debounced version of requestLocation
  const debouncedRequestLocation = useCallback(
    debounce(() => requestLocation(), 1000),
    [requestLocation]
  );

  const refreshLocation = useCallback(() => {
    const stored = sessionStorage.getItem('userLocation');
    if (stored) {
      const parsedLocation = JSON.parse(stored);
      const locationAge = new Date() - new Date(parsedLocation.timestamp);
      // Refresh if location is older than 30 minutes
      if (locationAge > 1800000) {
        debouncedRequestLocation();
      } else {
        setLocation(parsedLocation);
      }
    } else {
      debouncedRequestLocation();
    }
  }, [debouncedRequestLocation]);

  return { 
    location, 
    isLoading, 
    error, 
    requestLocation: debouncedRequestLocation, 
    refreshLocation 
  };
}