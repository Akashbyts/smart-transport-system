import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { getNearbyBuses, getAllRoutes } from '../../api/passenger.api';
import BusCard from '../../components/passenger/BusCard';
import RouteCard from '../../components/passenger/RouteCard';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { location, refreshLocation } = useLocation();
  const { connected, busLocations } = useSocket();
  const theme = useTheme();

  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, [location]);

  async function loadData() {
    if (!location) return;
    setLoading(true);
    try {
      const [busRes, routeRes] = await Promise.all([
        getNearbyBuses(location.latitude, location.longitude, 3),
        getAllRoutes()
      ]);
      setNearbyBuses(busRes.data?.buses || []);
      setRoutes(routeRes.data || []);
    } catch (err) {
      console.log('Load data error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refreshLocation();
    await loadData();
    setRefreshing(false);
  }

  const filteredRoutes = routes.filter(r =>
    r.route_name.toLowerCase().includes(search.toLowerCase()) ||
    r.route_number.toLowerCase().includes(search.toLowerCase())
  );

  // Merge real-time locations into nearby buses
  const busesWithLive = nearbyBuses.map(bus => ({
    ...bus,
    ...(busLocations[bus.id] || {})
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.isDark ? '#0F172A' : '#1E40AF' }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.userName}>{user?.name || 'Passenger'}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.connDot, { backgroundColor: connected ? '#10B981' : '#EF4444' }]} />
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search routes, buses, stops..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >

        {/* Location Status */}
        {!location && (
          <TouchableOpacity
            style={styles.locationWarn}
            onPress={() => navigation.navigate('LiveTracking')}
          >
            <Text style={styles.locationWarnText}>
              📍 Enable location to see nearby buses
            </Text>
          </TouchableOpacity>
        )}

        {/* Nearby Buses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Buses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MapTab')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {busesWithLive.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.emptyIcon}>🚌</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No buses nearby</Text>
              <Text style={[styles.emptyText, { color: theme.textSec }]}>
                {location ? 'No active buses within 3 km' : 'Enable location to find nearby buses'}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {busesWithLive.map((bus, i) => (
                <BusCard
                  key={bus.id || i}
                  bus={bus}
                  onPress={() => navigation.navigate('BusDetails', { bus })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '🗺️', label: 'Live Map', onPress: () => navigation.navigate('MapTab') },
              { icon: '🧭', label: 'Plan Trip', onPress: () => navigation.navigate('PlannerTab') },
              { icon: '🚏', label: 'Nearby Stops', onPress: () => navigation.navigate('NearbyStops') },
              { icon: '⭐', label: 'Favorites', onPress: () => navigation.navigate('FavoritesTab') }
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={action.onPress}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {search ? 'Search Results' : 'All Routes'}
            </Text>
            <Text style={[styles.countText, { color: theme.textSec }]}>
              {filteredRoutes.length} routes
            </Text>
          </View>
          {filteredRoutes.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No routes found</Text>
            </View>
          ) : (
            filteredRoutes.map((route, i) => (
              <RouteCard
                key={route.id || i}
                route={route}
                onPress={() => navigation.navigate('RouteDetails', { route })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  notifBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center'
  },
  notifIcon: { fontSize: 18 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#fff' },
  content: { padding: 20 },
  locationWarn: {
    backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#F59E0B'
  },
  locationWarnText: { fontSize: 13, color: '#92400E', fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 13, color: '#1E40AF', fontWeight: '600' },
  countText: { fontSize: 13 },
  emptyCard: {
    borderRadius: 16, padding: 24, borderWidth: 1,
    alignItems: 'center'
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptyText: { fontSize: 13, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '47%', borderRadius: 16, padding: 16,
    borderWidth: 1, alignItems: 'center',
    elevation: 2
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600' }
});