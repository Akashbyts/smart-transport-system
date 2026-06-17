import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { getAllRoutes } from '../../api/passenger.api';

export default function TripPlannerScreen({ navigation }) {
  const theme = useTheme();
  const { location } = useLocation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function planTrip() {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Error', 'Please enter both From and To locations');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await getAllRoutes();
      const routes = res.data || [];
      const matches = routes.filter(r => {
        const stops = Array.isArray(r.stops) ? r.stops : [];
        const fromMatch = stops.some(s => s.toLowerCase().includes(from.toLowerCase())) ||
          r.start_location.toLowerCase().includes(from.toLowerCase());
        const toMatch = stops.some(s => s.toLowerCase().includes(to.toLowerCase())) ||
          r.end_location.toLowerCase().includes(to.toLowerCase());
        return fromMatch && toMatch;
      });
      setResults(matches);
    } catch {
      Alert.alert('Error', 'Failed to find routes');
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    setFrom('My Current Location');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header title="Trip Planner" subtitle="Plan your journey" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* From/To Inputs */}
        <View style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.inputRow}>
            <View style={[styles.dotGreen, styles.dot]} />
            <View style={{ flex: 1 }}>
              <Input
                label="From"
                placeholder="Enter starting point"
                value={from}
                onChangeText={setFrom}
                style={{ marginBottom: 0 }}
              />
            </View>
            <TouchableOpacity style={styles.locBtn} onPress={useCurrentLocation}>
              <Text style={styles.locBtnText}>📍</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.connector, { backgroundColor: theme.border }]} />
          <View style={styles.inputRow}>
            <View style={[styles.dotRed, styles.dot]} />
            <View style={{ flex: 1 }}>
              <Input
                label="To"
                placeholder="Enter destination"
                value={to}
                onChangeText={setTo}
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={() => { const t = from; setFrom(to); setTo(t); }}
          >
            <Text style={styles.swapIcon}>⇅</Text>
          </TouchableOpacity>
        </View>

        <Button title="Find Routes 🔍" onPress={planTrip} loading={loading} style={styles.btn} />

        {/* Results */}
        {searched && (
          <View style={styles.results}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>
              {results.length > 0 ? results.length + ' route(s) found' : 'No routes found'}
            </Text>
            {results.length === 0 && (
              <View style={[styles.noResult, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={styles.noResultIcon}>🔍</Text>
                <Text style={[styles.noResultText, { color: theme.textSec }]}>
                  No direct routes found between these stops. Try different stop names.
                </Text>
              </View>
            )}
            {results.map((route, i) => {
              const stops = Array.isArray(route.stops) ? route.stops : [];
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('RouteDetails', { route })}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.resultBadge}>
                      <Text style={styles.resultBadgeText}>{route.route_number}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resultName, { color: theme.text }]}>{route.route_name}</Text>
                      <Text style={[styles.resultPath, { color: theme.textSec }]}>
                        {route.start_location} → {route.end_location}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.resultStats}>
                    <Text style={[styles.resultStat, { color: theme.textSec }]}>
                      🚏 {stops.length} stops
                    </Text>
                    {route.estimated_duration_minutes && (
                      <Text style={[styles.resultStat, { color: theme.textSec }]}>
                        ⏱️ ~{route.estimated_duration_minutes} min
                      </Text>
                    )}
                    <Text style={styles.resultAction}>View Details →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  planCard: {
    borderRadius: 16, padding: 16, borderWidth: 1,
    marginBottom: 16, position: 'relative'
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 20 },
  dotGreen: { backgroundColor: '#10B981' },
  dotRed: { backgroundColor: '#EF4444' },
  connector: { width: 2, height: 16, marginLeft: 5, marginVertical: 4 },
  locBtn: { padding: 8, marginTop: 12 },
  locBtnText: { fontSize: 20 },
  swapBtn: {
    position: 'absolute', right: 16, top: '50%',
    backgroundColor: '#EFF6FF', borderRadius: 20,
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center'
  },
  swapIcon: { fontSize: 18, color: '#1E40AF' },
  btn: { marginBottom: 16 },
  results: { gap: 12 },
  resultsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  noResult: {
    borderRadius: 14, padding: 20, borderWidth: 1, alignItems: 'center'
  },
  noResultIcon: { fontSize: 40, marginBottom: 8 },
  noResultText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  resultCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  resultBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4
  },
  resultBadgeText: { fontSize: 12, fontWeight: '700', color: '#1E40AF' },
  resultName: { fontSize: 14, fontWeight: '700' },
  resultPath: { fontSize: 12, marginTop: 2 },
  resultStats: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  resultStat: { fontSize: 12 },
  resultAction: { marginLeft: 'auto', fontSize: 12, color: '#1E40AF', fontWeight: '600' }
});