import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, TouchableOpacity, Image,
  TextInput, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getAllBuses, getAllRoutes, saveDrawnRoute } from '../../api/trip.api';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

export default function StartTripScreen({ navigation }) {
  const { handleStartTrip, activeTrip } = useTrip();
  const { driver } = useAuth();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Route mode: 'select' or 'draw'
  const [routeMode, setRouteMode] = useState('select');

  // Draw route states
  const [drawModalVisible, setDrawModalVisible] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [savingRoute, setSavingRoute] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (activeTrip) { navigation.replace('ActiveTrip'); return; }
    checkKYCAndLoad();
  }, []);

  async function checkKYCAndLoad() {
    // Block if KYC not submitted or not approved
    if (!driver?.kyc_status) {
      Alert.alert(
        'KYC Required ⚠️',
        'You must complete KYC verification before starting a trip.',
        [
          {
            text: 'Go to KYC',
            onPress: () => navigation.replace('KYC')
          }
        ]
      );
      return;
    }

    if (driver?.kyc_status === 'pending') {
      Alert.alert(
        'KYC Under Review ⏳',
        'Your KYC documents are being reviewed by admin. You can start trips once approved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (driver?.kyc_status === 'rejected') {
      Alert.alert(
        'KYC Rejected ❌',
        'Your KYC was rejected. Please resubmit your documents.',
        [
          {
            text: 'Resubmit KYC',
            onPress: () => navigation.replace('KYC')
          }
        ]
      );
      return;
    }

    // KYC approved — load data
    await loadData();
  }

  async function loadData() {
    try {
      const [busRes, routeRes] = await Promise.all([
        getAllBuses(), getAllRoutes()
      ]);
      setBuses(busRes.data || []);
      setRoutes(routeRes.data || []);
    } catch {
      Alert.alert('Error', 'Failed to load buses and routes');
    } finally {
      setLoading(false);
    }
  }

  async function takeSelfie() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8
    });
    if (!result.canceled) setSelfie(result.assets[0]);
  }

  // ─── Draw Route Functions ──────────────────────────────────────────────────

  async function openDrawMode() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission needed to draw route');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      setDrawnPoints([]);
      setRouteName('');
      setRouteNumber('');
      setDrawModalVisible(true);
    } catch {
      Alert.alert('Error', 'Could not get current location');
    }
  }

  function handleMapPress(event) {
    const { coordinate } = event.nativeEvent;
    setDrawnPoints(prev => [...prev, coordinate]);
  }

  function undoLastPoint() {
    setDrawnPoints(prev => prev.slice(0, -1));
  }

  function clearAllPoints() {
    Alert.alert('Clear Route', 'Remove all drawn points?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => setDrawnPoints([]) }
    ]);
  }

  async function saveDrawnRouteAndSelect() {
    if (drawnPoints.length < 2) {
      Alert.alert('Error', 'Please mark at least 2 points on the map');
      return;
    }
    if (!routeName.trim()) {
      Alert.alert('Error', 'Please enter a route name');
      return;
    }
    if (!routeNumber.trim()) {
      Alert.alert('Error', 'Please enter a route number');
      return;
    }

    setSavingRoute(true);
    try {
      // Build stops array from drawn points
      const stops = drawnPoints.map((point, index) => {
        if (index === 0) return 'Start Point';
        if (index === drawnPoints.length - 1) return 'End Point';
        return `Stop ${index}`;
      });

      const routeData = {
        route_number: routeNumber.trim(),
        route_name: routeName.trim(),
        start_location: 'Start Point',
        end_location: 'End Point',
        stops,
        waypoints: drawnPoints, // store coordinates for map display
        estimated_duration_minutes: null
      };

      const res = await saveDrawnRoute(routeData);
      if (res.success) {
        const newRoute = res.data.route;
        setRoutes(prev => [...prev, newRoute]);
        setSelectedRoute(newRoute);
        setRouteMode('select');
        setDrawModalVisible(false);
        Alert.alert(
          'Route Saved ✅',
          `Route "${routeName}" has been saved and selected.`
        );
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save route');
    } finally {
      setSavingRoute(false);
    }
  }

  // ─── Start Trip ────────────────────────────────────────────────────────────

  async function handleStart() {
    if (!selectedBus) { Alert.alert('Error', 'Please select a bus'); return; }
    if (!selectedRoute) { Alert.alert('Error', 'Please select or draw a route'); return; }
    if (!selfie) { Alert.alert('Error', 'Please take a selfie with the bus'); return; }

    Alert.alert(
      'Start Trip',
      `Bus: ${selectedBus.bus_number}\nRoute: ${selectedRoute.route_name}\n\nStart this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start 🚀',
          onPress: async () => {
            setStarting(true);
            try {
              await handleStartTrip(selectedBus.id, selectedRoute.id, selfie);
              navigation.replace('ActiveTrip');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to start trip');
            } finally {
              setStarting(false);
            }
          }
        }
      ]
    );
  }

  if (loading) return <Loader message="Loading..." />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Start New Trip" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>

        {/* KYC Status Badge */}
        <View style={styles.kycBadge}>
          <Text style={styles.kycBadgeText}>✅ KYC Verified — You can start trips</Text>
        </View>

        {/* Bus Selection */}
        <Text style={styles.sectionTitle}>Select Bus</Text>
        {buses.length === 0 ? (
          <Text style={styles.empty}>No buses available. Ask admin to add buses.</Text>
        ) : (
          buses.map(bus => (
            <TouchableOpacity
              key={bus.id}
              style={[styles.card, selectedBus?.id === bus.id && styles.cardSelected]}
              onPress={() => setSelectedBus(bus)}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardIcon}>🚌</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{bus.bus_number}</Text>
                  <Text style={styles.cardSub}>
                    {bus.model || 'Standard Bus'} • {bus.capacity} seats
                  </Text>
                </View>
                {selectedBus?.id === bus.id && (
                  <Text style={styles.check}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Route Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Route</Text>

        {/* Route Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, routeMode === 'select' && styles.modeBtnActive]}
            onPress={() => setRouteMode('select')}
          >
            <Text style={[
              styles.modeBtnText,
              routeMode === 'select' && styles.modeBtnTextActive
            ]}>
              📋 Select Route
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, routeMode === 'draw' && styles.modeBtnActive]}
            onPress={() => setRouteMode('draw')}
          >
            <Text style={[
              styles.modeBtnText,
              routeMode === 'draw' && styles.modeBtnTextActive
            ]}>
              ✏️ Draw New Route
            </Text>
          </TouchableOpacity>
        </View>

        {/* Select existing route */}
        {routeMode === 'select' && (
          <>
            {routes.length === 0 ? (
              <View style={styles.noRouteCard}>
                <Text style={styles.noRouteText}>
                  No routes in database yet.
                </Text>
                <TouchableOpacity onPress={() => setRouteMode('draw')}>
                  <Text style={styles.noRouteLinkText}>
                    ✏️ Draw your first route →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              routes.map(route => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.card,
                    selectedRoute?.id === route.id && styles.cardSelected
                  ]}
                  onPress={() => setSelectedRoute(route)}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardIcon}>🗺️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{route.route_name}</Text>
                      <Text style={styles.cardSub}>
                        Route {route.route_number} • {route.start_location} → {route.end_location}
                      </Text>
                    </View>
                    {selectedRoute?.id === route.id && (
                      <Text style={styles.check}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* Draw new route */}
        {routeMode === 'draw' && (
          <View style={styles.drawCard}>
            <Text style={styles.drawCardTitle}>✏️ Draw New Route</Text>
            <Text style={styles.drawCardText}>
              Tap the button below to open the map. Tap on the map to mark stops along your route. The route will be saved for future trips.
            </Text>

            {selectedRoute && routeMode === 'draw' && (
              <View style={styles.drawnRouteSelected}>
                <Text style={styles.drawnRouteSelectedText}>
                  ✅ Route drawn: {selectedRoute.route_name}
                </Text>
              </View>
            )}

            <Button
              title="Open Map to Draw Route 🗺️"
              onPress={openDrawMode}
              style={styles.drawBtn}
            />
          </View>
        )}

        {/* Selfie with Bus */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Selfie with Bus 🤳
        </Text>
        <View style={styles.selfieInfo}>
          <Text style={styles.selfieInfoText}>
            Required for every trip. Stand next to your bus and take a photo.
          </Text>
        </View>

        <TouchableOpacity style={styles.selfieBox} onPress={takeSelfie}>
          {selfie ? (
            <Image source={{ uri: selfie.uri }} style={styles.selfiePreview} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Text style={styles.selfieIcon}>📸</Text>
              <Text style={styles.selfieText}>Take Selfie with Bus</Text>
              <Text style={styles.selfieSubText}>Tap to open camera</Text>
            </View>
          )}
        </TouchableOpacity>

        {selfie && (
          <TouchableOpacity onPress={takeSelfie} style={styles.retakeBtn}>
            <Text style={styles.retakeBtnText}>🔄 Retake Selfie</Text>
          </TouchableOpacity>
        )}

        <Button
          title="Start Trip 🚀"
          onPress={handleStart}
          loading={starting}
          style={styles.startBtn}
        />
      </ScrollView>

      {/* Draw Route Modal */}
      <Modal
        visible={drawModalVisible}
        animationType="slide"
        onRequestClose={() => setDrawModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDrawModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Draw Your Route</Text>
            <TouchableOpacity onPress={undoLastPoint}>
              <Text style={styles.modalUndo}>↩ Undo</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionText}>
              📍 Tap on map to add stops • {drawnPoints.length} points added
            </Text>
          </View>

          {/* Map */}
          {currentLocation && (
            <MapView
              ref={mapRef}
              style={styles.drawMap}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
              }}
              onPress={handleMapPress}
              showsUserLocation
            >
              {/* Draw polyline between points */}
              {drawnPoints.length > 1 && (
                <Polyline
                  coordinates={drawnPoints}
                  strokeColor={colors.primary}
                  strokeWidth={4}
                />
              )}

              {/* Markers for each point */}
              {drawnPoints.map((point, index) => (
                <Marker
                  key={index}
                  coordinate={point}
                  title={
                    index === 0
                      ? 'Start'
                      : index === drawnPoints.length - 1
                      ? 'End'
                      : `Stop ${index}`
                  }
                  pinColor={
                    index === 0
                      ? 'green'
                      : index === drawnPoints.length - 1
                      ? 'red'
                      : 'orange'
                  }
                />
              ))}
            </MapView>
          )}

          {/* Route Details Form */}
          <View style={styles.routeForm}>
            <View style={styles.routeFormRow}>
              <View style={[styles.routeFormInput, { marginRight: 8 }]}>
                <Text style={styles.routeFormLabel}>Route Number</Text>
                <TextInput
                  style={styles.routeInput}
                  value={routeNumber}
                  onChangeText={setRouteNumber}
                  placeholder="e.g. RT-15"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={styles.routeFormInput}>
                <Text style={styles.routeFormLabel}>Route Name</Text>
                <TextInput
                  style={styles.routeInput}
                  value={routeName}
                  onChangeText={setRouteName}
                  placeholder="e.g. City to Airport"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <View style={styles.routeActions}>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={clearAllPoints}
              >
                <Text style={styles.clearBtnText}>🗑 Clear All</Text>
              </TouchableOpacity>

              <Button
                title={savingRoute ? 'Saving...' : 'Save Route ✅'}
                onPress={saveDrawnRouteAndSelect}
                loading={savingRoute}
                style={styles.saveRouteBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },

  kycBadge: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 10, padding: 10,
    marginBottom: 20,
    borderLeftWidth: 3, borderLeftColor: colors.secondary
  },
  kycBadgeText: { fontSize: 13, color: colors.secondary, fontWeight: '600' },

  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: colors.text, marginBottom: 12
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 2,
    borderColor: colors.border, elevation: 1
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08'
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  check: { fontSize: 20, color: colors.primary, fontWeight: '700' },
  empty: {
    color: colors.textSecondary, textAlign: 'center',
    padding: 20, fontStyle: 'italic'
  },

  // Route mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 12, padding: 4,
    marginBottom: 16
  },
  modeBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: 10, alignItems: 'center'
  },
  modeBtnActive: { backgroundColor: colors.white, elevation: 2 },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  modeBtnTextActive: { color: colors.primary },

  noRouteCard: {
    backgroundColor: colors.white,
    borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 2,
    borderColor: colors.border, borderStyle: 'dashed'
  },
  noRouteText: { fontSize: 14, color: colors.textSecondary, marginBottom: 10 },
  noRouteLinkText: { fontSize: 14, color: colors.primary, fontWeight: '700' },

  // Draw card
  drawCard: {
    backgroundColor: colors.white,
    borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: colors.primaryLight,
    borderStyle: 'dashed'
  },
  drawCardTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  drawCardText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  drawnRouteSelected: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 8, padding: 10, marginBottom: 12
  },
  drawnRouteSelectedText: { fontSize: 13, color: colors.secondary, fontWeight: '600' },
  drawBtn: { marginTop: 4 },

  // Selfie
  selfieInfo: {
    backgroundColor: colors.warning + '20',
    borderRadius: 10, padding: 12, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: colors.warning
  },
  selfieInfoText: { fontSize: 13, color: colors.gray700 },
  selfieBox: {
    borderWidth: 2, borderColor: colors.border,
    borderRadius: 16, borderStyle: 'dashed',
    height: 200, overflow: 'hidden', marginBottom: 8
  },
  selfiePlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  selfieIcon: { fontSize: 48, marginBottom: 8 },
  selfieText: { fontSize: 16, fontWeight: '600', color: colors.text },
  selfieSubText: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  selfiePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  retakeBtn: { alignItems: 'center', marginBottom: 8 },
  retakeBtnText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  startBtn: { marginTop: 24 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary
  },
  modalClose: { fontSize: 20, color: colors.white, fontWeight: '700' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  modalUndo: { fontSize: 14, color: colors.white, fontWeight: '600' },

  mapInstructions: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 8, paddingHorizontal: 16
  },
  mapInstructionText: { fontSize: 13, color: colors.primary, fontWeight: '500' },

  drawMap: { flex: 1 },

  routeForm: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  routeFormRow: { flexDirection: 'row', marginBottom: 12 },
  routeFormInput: { flex: 1 },
  routeFormLabel: {
    fontSize: 12, fontWeight: '600',
    color: colors.gray600, marginBottom: 4
  },
  routeInput: {
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 14,
    color: colors.text, backgroundColor: colors.white
  },
  routeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  clearBtn: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.danger
  },
  clearBtnText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  saveRouteBtn: { flex: 1 }
});