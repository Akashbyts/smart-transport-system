import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { loginDriver, sendOTP } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { isOTPVerifiedForPhone, setOTPVerified } from '../../storage/storage';
import { colors } from '../../utils/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      // First verify credentials with backend
      const res = await loginDriver(phone.trim(), password);
      if (!res.success) {
        Alert.alert('Error', res.message || 'Login failed');
        return;
      }

      // Check if OTP already verified for this phone on this device
      const otpVerified = await isOTPVerifiedForPhone(phone.trim());

      if (!otpVerified) {
        // First time on this device — send OTP
        await sendOTP(phone.trim());
        navigation.navigate('OTP', {
          phone: phone.trim(),
          purpose: 'login',
          loginData: res.data
        });
      } else {
        // OTP already verified on this device — login directly
        await login(
          { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
          res.data.driver
        );
      }
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Driver Login"
        subtitle="Welcome back!"
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
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🚌</Text>
          </View>

          <Input
            label="Phone Number"
            placeholder="+919876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.btn}
          />
          <Button
            title="Don't have an account? Register"
            onPress={() => navigation.navigate('Register')}
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
  iconWrap: { alignItems: 'center', marginVertical: 32 },
  icon: { fontSize: 64 },
  btn: { marginTop: 8, marginBottom: 12 }
});