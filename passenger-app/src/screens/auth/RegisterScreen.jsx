import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { registerPassenger, sendOTP } from '../../api/auth.api';
import { useTheme } from '../../context/ThemeContext';
import { validatePhone, validatePassword, validateEmail } from '../../utils/helpers';

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirmPassword: '', terms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(key, val) {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!validateEmail(form.email)) e.email = 'Enter a valid email address';
    if (!validatePhone(form.phone)) e.phone = 'Enter valid phone e.g. +919876543210';
    if (!validatePassword(form.password)) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.terms) e.terms = 'Please accept terms to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerPassenger({
        name: form.name.trim(),
        email: form.email.trim(),
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Create Account" subtitle="Join BusTrack today" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Full Name" placeholder="Enter your full name"
            value={form.name} onChangeText={v => update('name', v)} error={errors.name} />
          <Input label="Email Address" placeholder="your@email.com" keyboardType="email-address"
            value={form.email} onChangeText={v => update('email', v)} error={errors.email} />
          <Input label="Phone Number" placeholder="+919876543210" keyboardType="phone-pad"
            value={form.phone} onChangeText={v => update('phone', v)} error={errors.phone} />
          <Input label="Password" placeholder="Minimum 8 characters" secureTextEntry
            value={form.password} onChangeText={v => update('password', v)} error={errors.password} />
          <Input label="Confirm Password" placeholder="Re-enter password" secureTextEntry
            value={form.confirmPassword} onChangeText={v => update('confirmPassword', v)}
            error={errors.confirmPassword} />

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => update('terms', !form.terms)}
          >
            <View style={[styles.checkbox, { borderColor: theme.border }, form.terms && styles.checkboxChecked]}>
              {form.terms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.termsText, { color: theme.textSec }]}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

          <Button title="Register" onPress={handleRegister} loading={loading} style={styles.btn} />
          <Button title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')} variant="ghost" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center'
  },
  checkboxChecked: { backgroundColor: '#1E40AF', borderColor: '#1E40AF' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 13, lineHeight: 18 },
  error: { color: '#EF4444', fontSize: 12, marginBottom: 12 },
  btn: { marginTop: 8, marginBottom: 12 }
});