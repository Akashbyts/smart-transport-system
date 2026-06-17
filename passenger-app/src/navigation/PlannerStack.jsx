import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TripPlannerScreen from '../screens/passenger/TripPlannerScreen';
import RouteDetailsScreen from '../screens/passenger/RouteDetailsScreen';

const Stack = createStackNavigator();

export default function PlannerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
    </Stack.Navigator>
  );
}