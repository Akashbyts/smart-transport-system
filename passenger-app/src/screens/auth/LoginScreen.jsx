import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { loginPassenger, sendOTP } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isOTPVerifiedForPhone, setOTPVerified } from '../../storage/storage';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!phone.trim()) e.phone = 'Phone number required';
    if (!password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginPassenger(phone.trim(), password);
      if (!res.success) { Alert.alert('Error', res.message); return; }

      const otpVerified = await isOTPVerifiedForPhone(phone.trim());
      if (!otpVerified) {
        await sendOTP(phone.trim());
        navigation.navigate('OTP', {
          phone: phone.trim(),
          purpose: 'login',
          loginData: res.data
        });
      } else {
        await login(
          { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
          res.data.passenger
        );
      }
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Welcome Back" subtitle="Sign in to continue" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🚌</Text>
          </View>
          <Input label="Phone Number" placeholder="+919876543210" keyboardType="phone-pad"
            value={phone} onChangeText={setPhone} error={errors.phone} />
          <Input label="Password" placeholder="Enter your password" secureTextEntry
            value={password} onChangeText={setPassword} error={errors.password} />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Login" onPress={handleLogin} loading={loading} style={styles.btn} />
          <Button title="Don't have an account? Register"
            onPress={() => navigation.navigate('Register')} variant="ghost" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  iconWrap: { alignItems: 'center', marginVertical: 24 },
  icon: { fontSize: 64 },
  forgot: { color: '#1E40AF', fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: 20, marginTop: -8 },
  btn: { marginBottom: 12 }
});