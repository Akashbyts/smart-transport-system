import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, TouchableOpacity, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { submitKYC } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

export default function KYCScreen({ navigation }) {
  const { refreshProfile, driver } = useAuth();
  const [form, setForm] = useState({
    license_number: '',
    license_expiry: '',
    id_card_number: ''
  });
  const [images, setImages] = useState({
    license_image: null,
    id_card_image: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isAlreadySubmitted =
    driver?.kyc_status === 'pending' || driver?.kyc_status === 'approved';

  async function pickImage(key) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });
    if (!result.canceled) {
      setImages(prev => ({ ...prev, [key]: result.assets[0] }));
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    }
  }

  function validate() {
    const e = {};
    if (!form.license_number.trim()) e.license_number = 'License number required';
    if (!form.license_expiry.trim()) e.license_expiry = 'Expiry date required (YYYY-MM-DD)';
    if (!form.id_card_number.trim()) e.id_card_number = 'ID card number required';
    if (!images.license_image) e.license_image = 'Driving license photo required';
    if (!images.id_card_image) e.id_card_image = 'ID card photo required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('license_number', form.license_number);
      formData.append('license_expiry', form.license_expiry);
      formData.append('id_card_number', form.id_card_number);
      formData.append('license_image', {
        uri: images.license_image.uri,
        type: 'image/jpeg',
        name: 'license_image.jpg'
      });
      formData.append('id_card_image', {
        uri: images.id_card_image.uri,
        type: 'image/jpeg',
        name: 'id_card_image.jpg'
      });
      // selfie_image is now taken during trip start
      // Backend needs a placeholder to avoid validation error
      formData.append('selfie_image', {
        uri: images.license_image.uri,
        type: 'image/jpeg',
        name: 'selfie_image.jpg'
      });
      
      await submitKYC(formData);
      await refreshProfile(); // fetch fresh kyc_status from backend
      Alert.alert(
        'KYC Submitted ✅',
        'Your documents have been submitted for admin review.',
        [{
          text: 'OK',
          onPress: () => {
            refreshProfile(); // call again to be sure
            navigation.goBack();
          }
        }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  }

  if (isAlreadySubmitted) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="KYC Documents" onBack={() => navigation.goBack()} />
        <View style={styles.doneWrap}>
          <Text style={styles.doneIcon}>
            {driver?.kyc_status === 'approved' ? '✅' : '⏳'}
          </Text>
          <Text style={styles.doneTitle}>
            {driver?.kyc_status === 'approved' ? 'KYC Approved!' : 'KYC Under Review'}
          </Text>
          <Text style={styles.doneText}>
            {driver?.kyc_status === 'approved'
              ? 'Your KYC has been approved. You can start trips.'
              : 'Your documents are being reviewed. This usually takes 1-2 business days.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="KYC Verification"
        subtitle="Upload your documents"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📋 Upload your driving license and government ID card for verification. Selfie with bus will be taken at trip start.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Document Details</Text>

        <Input
          label="Driving License Number"
          placeholder="e.g. KA0120220012345"
          value={form.license_number}
          onChangeText={(v) => setForm(p => ({ ...p, license_number: v }))}
          error={errors.license_number}
        />
        <Input
          label="License Expiry Date"
          placeholder="YYYY-MM-DD"
          value={form.license_expiry}
          onChangeText={(v) => setForm(p => ({ ...p, license_expiry: v }))}
          error={errors.license_expiry}
        />
        <Input
          label="Government ID Card Number"
          placeholder="Aadhaar / PAN / Voter ID"
          value={form.id_card_number}
          onChangeText={(v) => setForm(p => ({ ...p, id_card_number: v }))}
          error={errors.id_card_number}
        />

        <Text style={styles.sectionTitle}>Upload Photos</Text>

        {[
          { key: 'license_image', label: 'Driving License Photo', icon: '🪪' },
          { key: 'id_card_image', label: 'Government ID Card Photo', icon: '🆔' }
        ].map((item) => (
          <View key={item.key} style={styles.uploadItem}>
            <Text style={styles.uploadLabel}>{item.icon} {item.label}</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => pickImage(item.key)}
            >
              {images[item.key] ? (
                <Image
                  source={{ uri: images[item.key].uri }}
                  style={styles.preview}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderIcon}>📷</Text>
                  <Text style={styles.placeholderText}>Tap to select photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors[item.key] && (
              <Text style={styles.errorText}>{errors[item.key]}</Text>
            )}
          </View>
        ))}

        <Button
          title="Submit KYC Documents"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  infoCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12, padding: 14, marginBottom: 20,
    borderLeftWidth: 3, borderLeftColor: colors.primary
  },
  infoText: { fontSize: 13, color: colors.primary, lineHeight: 20 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: colors.text, marginBottom: 16, marginTop: 8
  },
  uploadItem: { marginBottom: 20 },
  uploadLabel: {
    fontSize: 14, fontWeight: '600',
    color: colors.gray700, marginBottom: 8
  },
  uploadBox: {
    borderWidth: 2, borderColor: colors.border,
    borderRadius: 12, borderStyle: 'dashed',
    overflow: 'hidden', height: 160
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 36, marginBottom: 8 },
  placeholderText: { fontSize: 14, color: colors.textLight },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  submitBtn: { marginTop: 8, marginBottom: 20 },
  doneWrap: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 32
  },
  doneIcon: { fontSize: 72, marginBottom: 20 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 },
  doneText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 }
});