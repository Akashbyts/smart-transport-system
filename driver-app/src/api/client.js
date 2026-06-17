import axios from 'axios';
import { API_URL } from '../utils/constants';
import {
  getAccessToken, getRefreshToken,
  saveTokens, clearStorage
} from '../storage/storage';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(
          `${API_URL}/api/auth/refresh?role=driver`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        await saveTokens(accessToken, newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        await clearStorage();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;