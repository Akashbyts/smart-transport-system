import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { sendOTP, registerDriver } from '../../api/auth.api';
import { colors } from '../../utils/colors';
import { validatePhone, validatePassword } from '../../utils/helpers';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters';
    if (!validatePhone(form.phone))
      e.phone = 'Enter a valid phone number e.g. +919876543210';
    if (!validatePassword(form.password))
      e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerDriver({
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password
      });
      await sendOTP(form.phone.trim());
      navigation.navigate('OTP', {
        phone: form.phone.trim(),
        purpose: 'register'
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Create Account"
        subtitle="Join as a BusTrack driver"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            error={errors.name}
          />
          <Input
            label="Phone Number"
            placeholder="+919876543210"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <Input
            label="Password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <View style={styles.note}>
            <Text style={styles.noteText}>
              📋 After registration you will need to submit KYC documents for admin approval before starting trips.
            </Text>
          </View>

          <Button
            title="Register & Send OTP"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />
          <Button
            title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: colors.text, marginBottom: 20, marginTop: 8
  },
  note: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12, padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3, borderLeftColor: colors.primary
  },
  noteText: { fontSize: 13, color: colors.primary, lineHeight: 20 },
  btn: { marginBottom: 12 }
});