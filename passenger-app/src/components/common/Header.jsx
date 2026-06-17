import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ title, subtitle, onBack, rightComponent, transparent }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const bg = transparent ? 'transparent' : theme.isDark ? '#0F172A' : '#1E40AF';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" />
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
  container: { paddingHorizontal: 16, paddingBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  back: { marginRight: 12, padding: 4 },
  backText: { fontSize: 24, color: '#fff', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }
});