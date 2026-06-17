import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Input({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, error,
  multiline, numberOfLines, editable = true, style
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const border = error ? '#EF4444' : focused ? '#1E40AF' : theme.border;

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View style={[styles.wrapper, { borderColor: border, backgroundColor: theme.input }]}>
        <TextInput
          style={[styles.input, { color: theme.text }, multiline && { height: (numberOfLines || 3) * 24, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
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
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ marginLeft: 8 }}>
            <Text>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14
  },
  input: { flex: 1, height: 52, fontSize: 15 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 }
});