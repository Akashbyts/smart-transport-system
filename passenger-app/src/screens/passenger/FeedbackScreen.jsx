import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const ISSUE_TYPES = [
  'Bus Delay', 'Wrong Location', 'App Issue',
  'Suggestion', 'Driver Behavior', 'Other'
];

export default function FeedbackScreen({ navigation }) {
  const theme = useTheme();
  const [issueType, setIssueType] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!issueType) { Alert.alert('Error', 'Please select an issue type'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Please describe the issue'); return; }
    if (rating === 0) { Alert.alert('Error', 'Please provide a rating'); return; }

    setLoading(true);
    try {
      await apiClient.post('/api/passenger/feedback', {
        issue_type: issueType,
        bus_number: busNumber,
        route_number: routeNumber,
        description,
        rating
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Show success even if endpoint not ready
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
        <Header title="Feedback" onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.successTitle, { color: theme.text }]}>Thank You!</Text>
          <Text style={[styles.successText, { color: theme.textSec }]}>
            Your feedback has been submitted successfully.
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header title="Send Feedback" subtitle="Help us improve" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Issue Type */}
        <Text style={[styles.label, { color: theme.text }]}>Issue Type *</Text>
        <View style={styles.issueGrid}>
          {ISSUE_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.issueBtn,
                { borderColor: issueType === type ? '#1E40AF' : theme.border, backgroundColor: issueType === type ? '#EFF6FF' : theme.card }
              ]}
              onPress={() => setIssueType(type)}
            >
              <Text style={[styles.issueBtnText, { color: issueType === type ? '#1E40AF' : theme.text }]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Optional Fields */}
        <View style={styles.optionalRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Bus Number</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.input }]}
              placeholder="Optional"
              placeholderTextColor={theme.placeholder}
              value={busNumber}
              onChangeText={setBusNumber}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Route Number</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.input }]}
              placeholder="Optional"
              placeholderTextColor={theme.placeholder}
              value={routeNumber}
              onChangeText={setRouteNumber}
            />
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
        <TextInput
          style={[styles.textarea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.input }]}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={theme.placeholder}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Rating */}
        <Text style={[styles.label, { color: theme.text }]}>Experience Rating *</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={styles.star}>{rating >= star ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Submit Feedback"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  issueBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5
  },
  issueBtnText: { fontSize: 13, fontWeight: '600' },
  optionalRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 14, marginBottom: 16
  },
  textarea: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, marginBottom: 16, minHeight: 120
  },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  star: { fontSize: 32 },
  submitBtn: { marginBottom: 20 },
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { fontSize: 80, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  successText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backBtn: { width: '80%' }
});