import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utils/colors';

export default function Header({ title, subtitle, onBack, rightComponent }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightComponent && <View>{rightComponent}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  back: { marginRight: 12, padding: 4 },
  backText: { fontSize: 24, color: colors.white, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }
});