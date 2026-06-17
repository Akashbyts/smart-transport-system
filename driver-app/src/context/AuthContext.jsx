import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  saveTokens, saveDriverData,
  getAccessToken, clearStorage
} from '../storage/storage';
import { getDriverProfile } from '../api/driver.api';
import { logoutDriver } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { loadStoredDriver(); }, []);

  async function loadStoredDriver() {
    try {
      const token = await getAccessToken();
      if (!token) { setLoading(false); return; }
      const profile = await getDriverProfile();
      if (profile.success) {
        setDriver(profile.data.profile);
        setIsAuthenticated(true);
      }
    } catch {
      await clearStorage();
    } finally {
      setLoading(false);
    }
  }

  async function login(tokens, driverData) {
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    await saveDriverData(driverData);
    // Always fetch fresh profile after login to get kyc_status
    try {
      const profile = await getDriverProfile();
      if (profile.success) {
        setDriver(profile.data.profile);
        await saveDriverData(profile.data.profile);
      } else {
        setDriver(driverData);
      }
    } catch {
      setDriver(driverData);
    }
    setIsAuthenticated(true);
  }

  async function logout() {
    try { await logoutDriver(); } catch {}
    await clearStorage();
    setDriver(null);
    setIsAuthenticated(false);
  }

  async function refreshProfile() {
    try {
      const profile = await getDriverProfile();
      if (profile.success) {
        setDriver(profile.data.profile);
        await saveDriverData(profile.data.profile);
        return profile.data.profile;
      }
    } catch {}
  }

  return (
    <AuthContext.Provider value={{
      driver, loading, isAuthenticated,
      login, logout, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}