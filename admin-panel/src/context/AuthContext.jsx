import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, adminLogout } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const data = localStorage.getItem('admin_data');
    if (token && data) {
      setAdmin(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await adminLogin(email, password);
    if (res.success) {
      localStorage.setItem('admin_token', res.data.accessToken);
      localStorage.setItem('admin_data', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
      return true;
    }
    return false;
  }

  async function logout() {
    try { await adminLogout(); } catch {}
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}