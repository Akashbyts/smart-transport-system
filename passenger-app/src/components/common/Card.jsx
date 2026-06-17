import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Card({ children, style }) {
  const theme = useTheme();
  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.card, borderColor: theme.border },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 16,
    borderWidth: 1, marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 3
  }
});