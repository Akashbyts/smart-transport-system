import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/passenger/HomeScreen';
import BusDetailsScreen from '../screens/passenger/BusDetailsScreen';
import RouteDetailsScreen from '../screens/passenger/RouteDetailsScreen';
import StopDetailsScreen from '../screens/passenger/StopDetailsScreen';
import NearbyStopsScreen from '../screens/passenger/NearbyStopsScreen';
import NotificationsScreen from '../screens/passenger/NotificationsScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BusDetails" component={BusDetailsScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
      <Stack.Screen name="StopDetails" component={StopDetailsScreen} />
      <Stack.Screen name="NearbyStops" component={NearbyStopsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}