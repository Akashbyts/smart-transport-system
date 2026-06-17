import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';

export async function saveTokens(access, refresh) {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function saveUserData(data) {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
}

export async function getUserData() {
  const d = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
  return d ? JSON.parse(d) : null;
}

export async function clearStorage() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
}

export async function setOTPVerified(phone) {
  await SecureStore.setItemAsync(
    STORAGE_KEYS.OTP_VERIFIED,
    JSON.stringify({ verified: true, phone })
  );
}

export async function isOTPVerifiedForPhone(phone) {
  const d = await SecureStore.getItemAsync(STORAGE_KEYS.OTP_VERIFIED);
  if (!d) return false;
  const parsed = JSON.parse(d);
  return parsed?.verified === true && parsed?.phone === phone;
}

export async function saveDarkMode(val) {
  await SecureStore.setItemAsync(STORAGE_KEYS.DARK_MODE, String(val));
}

export async function getDarkMode() {
  const val = await SecureStore.getItemAsync(STORAGE_KEYS.DARK_MODE);
  return val === 'true';
}