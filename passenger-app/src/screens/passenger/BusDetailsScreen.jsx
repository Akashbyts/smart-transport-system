import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Header from '../../components/common/Header';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { getBusDetails, getBusLocation } from '../../api/passenger.api';
import { formatTime } from '../../utils/helpers';

export default function BusDetailsScreen({ navigation, route }) {
  const { bus } = route.params;
  const { busLocations, trackBus, untrackBus } = useSocket();
  const theme = useTheme();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
    if (bus?.id && bus?.trip_id) trackBus(bus.id, bus.trip_id);
    return () => { if (bus?.id) untrackBus(bus.id); };
  }, []);

  async function loadDetails() {
    try {
      const res = await getBusDetails(bus.id);
      if (res.success) setDetails(res.data.bus);
    } catch { setDetails(bus); }
    finally { setLoading(false); }
  }

  const liveLocation = busLocations[bus?.id];
  const displayLocation = liveLocation || {
    latitude: bus?.latitude,
    longitude: bus?.longitude
  };

  const info = details || bus;
  const stops = Array.isArray(info?.stops) ? info.stops : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header
        title={'Bus ' + (info?.bus_number || '')}
        subtitle={info?.route_name || ''}
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        {displayLocation?.latitude ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            region={{
              latitude: parseFloat(displayLocation.latitude),
              longitude: parseFloat(displayLocation.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(displayLocation.latitude),
                longitude: parseFloat(displayLocation.longitude)
              }}
              title={'Bus ' + info?.bus_number}
            >
              <View style={styles.mapMarker}>
                <Text style={{ fontSize: 24 }}>🚌</Text>
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderIcon}>📍</Text>
            <Text style={[styles.mapPlaceholderText, { color: theme.textSec }]}>
              Fetching location...
            </Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Live Status */}
          <View style={[styles.liveCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.liveDot} />
            <Text style={[styles.liveText, { color: theme.text }]}>
              {liveLocation ? 'Broadcasting live location' : 'Location updating...'}
            </Text>
            {liveLocation?.speed !== undefined && (
              <Text style={styles.speedText}>{Math.round(liveLocation.speed)} km/h</Text>
            )}
          </View>

          {/* Bus Info */}
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Bus Information</Text>
            {[
              { label: 'Bus Number', value: info?.bus_number },
              { label: 'Route', value: info?.route_name },
              { label: 'Route No.', value: info?.route_number },
              { label: 'Driver', value: info?.driver_name || 'N/A' },
              { label: 'Started At', value: formatTime(info?.started_at) }
            ].map((item, i) => (
              <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.infoLabel, { color: theme.textSec }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value || 'N/A'}</Text>
              </View>
            ))}
          </View>

          {/* Stop Timeline */}
          {stops.length > 0 && (
            <View style={[styles.stopsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Stops</Text>
              {stops.map((stop, i) => (
                <View key={i} style={styles.stopRow}>
                  <View style={[
                    styles.stopDot,
                    { backgroundColor: i === 0 ? '#10B981' : i === stops.length - 1 ? '#EF4444' : '#1E40AF' }
                  ]} />
                  {i < stops.length - 1 && <View style={[styles.stopLine, { backgroundColor: theme.border }]} />}
                  <Text style={[styles.stopName, { color: theme.text }]}>{stop}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: 240 },
  mapPlaceholder: {
    height: 240, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center'
  },
  mapPlaceholderIcon: { fontSize: 48, marginBottom: 8 },
  mapPlaceholderText: { fontSize: 14 },
  mapMarker: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 4, elevation: 4, borderWidth: 2, borderColor: '#1E40AF'
  },
  content: { padding: 16 },
  liveCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#10B981', marginRight: 10
  },
  liveText: { flex: 1, fontSize: 13, fontWeight: '500' },
  speedText: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  infoCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '600' },
  stopsCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  stopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, position: 'relative', paddingLeft: 24 },
  stopDot: { width: 10, height: 10, borderRadius: 5, position: 'absolute', left: 0, top: 5 },
  stopLine: { position: 'absolute', left: 4, top: 15, width: 2, height: 20 },
  stopName: { fontSize: 14, paddingVertical: 4 }
});