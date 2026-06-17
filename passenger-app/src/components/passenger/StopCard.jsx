import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDistance } from '../../utils/helpers';

export default function StopCard({ stop, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🚏</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{stop.name}</Text>
          {stop.distance !== undefined && (
            <Text style={[styles.distance, { color: theme.textSec }]}>
              {formatDistance(stop.distance)} away
            </Text>
          )}
        </View>
        {stop.busCount !== undefined && (
          <View style={styles.busCount}>
            <Text style={styles.busCountText}>{stop.busCount}</Text>
            <Text style={[styles.busCountLabel, { color: theme.textSec }]}>buses</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 10, elevation: 2
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center', alignItems: 'center'
  },
  icon: { fontSize: 20 },
  name: { fontSize: 14, fontWeight: '700' },
  distance: { fontSize: 12, marginTop: 2 },
  busCount: { alignItems: 'center' },
  busCountText: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  busCountLabel: { fontSize: 10, fontWeight: '500' }
});