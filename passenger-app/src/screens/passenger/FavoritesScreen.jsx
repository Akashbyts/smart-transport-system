import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function FavoritesScreen({ navigation }) {
  const theme = useTheme();
  const [tab, setTab] = useState('routes');
  const tabs = ['routes', 'stops', 'buses', 'trips'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.isDark ? '#0F172A' : '#1E40AF' }]}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? '#1E40AF' : theme.textSec }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            {tab === 'routes' ? '🗺️' : tab === 'stops' ? '🚏' : tab === 'buses' ? '🚌' : '📋'}
          </Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No favorite {tab} yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSec }]}>
            Tap the ☆ icon on any {tab.slice(0, -1)} to save it here
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.exploreBtnText}>Explore {tab} →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1E40AF' },
  tabText: { fontSize: 13, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  exploreBtn: {
    backgroundColor: '#1E40AF', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});