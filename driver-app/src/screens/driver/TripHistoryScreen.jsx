import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  FlatList, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import TripCard from '../../components/trip/TripCard';
import Loader from '../../components/common/Loader';
import { getDriverTrips } from '../../api/driver.api';
import { colors } from '../../utils/colors';

export default function TripHistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadTrips(1); }, []);

  async function loadTrips(pageNum = 1) {
    try {
      const res = await getDriverTrips(pageNum, 20);
      const newTrips = res.data || [];
      if (pageNum === 1) {
        setTrips(newTrips);
        setTotal(res.pagination?.total || 0);
      } else {
        setTrips(prev => [...prev, ...newTrips]);
      }
      setHasMore(newTrips.length === 20);
      setPage(pageNum);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadTrips(1);
  }

  function loadMore() {
    if (hasMore && !loading) loadTrips(page + 1);
  }

  if (loading) return <Loader message="Loading trip history..." />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Trip History"
        subtitle={`${total} total trips`}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Your completed trips will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20, fontWeight: '700',
    color: colors.text, marginBottom: 8
  },
  emptyText: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center'
  }
});