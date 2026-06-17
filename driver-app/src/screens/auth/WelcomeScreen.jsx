import React from 'react';
import {
  View, Text, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity
} from 'react-native';
import { colors } from '../../utils/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.hero}>
        <View style={styles.iconContainer}>
          <Text style={styles.busEmoji}>🚌</Text>
        </View>
        <Text style={styles.appName}>BusTrack Driver</Text>
        <Text style={styles.tagline}>
          Your smart companion for{'\n'}real-time bus tracking
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '📍', text: 'Share live location with passengers' },
          { icon: '🗺️', text: 'Manage your routes efficiently' },
          { icon: '📊', text: 'Track your trip history' }
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
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  busEmoji: { fontSize: 60 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 12
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24
  },
  features: {
    paddingHorizontal: 32,
    marginBottom: 32
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    borderRadius: 12
  },
  featureIcon: { fontSize: 22, marginRight: 14 },
  featureText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500'
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12
  },
  primaryBtn: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white
  }
});