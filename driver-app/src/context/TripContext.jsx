import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import * as Location from 'expo-location';
import { startTrip, endTrip, sendLocation, getActiveTrip } from '../api/trip.api';
import { useAuth } from './AuthContext';
import { LOCATION_INTERVAL } from '../utils/constants';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { driver } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const locationInterval = useRef(null);

  useEffect(() => {
    if (driver) checkActiveTrip();
    return () => stopTracking();
  }, [driver]);

  async function checkActiveTrip() {
    try {
      const res = await getActiveTrip();
      if (res.data?.trip) {
        setActiveTrip(res.data.trip);
        beginTracking(res.data.trip);
      }
    } catch {}
  }

  async function requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Location permission denied.');
      return false;
    }
    return true;
  }

  async function handleStartTrip(busId, routeId) {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) throw new Error('Location permission required');
    const res = await startTrip(busId, routeId);
    if (!res.success) throw new Error(res.message);
    setActiveTrip(res.data.trip);
    beginTracking(res.data.trip);
    return res.data.trip;
  }

  async function handleEndTrip() {
    if (!activeTrip) return;
    await endTrip(activeTrip.id);
    stopTracking();
    setActiveTrip(null);
  }

  function beginTracking(trip) {
    if (locationInterval.current) clearInterval(locationInterval.current);
    setIsTracking(true);
    locationInterval.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        const { latitude, longitude, heading, speed } = location.coords;
        setCurrentLocation({ latitude, longitude });
        await sendLocation({
          trip_id: trip.id,
          bus_id: trip.bus_id,
          latitude,
          longitude,
          heading: heading || 0,
          speed: speed ? speed * 3.6 : 0
        });
      } catch (err) {
        console.log('Location error:', err.message);
      }
    }, LOCATION_INTERVAL);
  }

  function stopTracking() {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
    setIsTracking(false);
  }

  return (
    <TripContext.Provider value={{
      activeTrip, currentLocation, isTracking,
      locationError, handleStartTrip, handleEndTrip
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside TripProvider');
  return ctx;
}