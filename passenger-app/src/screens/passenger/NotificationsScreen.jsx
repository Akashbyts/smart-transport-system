import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationsScreen({ navigation }) {
  const theme = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [radius, setRadius] = useState(500);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Notifications" subtitle="Alerts & settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Alert Settings */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Alert Settings</Text>
          {[
            { label: 'Push Notifications', value: pushEnabled, onChange: setPushEnabled },
            { label: 'SMS Alerts', value: smsEnabled, onChange: setSmsEnabled }
          ].map((item, i) => (
            <View key={i} style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.onChange}
                trackColor={{ false: '#E5E7EB', true: '#1E40AF' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* Active Alerts */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Active Alerts</Text>
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyText, { color: theme.textSec }]}>
              No active alerts. Set alerts from bus or stop details.
            </Text>
          </View>
        </View>

        {/* Alert History */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Notifications</Text>
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: theme.textSec }]}>
              No notifications yet
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1
  },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 20 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 13, textAlign: 'center' }
});