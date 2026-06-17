import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/driver/DashboardScreen';
import KYCScreen from '../screens/driver/KYCScreen';
import StartTripScreen from '../screens/driver/StartTripScreen';
import ActiveTripScreen from '../screens/driver/ActiveTripScreen';
import TripHistoryScreen from '../screens/driver/TripHistoryScreen';

const Stack = createStackNavigator();

export default function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="KYC" component={KYCScreen} />
      <Stack.Screen name="StartTrip" component={StartTripScreen} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
    </Stack.Navigator>
  );
}