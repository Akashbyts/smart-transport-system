import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveTokens, saveUserData, getAccessToken, clearStorage } from '../storage/storage';
import { getProfile } from '../api/passenger.api';
import { logoutPassenger } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const token = await getAccessToken();
      if (!token) { setLoading(false); return; }
      const res = await getProfile();
      if (res.success) {
        setUser(res.data.profile);
        setIsAuthenticated(true);
      }
    } catch {
      await clearStorage();
    } finally {
      setLoading(false);
    }
  }

  async function login(tokens, userData) {
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    await saveUserData(userData);
    try {
      const res = await getProfile();
      if (res.success) {
        setUser(res.data.profile);
      } else {
        setUser(userData);
      }
    } catch {
      setUser(userData);
    }
    setIsAuthenticated(true);
  }

  async function logout() {
    try { await logoutPassenger(); } catch {}
    await clearStorage();
    setUser(null);
    setIsAuthenticated(false);
  }

  async function refreshUser() {
    try {
      const res = await getProfile();
      if (res.success) {
        setUser(res.data.profile);
        await saveUserData(res.data.profile);
      }
    } catch {}
  }

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated,
      login, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}