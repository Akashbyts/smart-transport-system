import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime, formatDuration } from '../../utils/helpers';

export default function TripCard({ trip, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.route, { color: theme.text }]}>{trip.route_name}</Text>
          <Text style={[styles.bus, { color: theme.textSec }]}>Bus {trip.bus_number}</Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.details}>
        {[
          { label: 'Date', value: formatDate(trip.started_at) },
          { label: 'Start', value: formatTime(trip.started_at) },
          { label: 'Duration', value: formatDuration(trip.started_at, trip.ended_at) }
        ].map((item, i) => (
          <View key={i}>
            <Text style={[styles.label, { color: theme.textSec }]}>{item.label}</Text>
            <Text style={[styles.value, { color: theme.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 16,
    borderWidth: 1, marginBottom: 12, elevation: 3
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'
  },
  route: { fontSize: 16, fontWeight: '700' },
  bus: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, marginVertical: 12 },
  details: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '600' }
});