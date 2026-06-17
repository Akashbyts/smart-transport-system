import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';
import Loader from '../components/common/Loader';

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader message="Starting BusTrack..." />;
  return (
    <NavigationContainer>
      {isAuthenticated ? <DriverNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}