import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { verifyOTP, sendOTP } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { setOTPVerified } from '../../storage/storage';

export default function OTPScreen({ navigation, route }) {
  const { phone, purpose, loginData } = route.params;
  const { login } = useAuth();
  const theme = useTheme();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleChange(val, i) {
    const next = [...otp];
    next[i] = val.replace(/[^0-9]/g, '');
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (!val && i > 0) inputs.current[i - 1]?.focus();
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length !== 6) { Alert.alert('Error', 'Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await verifyOTP(phone, code);
      if (res.success) {
        await setOTPVerified(phone);
        if (purpose === 'register') {
          Alert.alert('Success 🎉', 'Account created! Please login.',
            [{ text: 'Login', onPress: () => navigation.navigate('Login') }]);
        } else if (purpose === 'login' && loginData) {
          await login(
            { accessToken: loginData.accessToken, refreshToken: loginData.refreshToken },
            loginData.passenger
          );
        }
      } else {
        Alert.alert('Error', res.message || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (timer > 0) return;
    try {
      await sendOTP(phone);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Sent', 'New OTP sent to your phone');
    } catch { Alert.alert('Error', 'Failed to resend OTP'); }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Verify Phone" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.textSec }]}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={[styles.phone, { color: theme.text }]}>{phone}</Text>
        </Text>
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => inputs.current[i] = r}
              style={[styles.box, { borderColor: digit ? '#1E40AF' : theme.border, color: theme.text, backgroundColor: theme.input }]}
              value={digit}
              onChangeText={v => handleChange(v, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>
        <Button title="Verify" onPress={handleVerify} loading={loading} style={styles.btn} />
        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
          <Text style={[styles.resend, { color: timer > 0 ? theme.textSec : '#1E40AF' }]}>
            {timer > 0 ? 'Resend in ' + timer + 's' : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginTop: 32, lineHeight: 24, marginBottom: 40 },
  phone: { fontWeight: '700' },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  box: {
    width: 48, height: 56, borderWidth: 2, borderRadius: 12,
    fontSize: 22, fontWeight: '700'
  },
  btn: { width: '100%', marginBottom: 20 },
  resend: { fontSize: 15, fontWeight: '600' }
});