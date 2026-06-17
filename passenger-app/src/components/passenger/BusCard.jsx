import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatETA, formatDistance } from '../../utils/helpers';

export default function BusCard({ bus, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🚌</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.busNumber, { color: theme.text }]}>
            {bus.bus_number}
          </Text>
          <Text style={[styles.routeName, { color: theme.textSec }]} numberOfLines={1}>
            {bus.route_name}
          </Text>
        </View>
        <View style={styles.etaWrap}>
          <Text style={styles.etaText}>
            {bus.eta ? formatETA(bus.eta) : 'Live'}
          </Text>
          <Text style={[styles.etaLabel, { color: theme.textSec }]}>ETA</Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSec }]}>
          🗺️ {bus.route_number}
        </Text>
        {bus.distanceKm && (
          <Text style={[styles.footerText, { color: theme.textSec }]}>
            📍 {bus.distanceKm} km away
          </Text>
        )}
        {bus.speed !== undefined && (
          <Text style={[styles.footerText, { color: theme.textSec }]}>
            ⚡ {Math.round(bus.speed || 0)} km/h
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 14,
    borderWidth: 1, marginRight: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 3
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center'
  },
  icon: { fontSize: 22 },
  busNumber: { fontSize: 16, fontWeight: '700' },
  routeName: { fontSize: 12, marginTop: 2 },
  etaWrap: { alignItems: 'center' },
  etaText: { fontSize: 18, fontWeight: '800', color: '#1E40AF' },
  etaLabel: { fontSize: 10, fontWeight: '500' },
  divider: { height: 1, marginVertical: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  footerText: { fontSize: 11, fontWeight: '500' }
});