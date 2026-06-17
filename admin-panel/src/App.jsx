import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DriversPage from './pages/drivers/DriversPage';
import BusesPage from './pages/buses/BusesPage';
import RoutesPage from './pages/routes/RoutesPage';
import TripsPage from './pages/trips/TripsPage';
import LiveTrackingPage from './pages/live/LiveTrackingPage';
import DriverDetailPage from './pages/drivers/DriverDetailPage';
import SettingsPage from './pages/settings/SettingsPage';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return admin ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={admin ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/drivers" element={
        <ProtectedRoute>
          <Layout><DriversPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/buses" element={
        <ProtectedRoute>
          <Layout><BusesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/routes" element={
        <ProtectedRoute>
          <Layout><RoutesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/trips" element={
        <ProtectedRoute>
          <Layout><TripsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/drivers/:driverId" element={
        <ProtectedRoute>
          <Layout><DriverDetailPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/live" element={
        <ProtectedRoute>
          <Layout><LiveTrackingPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/settings" element={
       <ProtectedRoute>
         <Layout><SettingsPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>

      
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
