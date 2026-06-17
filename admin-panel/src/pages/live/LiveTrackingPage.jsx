import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { SOCKET_URL, API_URL } from '../../utils/constants';
import Card from '../../components/common/Card';

// Fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Bus icon
const busIcon = L.divIcon({
  html: `<div style="
    background:#1E40AF; color:white; border-radius:50%;
    width:36px; height:36px; display:flex;
    align-items:center; justify-content:center;
    font-size:18px; box-shadow:0 2px 8px rgba(0,0,0,0.3);
    border:2px solid white;">🚌</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function MapUpdater({ buses }) {
  const map = useMap();
  useEffect(() => {
    if (buses.length > 0) {
      const bounds = buses.map(b => [b.latitude, b.longitude]);
      if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [buses]);
  return null;
}

export default function LiveTrackingPage() {
  const [buses, setBuses] = useState({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('bus:location:update', (data) => {
      setBuses(prev => ({
        ...prev,
        [data.busId]: {
          ...data,
          lastUpdate: new Date()
        }
      }));
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const busArray = Object.values(buses);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Tracking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real-time bus locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {connected ? 'Live' : 'Disconnected'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            • {busArray.length} bus{busArray.length !== 1 ? 'es' : ''} online
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Online Buses', value: busArray.length, icon: '🚌' },
          { label: 'Socket Status', value: connected ? 'Connected' : 'Offline', icon: '🔌' },
          { label: 'Last Update', value: busArray.length > 0 ? 'Live' : 'Waiting...', icon: '🕐' }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="font-bold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <Card>
        <div className="rounded-xl overflow-hidden" style={{ height: '500px' }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            <MapUpdater buses={busArray} />
            {busArray.map((bus) => (
              <Marker
                key={bus.busId}
                position={[bus.latitude, bus.longitude]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-blue-700">Bus {bus.busId}</p>
                    <p>Trip: {bus.tripId}</p>
                    <p>Speed: {Math.round(bus.speed || 0)} km/h</p>
                    <p>Heading: {Math.round(bus.heading || 0)}°</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {new Date(bus.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {busArray.length === 0 && (
          <div className="mt-4 text-center py-4">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              No active buses right now. Buses will appear here when drivers start trips.
            </p>
          </div>
        )}
      </Card>

      {/* Bus List */}
      {busArray.length > 0 && (
        <Card title="Active Buses">
          <div className="space-y-3">
            {busArray.map((bus) => (
              <div
                key={bus.busId}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl">
                  🚌
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Bus {bus.busId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {bus.latitude?.toFixed(4)}, {bus.longitude?.toFixed(4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(bus.speed || 0)} km/h
                  </p>
                  <p className="text-xs text-green-500">● Live</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}