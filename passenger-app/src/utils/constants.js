export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const NEARBY_RADIUS_KM = parseFloat(process.env.EXPO_PUBLIC_NEARBY_RADIUS) || 3;
export const ALERT_RADIUS_METERS = 500;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'p_access_token',
  REFRESH_TOKEN: 'p_refresh_token',
  USER_DATA: 'p_user_data',
  OTP_VERIFIED: 'p_otp_verified',
  DARK_MODE: 'p_dark_mode',
  FAVORITES_CACHE: 'p_favorites_cache',
  ALERTS_CACHE: 'p_alerts_cache'
};