import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { sendOTP } from '../../api/auth.api';
import { useTheme } from '../../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!phone.trim()) { Alert.alert('Error', 'Enter your phone number'); return; }
    setLoading(true);
    try {
      await sendOTP(phone.trim());
      Alert.alert('OTP Sent', 'Enter the OTP to reset your password',
        [{ text: 'OK', onPress: () => navigation.navigate('OTP', { phone: phone.trim(), purpose: 'forgot' }) }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Forgot Password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: theme.textSec }]}>
          Enter your registered phone number. We will send an OTP to reset your password.
        </Text>
        <Input label="Phone Number" placeholder="+919876543210" keyboardType="phone-pad"
          value={phone} onChangeText={setPhone} />
        <Button title="Send OTP" onPress={handleSend} loading={loading} style={styles.btn} />
        <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="ghost" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  icon: { fontSize: 64, textAlign: 'center', marginTop: 32, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn: { marginBottom: 12 }
});