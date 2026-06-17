import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, RefreshControl,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

// ─── Theme definitions ────────────────────────────────────────────────────────
const lightTheme = {
  background: '#F9FAFB',
  card: '#FFFFFF',
  header: '#1E40AF',
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  activeBanner: '#10B981',
  warningBorder: '#F59E0B',
  dangerBorder: '#EF4444',
  badgeLogout: 'rgba(255,255,255,0.15)',
  inputBg: '#FFFFFF',
  shadow: '#000000'
};

const darkTheme = {
  background: '#0F172A',
  card: '#1E293B',
  header: '#0F172A',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  border: '#334155',
  divider: '#1E293B',
  activeBanner: '#059669',
  warningBorder: '#D97706',
  dangerBorder: '#DC2626',
  badgeLogout: 'rgba(255,255,255,0.1)',
  inputBg: '#1E293B',
  shadow: 'transparent'
};

export default function DashboardScreen({ navigation }) {
  const { driver, logout, refreshProfile } = useAuth();
  const { activeTrip } = useTrip();
  const [refreshing, setRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const theme = isDark ? darkTheme : lightTheme;

  async function onRefresh() {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  }

  const hasKYC = driver?.kyc_status;

  // ─── KYC display label ────────────────────────────────────────────────────
  function getKYCLabel() {
    if (!driver?.kyc_status || driver.kyc_status === 'not_submitted') return 'Not Submitted';
    if (driver.kyc_status === 'pending') return 'Submitted';
    if (driver.kyc_status === 'approved') return 'Verified ✅';
    if (driver.kyc_status === 'rejected') return 'Rejected ❌';
    return driver.kyc_status;
  }

  function getKYCColor() {
    if (!driver?.kyc_status || driver.kyc_status === 'not_submitted') return '#9CA3AF';
    if (driver.kyc_status === 'pending') return '#F59E0B';
    if (driver.kyc_status === 'approved') return '#10B981';
    if (driver.kyc_status === 'rejected') return '#EF4444';
    return '#9CA3AF';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.name}>{driver?.name}</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Dark mode toggle */}
          <View style={styles.darkToggle}>
            <Text style={styles.darkToggleIcon}>{isDark ? '🌙' : '☀️'}</Text>
            <Switch
              value={isDark}
              onValueChange={setIsDark}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#6366F1' }}
              thumbColor={isDark ? '#C7D2FE' : '#FFFFFF'}
              ios_backgroundColor="rgba(255,255,255,0.3)"
            />
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: theme.badgeLogout }]}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
      >
        {/* Status Card */}
        <View style={[styles.card, {
          backgroundColor: theme.card,
          shadowColor: theme.shadow
        }]}>
          {/* Account Status Row */}
          <View style={[styles.cardRow, { borderBottomColor: theme.divider }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
              Account Status
            </Text>
            <View style={[styles.statusPill, { backgroundColor: '#10B98120' }]}>
              <Text style={[styles.statusPillText, { color: '#10B981' }]}>
                Active
              </Text>
            </View>
          </View>

          {/* KYC Status Row */}
          <View style={[styles.cardRow, { borderBottomColor: theme.divider }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
              KYC Status
            </Text>
            <View style={[styles.statusPill, { backgroundColor: getKYCColor() + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getKYCColor() }]} />
              <Text style={[styles.statusPillText, { color: getKYCColor() }]}>
                {getKYCLabel()}
              </Text>
            </View>
          </View>

          {/* Phone Row */}
          <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
              Phone
            </Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {driver?.phone}
            </Text>
          </View>
        </View>

        {/* Active Trip Banner */}
        {activeTrip && (
          <TouchableOpacity
            style={[styles.activeBanner, { backgroundColor: theme.activeBanner }]}
            onPress={() => navigation.navigate('ActiveTrip')}
          >
            <View style={styles.pulseDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerTitle}>Active Trip in Progress</Text>
              <Text style={styles.activeBannerSub}>
                {activeTrip.bus_number} • {activeTrip.route_name}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* KYC Not Submitted Warning */}
        {(!hasKYC || hasKYC === 'not_submitted') && (
          <View style={[styles.alertCard, {
            backgroundColor: theme.card,
            borderLeftColor: '#F59E0B'
          }]}>
            <Text style={[styles.alertTitle, { color: theme.text }]}>
              ⚠️ KYC Not Submitted
            </Text>
            <Text style={[styles.alertText, { color: theme.textSecondary }]}>
              Submit your documents to get verified and start trips.
            </Text>
            <Button
              title="Submit KYC Documents"
              onPress={() => navigation.navigate('KYC')}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* KYC Pending Warning */}
        {hasKYC === 'pending' && (
          <View style={[styles.alertCard, {
            backgroundColor: theme.card,
            borderLeftColor: '#F59E0B'
          }]}>
            <Text style={[styles.alertTitle, { color: theme.text }]}>
              ⏳ KYC Submitted — Under Review
            </Text>
            <Text style={[styles.alertText, { color: theme.textSecondary }]}>
              Your documents are being reviewed by admin. Usually takes 1-2 business days.
            </Text>
          </View>
        )}

        {/* KYC Rejected Warning */}
        {hasKYC === 'rejected' && (
          <View style={[styles.alertCard, {
            backgroundColor: theme.card,
            borderLeftColor: '#EF4444'
          }]}>
            <Text style={[styles.alertTitle, { color: theme.text }]}>
              ❌ KYC Rejected
            </Text>
            <Text style={[styles.alertText, { color: theme.textSecondary }]}>
              Your KYC was rejected. Please resubmit your documents.
            </Text>
            <Button
              title="Resubmit KYC"
              onPress={() => navigation.navigate('KYC')}
              variant="danger"
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.grid}>
          {[
            {
              icon: '🚀',
              title: 'Start Trip',
              sub: 'Begin your route',
              onPress: () => navigation.navigate('StartTrip')
            },
            {
              icon: '📋',
              title: 'Trip History',
              sub: 'View past trips',
              onPress: () => navigation.navigate('TripHistory')
            },
            {
              icon: '📄',
              title: 'KYC Docs',
              sub: 'Manage documents',
              onPress: () => navigation.navigate('KYC')
            },
            activeTrip && {
              icon: '📍',
              title: 'Live Trip',
              sub: 'View active trip',
              onPress: () => navigation.navigate('ActiveTrip')
            }
          ].filter(Boolean).map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow
              }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.actionSub, { color: theme.textSecondary }]}>
                {item.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dark mode info */}
        <View style={[styles.themeInfo, { backgroundColor: theme.card }]}>
          <Text style={[styles.themeInfoText, { color: theme.textSecondary }]}>
            {isDark ? '🌙 Dark mode is ON' : '☀️ Light mode is ON'} — toggle in header
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  name: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  darkToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  darkToggleIcon: { fontSize: 16 },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20
  },
  logoutText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  content: { padding: 20 },

  card: {
    borderRadius: 16, padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 3
  },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1
  },
  cardLabel: { fontSize: 14, fontWeight: '500' },
  cardValue: { fontSize: 14, fontWeight: '600' },

  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3, marginRight: 5
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  activeBanner: {
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16
  },
  pulseDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#FFFFFF', marginRight: 12
  },
  activeBannerTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  activeBannerSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2
  },
  arrow: { fontSize: 20, color: '#FFFFFF' },

  alertCard: {
    borderRadius: 16, padding: 16,
    marginBottom: 16, borderLeftWidth: 4,
    elevation: 2
  },
  alertTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  alertText: { fontSize: 13, lineHeight: 20 },

  sectionTitle: {
    fontSize: 18, fontWeight: '700',
    marginBottom: 12, marginTop: 4
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    borderRadius: 16, padding: 16,
    width: '47%', borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: '700' },
  actionSub: { fontSize: 11, marginTop: 2 },

  themeInfo: {
    borderRadius: 12, padding: 12,
    marginTop: 16, alignItems: 'center'
  },
  themeInfoText: { fontSize: 12 }
});