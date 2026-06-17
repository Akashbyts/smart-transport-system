import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSocket } from '../../context/SocketContext';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import { getNearbyBuses } from '../../api/passenger.api';

const { height } = Dimensions.get('window');

export default function LiveTrackingScreen({ navigation }) {
  const { busLocations, connected } = useSocket();
  const { location, refreshLocation } = useLocation();
  const theme = useTheme();
  const mapRef = useRef(null);

  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [showList, setShowList] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    if (location) loadNearbyBuses();
  }, [location]);

  async function loadNearbyBuses() {
    try {
      const res = await getNearbyBuses(location.latitude, location.longitude, 5);
      setNearbyBuses(res.data?.buses || []);
    } catch {}
  }

  function focusBus(bus) {
    setSelectedBus(bus);
    const loc = busLocations[bus.id] || bus;
    if (loc.latitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    }
  }

  function goToMyLocation() {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      });
    }
    refreshLocation();
  }

  const activeBuses = nearbyBuses.map(b => ({
    ...b,
    ...(busLocations[b.id] || {})
  }));

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        initialRegion={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        } : {
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 5,
          longitudeDelta: 5
        }}
      >
        {activeBuses.map(bus => {
          const lat = busLocations[bus.id]?.latitude || bus.latitude;
          const lng = busLocations[bus.id]?.longitude || bus.longitude;
          if (!lat || !lng) return null;
          return (
            <Marker
              key={bus.id}
              coordinate={{ latitude: parseFloat(lat), longitude: parseFloat(lng) }}
              title={bus.bus_number}
              description={bus.route_name}
              onPress={() => {
                setSelectedBus(bus);
                navigation.navigate('BusDetails', { bus });
              }}
            >
              <View style={[styles.busMarker, selectedBus?.id === bus.id && styles.busMarkerSelected]}>
                <Text style={styles.busMarkerText}>🚌</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Top overlay */}
      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <View style={styles.topRow}>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: connected ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>
              {connected ? activeBuses.length + ' buses live' : 'Connecting...'}
            </Text>
          </View>
          <TouchableOpacity style={styles.myLocBtn} onPress={goToMyLocation}>
            <Text style={styles.myLocIcon}>📍</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={styles.sheetHandle}
          onPress={() => setShowList(!showList)}
        >
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          <Text style={[styles.sheetTitle, { color: theme.text }]}>
            {activeBuses.length} Active Buses
          </Text>
        </TouchableOpacity>

        {showList && (
          <ScrollView style={styles.busList} showsVerticalScrollIndicator={false}>
            {activeBuses.length === 0 ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyIcon}>🚌</Text>
                <Text style={[styles.emptyText, { color: theme.textSec }]}>
                  No active buses nearby
                </Text>
              </View>
            ) : (
              activeBuses.map((bus, i) => (
                <TouchableOpacity
                  key={bus.id || i}
                  style={[
                    styles.busItem,
                    { borderColor: theme.border },
                    selectedBus?.id === bus.id && styles.busItemSelected
                  ]}
                  onPress={() => focusBus(bus)}
                >
                  <View style={styles.busItemLeft}>
                    <Text style={styles.busItemIcon}>🚌</Text>
                    <View>
                      <Text style={[styles.busItemNumber, { color: theme.text }]}>
                        {bus.bus_number}
                      </Text>
                      <Text style={[styles.busItemRoute, { color: theme.textSec }]}>
                        {bus.route_name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.busItemRight}>
                    <Text style={styles.busItemSpeed}>
                      {Math.round(busLocations[bus.id]?.speed || 0)} km/h
                    </Text>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => navigation.navigate('BusDetails', { bus })}
                    >
                      <Text style={styles.detailsBtnText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingTop: 8
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, elevation: 4
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  myLocBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center', elevation: 4
  },
  myLocIcon: { fontSize: 22 },
  busMarker: {
    backgroundColor: '#fff', borderRadius: 20, padding: 4, elevation: 4,
    borderWidth: 2, borderColor: '#1E40AF'
  },
  busMarkerSelected: { borderColor: '#10B981', backgroundColor: '#f0fdf4' },
  busMarkerText: { fontSize: 22 },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, maxHeight: height * 0.45,
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 12
  },
  sheetHandle: { alignItems: 'center', paddingBottom: 12 },
  handleBar: { width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  busList: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyList: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14 },
  busItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1
  },
  busItemSelected: { backgroundColor: '#EFF6FF' },
  busItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  busItemIcon: { fontSize: 24 },
  busItemNumber: { fontSize: 15, fontWeight: '700' },
  busItemRoute: { fontSize: 12, marginTop: 2 },
  busItemRight: { alignItems: 'flex-end', gap: 4 },
  busItemSpeed: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  detailsBtn: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8
  },
  detailsBtnText: { fontSize: 12, color: '#1E40AF', fontWeight: '600' }
});