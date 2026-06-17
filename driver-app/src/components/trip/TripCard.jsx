import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime, formatDuration } from '../../utils/helpers';

export default function TripCard({ trip }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.busNumber}>{trip.bus_number}</Text>
          <Text style={styles.route}>{trip.route_name}</Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        {[
          { label: 'Route No.', value: trip.route_number },
          { label: 'Started', value: formatTime(trip.started_at) },
          { label: 'Date', value: formatDate(trip.started_at) },
          { label: 'Duration', value: formatDuration(trip.started_at, trip.ended_at) }
        ].map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  busNumber: { fontSize: 18, fontWeight: '700', color: colors.text },
  route: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: '45%' },
  label: { fontSize: 11, color: colors.textLight, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 14, color: colors.text, fontWeight: '600' }
});