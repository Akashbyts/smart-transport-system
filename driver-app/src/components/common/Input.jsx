import React, { useState } from 'react';
import {
  View, TextInput, Text,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { colors } from '../../utils/colors';

export default function Input({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, error,
  multiline, numberOfLines, editable = true, style
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.wrapper, { borderColor }]}>
        <TextInput
          style={[
            styles.input,
            multiline && { height: (numberOfLines || 3) * 24, textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType || 'default'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eye}>
            <Text>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14, fontWeight: '600',
    color: colors.gray700, marginBottom: 6
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 14
  },
  input: { flex: 1, height: 52, fontSize: 15, color: colors.text },
  eye: { marginLeft: 8 },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 }
});