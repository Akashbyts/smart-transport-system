import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { requestPermission(); }, []);

  async function requestPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
      }
    } catch (err) {
      console.log('Location error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshLocation() {
    if (!permissionGranted) return;
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
    } catch {}
  }

  return (
    <LocationContext.Provider value={{
      location, permissionGranted,
      loading, refreshLocation, requestPermission
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}