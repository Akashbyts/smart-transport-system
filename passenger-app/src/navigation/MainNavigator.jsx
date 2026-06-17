import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HomeStack from './HomeStack';
import MapStack from './MapStack';
import PlannerStack from './PlannerStack';
import FavoritesStack from './FavoritesStack';
import ProfileStack from './ProfileStack';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused, color }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color, fontWeight: focused ? '700' : '500', marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4
        },
        tabBarShowLabel: false
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🗺️" label="Live Map" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="PlannerTab"
        component={PlannerStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🧭" label="Planner" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⭐" label="Saved" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}