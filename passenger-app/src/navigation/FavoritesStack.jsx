import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FavoritesScreen from '../screens/passenger/FavoritesScreen';
import BusDetailsScreen from '../screens/passenger/BusDetailsScreen';
import RouteDetailsScreen from '../screens/passenger/RouteDetailsScreen';
import StopDetailsScreen from '../screens/passenger/StopDetailsScreen';

const Stack = createStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="BusDetails" component={BusDetailsScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
      <Stack.Screen name="StopDetails" component={StopDetailsScreen} />
    </Stack.Navigator>
  );
}