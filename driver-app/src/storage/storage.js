import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';

export async function saveTokens(accessToken, refreshToken) {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function saveDriverData(data) {
  await SecureStore.setItemAsync(STORAGE_KEYS.DRIVER_DATA, JSON.stringify(data));
}

export async function getDriverData() {
  const data = await SecureStore.getItemAsync(STORAGE_KEYS.DRIVER_DATA);
  return data ? JSON.parse(data) : null;
}

export async function clearStorage() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.DRIVER_DATA);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.OTP_VERIFIED);
}

// OTP verified flag — persists until app is uninstalled
export async function setOTPVerified(phone) {
  await SecureStore.setItemAsync(
    STORAGE_KEYS.OTP_VERIFIED,
    JSON.stringify({ verified: true, phone })
  );
}

export async function getOTPVerified() {
  const data = await SecureStore.getItemAsync(STORAGE_KEYS.OTP_VERIFIED);
  return data ? JSON.parse(data) : null;
}

export async function isOTPVerifiedForPhone(phone) {
  const data = await getOTPVerified();
  return data?.verified === true && data?.phone === phone;
}