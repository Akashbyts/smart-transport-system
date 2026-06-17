import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { getDashboardStats } from '../../api/trips.api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const mockTripData = [
  { day: 'Mon', trips: 12 },
  { day: 'Tue', trips: 19 },
  { day: 'Wed', trips: 15 },
  { day: 'Thu', trips: 22 },
  { day: 'Fri', trips: 28 },
  { day: 'Sat', trips: 18 },
  { day: 'Sun', trips: 10 }
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const res = await getDashboardStats();
      if (res.success) setStats(res.data.stats);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader message="Loading dashboard..." />;

  const statCards = [
    {
      label: 'Total Drivers',
      value: stats?.totalDrivers || 0,
      icon: '👨‍✈️',
      color: 'blue',
      sub: `${stats?.activeDrivers || 0} approved`,
      path: '/drivers'
    },
    {
      label: 'Total Passengers',
      value: stats?.totalPassengers || 0,
      icon: '👥',
      color: 'purple',
      sub: 'Registered users',
      path: null
    },
    {
      label: 'Active Buses',
      value: stats?.onlineBuses || 0,
      icon: '🚌',
      color: 'green',
      sub: `${stats?.totalBuses || 0} total buses`,
      path: '/buses'
    },
    {
      label: 'Trips Today',
      value: stats?.tripsToday || 0,
      icon: '📋',
      color: 'orange',
      sub: `${stats?.tripsTotal || 0} total trips`,
      path: '/trips'
    },
    {
      label: 'Active Trips',
      value: stats?.activeBuses || 0,
      icon: '📍',
      color: 'red',
      sub: 'Currently running',
      path: '/live'
    },
    {
      label: 'Total Routes',
      value: stats?.totalRoutes || 0,
      icon: '🗺️',
      color: 'teal',
      sub: 'Active routes',
      path: '/routes'
    }
  ];

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600'
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            onClick={() => card.path && navigate(card.path)}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700
              shadow-sm hover:shadow-md transition-all duration-200
              ${card.path ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {card.sub}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[card.color]}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Trips This Week">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockTripData}>
              <defs>
                <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="trips"
                stroke="#3b82f6"
                fill="url(#tripGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="System Overview">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Drivers', value: stats?.totalDrivers || 0 },
              { name: 'Buses', value: stats?.totalBuses || 0 },
              { name: 'Routes', value: stats?.totalRoutes || 0 },
              { name: 'Active', value: stats?.activeBuses || 0 },
              { name: 'Today', value: stats?.tripsToday || 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending KYC', icon: '⏳', path: '/drivers?tab=pending', color: 'yellow' },
            { label: 'Add Bus', icon: '🚌', path: '/buses', color: 'blue' },
            { label: 'Add Route', icon: '🗺️', path: '/routes', color: 'green' },
            { label: 'Live Map', icon: '📍', path: '/live', color: 'red' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl
                bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20
                border border-gray-100 dark:border-gray-700
                transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}