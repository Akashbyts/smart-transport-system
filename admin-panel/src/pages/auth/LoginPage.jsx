import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const success = await login(form.email, form.password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)'
      }}
    >
      <div className="w-full max-w-md">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <span style={{ fontSize: '52px' }}>🚌</span>
          </div>
          <h1
            className="font-bold text-white mb-1"
            style={{ fontSize: '32px', letterSpacing: '-0.5px' }}
          >
            BusTrack
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.97)' }}
        >
          <h2
            className="font-bold text-gray-900 mb-1"
            style={{ fontSize: '22px' }}
          >
            Welcome back
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to manage your bus system
          </p>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl flex items-center gap-2"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
            >
              <span>⚠️</span>
              <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: '#374151' }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@bustracking.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#f9fafb',
                  color: '#111827',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: '#374151' }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: loading
                  ? '#93c5fd'
                  : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '15px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          BusTrack © 2024 — Real-time Bus Tracking System
        </p>
      </div>
    </div>
  );
}