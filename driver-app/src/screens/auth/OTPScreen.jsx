import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  Alert, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { verifyOTP, sendOTP } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { setOTPVerified } from '../../storage/storage';
import { colors } from '../../utils/colors';

export default function OTPScreen({ navigation, route }) {
  const { phone, purpose, loginData } = route.params;
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleOtpChange(value, index) {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (!value && index > 0) inputs.current[index - 1]?.focus();
  }

  async function handleVerify() {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOTP(phone, otpCode);
      if (res.success) {
        // Save OTP verified flag for this device
        await setOTPVerified(phone);

        if (purpose === 'register') {
          Alert.alert(
            'Account Created! 🎉',
            'Your account has been created. Please login.',
            [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
          );
        } else if (purpose === 'login' && loginData) {
          // Complete login after OTP verified
          await login(
            { accessToken: loginData.accessToken, refreshToken: loginData.refreshToken },
            loginData.driver
          );
        }
      } else {
        Alert.alert('Error', res.message || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    try {
      await sendOTP(phone);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('OTP Sent', 'A new OTP has been sent');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Verify Phone" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputs.current[index] = ref)}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              value={digit}
              onChangeText={(v) => handleOtpChange(v, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <Button
          title="Verify OTP"
          onPress={handleVerify}
          loading={loading}
          style={styles.btn}
        />

        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text style={[styles.resend, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  subtitle: {
    fontSize: 16, color: colors.textSecondary,
    textAlign: 'center', marginTop: 32,
    lineHeight: 24, marginBottom: 40
  },
  phone: { fontWeight: '700', color: colors.text },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  otpBox: {
    width: 48, height: 56,
    borderWidth: 2, borderColor: colors.border,
    borderRadius: 12, fontSize: 22,
    fontWeight: '700', color: colors.text,
    backgroundColor: colors.white
  },
  otpBoxFilled: { borderColor: colors.primary },
  btn: { width: '100%', marginBottom: 20 },
  resend: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  resendDisabled: { color: colors.textLight }
});