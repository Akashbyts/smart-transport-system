import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import { useTheme } from '../../context/ThemeContext';

export default function StopDetailsScreen({ navigation, route }) {
  const { stop } = route.params;
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title={stop?.name || 'Stop Details'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.stopIcon}>🚏</Text>
          <Text style={[styles.stopName, { color: theme.text }]}>{stop?.name}</Text>
          {stop?.distance !== undefined && (
            <Text style={[styles.distance, { color: theme.textSec }]}>
              {(stop.distance / 1000).toFixed(1)} km away
            </Text>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Stop Information</Text>
          <Text style={[styles.noData, { color: theme.textSec }]}>
            Real-time arrival data coming soon. Check Live Map for bus positions.
          </Text>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('MapTab')}
          >
            <Text style={styles.mapBtnText}>View on Live Map →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: {
    borderRadius: 16, padding: 24, borderWidth: 1,
    marginBottom: 12, alignItems: 'center'
  },
  stopIcon: { fontSize: 48, marginBottom: 8 },
  stopName: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  distance: { fontSize: 14, marginTop: 4 },
  infoCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  noData: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  mapBtn: {
    backgroundColor: '#EFF6FF', borderRadius: 10,
    padding: 12, alignItems: 'center'
  },
  mapBtnText: { color: '#1E40AF', fontWeight: '600', fontSize: 14 }
});