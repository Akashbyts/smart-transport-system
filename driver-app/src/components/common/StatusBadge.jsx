import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  const color = getStatusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start'
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '600' }
});