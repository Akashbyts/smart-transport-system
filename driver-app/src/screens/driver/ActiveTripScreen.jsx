import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';
import { colors } from '../../utils/colors';
import { formatTime } from '../../utils/helpers';

export default function ActiveTripScreen({ navigation }) {
  const { activeTrip, currentLocation, isTracking, handleEndTrip } = useTrip();
  const [ending, setEnding] = useState(false);

  async function confirmEndTrip() {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip? Location sharing will stop.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            setEnding(true);
            try {
              await handleEndTrip();
              navigation.replace('Dashboard');
            } catch {
              Alert.alert('Error', 'Failed to end trip');
            } finally {
              setEnding(false);
            }
          }
        }
      ]
    );
  }

  if (!activeTrip) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Active Trip" onBack={() => navigation.goBack()} />
        <View style={styles.noTrip}>
          <Text style={styles.noTripIcon}>🚌</Text>
          <Text style={styles.noTripText}>No active trip found</Text>
          <Button
            title="Start a Trip"
            onPress={() => navigation.navigate('StartTrip')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Trip Active"
        subtitle={`${activeTrip.bus_number} • ${activeTrip.route_name}`}
      />

      {currentLocation ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          showsUserLocation
        >
          <Marker
            coordinate={currentLocation}
            title={activeTrip.bus_number}
            description={activeTrip.route_name}
          />
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderIcon}>📍</Text>
          <Text style={styles.mapPlaceholderText}>Acquiring GPS location...</Text>
        </View>
      )}

      <ScrollView style={styles.info}>
        <View style={styles.liveCard}>
          <View style={[
            styles.liveDot,
            { backgroundColor: isTracking ? colors.secondary : colors.danger }
          ]} />
          <Text style={styles.liveText}>
            {isTracking
              ? 'Broadcasting live location to passengers'
              : 'Location tracking paused'}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Trip Details</Text>
          {[
            { label: 'Bus Number', value: activeTrip.bus_number },
            { label: 'Route', value: activeTrip.route_name },
            { label: 'Route No.', value: activeTrip.route_number },
            { label: 'Started At', value: formatTime(activeTrip.started_at) },
            {
              label: 'Current Location',
              value: currentLocation
                ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
                : 'Fetching...'
            }
          ].map((item, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Button
          title="End Trip"
          onPress={confirmEndTrip}
          loading={ending}
          variant="danger"
          style={styles.endBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { height: 260 },
  mapPlaceholder: {
    height: 260, backgroundColor: colors.gray100,
    justifyContent: 'center', alignItems: 'center'
  },
  mapPlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  mapPlaceholderText: { fontSize: 15, color: colors.textSecondary },
  info: { flex: 1, padding: 16 },
  liveCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12,
    padding: 14, marginBottom: 12, elevation: 2
  },
  liveDot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 10
  },
  liveText: { fontSize: 14, fontWeight: '600', color: colors.text },
  detailsCard: {
    backgroundColor: colors.white, borderRadius: 16,
    padding: 16, marginBottom: 16, elevation: 2
  },
  detailsTitle: {
    fontSize: 16, fontWeight: '700',
    color: colors.text, marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1,
    borderBottomColor: colors.gray100
  },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: {
    fontSize: 13, fontWeight: '600',
    color: colors.text, maxWidth: '60%', textAlign: 'right'
  },
  endBtn: { marginBottom: 32 },
  noTrip: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 32
  },
  noTripIcon: { fontSize: 64, marginBottom: 16 },
  noTripText: { fontSize: 18, color: colors.textSecondary }
});