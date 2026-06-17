import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, RefreshControl, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import StopCard from '../../components/passenger/StopCard';
import Loader from '../../components/common/Loader';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllRoutes } from '../../api/passenger.api';
import { calculateDistance } from '../../utils/helpers';

export default function NearbyStopsScreen({ navigation }) {
  const { location, refreshLocation } = useLocation();
  const theme = useTheme();
  const [stops, setStops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadStops(); }, [location]);

  async function loadStops() {
    if (!location) { setLoading(false); return; }
    try {
      const res = await getAllRoutes();
      const routes = res.data || [];
      const stopMap = {};
      routes.forEach(route => {
        if (Array.isArray(route.stops)) {
          route.stops.forEach((stopName, i) => {
            if (!stopMap[stopName]) {
              stopMap[stopName] = {
                id: stopName + i,
                name: stopName,
                routes: [],
                distance: null
              };
            }
            stopMap[stopName].routes.push(route.route_number);
          });
        }
      });
      const stopList = Object.values(stopMap);
      setStops(stopList);
    } catch {}
    finally { setLoading(false); }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refreshLocation();
    await loadStops();
    setRefreshing(false);
  }

  const filtered = stops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader message="Finding nearby stops..." />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Nearby Stops" subtitle="Bus stops near you" onBack={() => navigation.goBack()} />

      <View style={[styles.searchWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search stops..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <StopCard
            stop={{ ...item, busCount: item.routes.length }}
            onPress={() => navigation.navigate('StopDetails', { stop: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚏</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No stops found</Text>
            <Text style={[styles.emptyText, { color: theme.textSec }]}>
              {search ? 'Try different search term' : 'No stop data available'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1.5, height: 48
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' }
});