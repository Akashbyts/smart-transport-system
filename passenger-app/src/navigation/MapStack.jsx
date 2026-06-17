import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LiveTrackingScreen from '../screens/passenger/LiveTrackingScreen';
import BusDetailsScreen from '../screens/passenger/BusDetailsScreen';
import StopDetailsScreen from '../screens/passenger/StopDetailsScreen';

const Stack = createStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen name="BusDetails" component={BusDetailsScreen} />
      <Stack.Screen name="StopDetails" component={StopDetailsScreen} />
    </Stack.Navigator>
  );
}