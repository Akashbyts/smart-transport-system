import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../utils/colors';

export default function Button({
  title, onPress, loading = false,
  disabled = false, variant = 'primary',
  style, textStyle, icon
}) {
  const isDisabled = disabled || loading;
  const bgMap = {
    primary: colors.primary, secondary: colors.secondary,
    danger: colors.danger, outline: 'transparent', ghost: 'transparent'
  };
  const textMap = {
    outline: colors.primary, ghost: colors.gray600
  };
  const bg = bgMap[variant] || colors.primary;
  const tc = textMap[variant] || colors.white;
  const border = variant === 'outline' ? colors.primary : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, borderColor: border, opacity: isDisabled ? 0.6 : 1 }, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={tc} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[styles.text, { color: tc }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, borderWidth: 2
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: '700' }
});