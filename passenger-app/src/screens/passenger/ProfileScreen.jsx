import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.isDark ? '#0F172A' : '#1E40AF' }]}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Profile Info */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Account Details</Text>
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Phone', value: user?.phone }
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.infoLabel, { color: theme.textSec }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{item.value || 'N/A'}</Text>
            </View>
          ))}
        </View>

        {/* App Settings */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>App Settings</Text>
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              {theme.isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Text>
            <Switch
              value={theme.isDark}
              onValueChange={theme.toggleTheme}
              trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Quick Links */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>More</Text>
          {[
            { label: '📋 Trip History', onPress: () => navigation.navigate('TripHistory') },
            { label: '🔔 Notifications', onPress: () => navigation.navigate('Notifications') },
            { label: '💬 Send Feedback', onPress: () => navigation.navigate('Feedback') }
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.linkRow, { borderBottomColor: theme.border }]}
              onPress={item.onPress}
            >
              <Text style={[styles.linkText, { color: theme.text }]}>{item.label}</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingTop: 48, paddingBottom: 24,
    alignItems: 'center'
  },
  avatarWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1
  },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  linkRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1
  },
  linkText: { fontSize: 14, fontWeight: '500' },
  linkArrow: { fontSize: 20, color: '#9CA3AF' },
  logoutBtn: {
    backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#FECACA'
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 }
});