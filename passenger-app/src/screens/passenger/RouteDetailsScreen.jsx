import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import { useTheme } from '../../context/ThemeContext';

export default function RouteDetailsScreen({ navigation, route }) {
  const { route: routeData } = route.params;
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const stops = Array.isArray(routeData?.stops) ? routeData.stops : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header
        title={routeData?.route_name || 'Route Details'}
        subtitle={'Route #' + (routeData?.route_number || '')}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            <Text style={{ fontSize: 24 }}>{isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Route Overview */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.routeHeader}>
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>{routeData?.route_number}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeName, { color: theme.text }]}>{routeData?.route_name}</Text>
              <Text style={[styles.routePath, { color: theme.textSec }]}>
                {routeData?.start_location} → {routeData?.end_location}
              </Text>
            </View>
          </View>
          <View style={styles.routeStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stops.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSec }]}>Stops</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {routeData?.estimated_duration_minutes
                  ? routeData.estimated_duration_minutes + 'm'
                  : 'N/A'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSec }]}>Duration</Text>
            </View>
          </View>
        </View>

        {/* Stops */}
        {stops.length > 0 && (
          <View style={[styles.stopsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>All Stops</Text>
            {stops.map((stop, i) => (
              <TouchableOpacity
                key={i}
                style={styles.stopRow}
                onPress={() => navigation.navigate('StopDetails', {
                  stop: { name: stop, index: i }
                })}
              >
                <View style={[
                  styles.stopDot,
                  { backgroundColor: i === 0 ? '#10B981' : i === stops.length - 1 ? '#EF4444' : '#1E40AF' }
                ]} />
                {i < stops.length - 1 && (
                  <View style={[styles.stopLine, { backgroundColor: theme.border }]} />
                )}
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopName, { color: theme.text }]}>{stop}</Text>
                  <Text style={[styles.stopTag, { color: theme.textSec }]}>
                    {i === 0 ? 'First Stop' : i === stops.length - 1 ? 'Last Stop' : 'Stop ' + (i + 1)}
                  </Text>
                </View>
                <Text style={styles.stopArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('MapTab')}
        >
          <Text style={styles.trackBtnText}>🗺️ View on Live Map</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  routeBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6
  },
  routeBadgeText: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  routeName: { fontSize: 16, fontWeight: '700' },
  routePath: { fontSize: 12, marginTop: 2 },
  routeStats: { flexDirection: 'row', gap: 24 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E40AF' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  stopsCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  stopRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, position: 'relative', paddingLeft: 28
  },
  stopDot: { width: 10, height: 10, borderRadius: 5, position: 'absolute', left: 0, top: 16 },
  stopLine: { position: 'absolute', left: 4, top: 26, width: 2, height: 24 },
  stopInfo: { flex: 1 },
  stopName: { fontSize: 14, fontWeight: '600' },
  stopTag: { fontSize: 11, marginTop: 2 },
  stopArrow: { fontSize: 18, color: '#9CA3AF' },
  trackBtn: {
    backgroundColor: '#1E40AF', borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 20
  },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});