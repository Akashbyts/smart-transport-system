export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const LOCATION_INTERVAL = parseInt(process.env.EXPO_PUBLIC_LOCATION_INTERVAL) || 4000;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  DRIVER_DATA: 'driver_data',
  OTP_VERIFIED: 'otp_verified'
};

export const DRIVER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};