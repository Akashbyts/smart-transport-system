import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function RouteCard({ route, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{route.route_number}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {route.route_name}
          </Text>
          <Text style={[styles.sub, { color: theme.textSec }]} numberOfLines={1}>
            {route.start_location} → {route.end_location}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
      {Array.isArray(route.stops) && route.stops.length > 0 && (
        <Text style={[styles.stops, { color: theme.textSec }]}>
          {route.stops.length} stops
          {route.estimated_duration_minutes
            ? ' • ~' + route.estimated_duration_minutes + ' min'
            : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 10,
    elevation: 2
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E40AF' },
  name: { fontSize: 14, fontWeight: '700' },
  sub: { fontSize: 12, marginTop: 2 },
  arrow: { fontSize: 20, color: '#9CA3AF' },
  stops: { fontSize: 11, marginTop: 8 }
});