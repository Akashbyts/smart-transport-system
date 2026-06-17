import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Text style={styles.busIcon}>🚌</Text>
        </View>
        <Text style={styles.title}>BusTrack</Text>
        <Text style={styles.tagline}>
          Real-time bus tracking{'\n'}at your fingertips
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '📍', text: 'Track buses in real-time' },
          { icon: '🗺️', text: 'Plan your journey easily' },
          { icon: '🔔', text: 'Get arrival alerts' }
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryBtnText}>Get Started →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E40AF' },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24
  },
  busIcon: { fontSize: 60 },
  title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 12 },
  tagline: { fontSize: 17, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 26 },
  features: { paddingHorizontal: 32, marginBottom: 32 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14, borderRadius: 12
  },
  featureIcon: { fontSize: 22, marginRight: 14 },
  featureText: { fontSize: 14, color: '#fff', fontWeight: '500' },
  buttons: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  primaryBtn: {
    height: 52, backgroundColor: '#fff', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center'
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  secondaryBtn: {
    height: 52, borderRadius: 12, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center'
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' }
});