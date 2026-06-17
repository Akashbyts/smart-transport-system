import { useState, useEffect } from 'react';
import { getAllTrips } from '../../api/trips.api';
import apiClient from '../../api/client';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDateTime, formatDuration } from '../../utils/helpers';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripLocations, setTripLocations] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => { loadTrips(1); }, []);

  async function loadTrips(page = 1) {
    setLoading(true);
    try {
      const res = await getAllTrips(page);
      setTrips(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTripLocations(tripId) {
    setLoadingMap(true);
    try {
      const res = await apiClient.get('/api/admin/trips/' + tripId + '/locations');
      setTripLocations(res.data?.data || []);
    } catch {
      setTripLocations([]);
    } finally {
      setLoadingMap(false);
    }
  }

  function selectTrip(trip) {
    setSelectedTrip(trip);
    setTripLocations([]);
    loadTripLocations(trip.id);
  }

  // Build stop timeline from locations
  function buildStopTimeline(trip, locations) {
    if (!trip || !locations.length) return [];
    const stops = Array.isArray(trip.stops) ? trip.stops : [];
    if (stops.length === 0) return [];

    const totalDuration = trip.ended_at
      ? new Date(trip.ended_at) - new Date(trip.started_at)
      : null;

    return stops.map((stop, i) => {
      const fraction = stops.length > 1 ? i / (stops.length - 1) : 0;
      const locationIndex = Math.floor(fraction * (locations.length - 1));
      const location = locations[locationIndex];

      let estimatedTime = null;
      if (location) {
        estimatedTime = new Date(location.recorded_at);
      } else if (totalDuration && trip.started_at) {
        const offset = fraction * totalDuration;
        estimatedTime = new Date(new Date(trip.started_at).getTime() + offset);
      }

      return {
        stop,
        time: estimatedTime,
        location,
        isFirst: i === 0,
        isLast: i === stops.length - 1
      };
    });
  }

  const mapPositions = tripLocations
    .filter(l => l.latitude && l.longitude)
    .map(l => [parseFloat(l.latitude), parseFloat(l.longitude)]);

  const stopTimeline = selectedTrip
    ? buildStopTimeline(selectedTrip, tripLocations)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trips</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Trip history with route tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Trip List */}
        <div className="space-y-3">
          {loading ? (
            <Loader />
          ) : trips.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 dark:text-gray-400">No trips yet</p>
            </div>
          ) : (
            trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => selectTrip(trip)}
                className={'bg-white dark:bg-gray-800 rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ' +
                  (selectedTrip?.id === trip.id
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
                    : 'border-gray-100 dark:border-gray-700')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {trip.bus_number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {trip.route_name}
                    </p>
                  </div>
                  <Badge status={trip.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>👨‍✈️ {trip.driver_name}</span>
                  <span>🕐 {formatDateTime(trip.started_at)}</span>
                  <span>🗺️ Route #{trip.route_number}</span>
                  <span>⏱️ {formatDuration(trip.started_at, trip.ended_at)}</span>
                </div>
              </div>
            ))
          )}
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={loadTrips}
          />
        </div>

        {/* Trip Detail + Map */}
        <div className="space-y-4">
          {selectedTrip ? (
            <>
              {/* Map */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden" style={{ height: '300px' }}>
                {loadingMap ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : mapPositions.length > 0 ? (
                  <MapContainer
                    style={{ height: '100%', width: '100%' }}
                    center={mapPositions[0]}
                    zoom={13}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="© OpenStreetMap"
                    />
                    <Polyline
                      positions={mapPositions}
                      color="#2563eb"
                      weight={4}
                      opacity={0.8}
                    />
                    <Marker position={mapPositions[0]}>
                      <Popup>Start Point</Popup>
                    </Marker>
                    <Marker position={mapPositions[mapPositions.length - 1]}>
                      <Popup>End Point</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-4xl mb-2">🗺️</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No location data for this trip
                    </p>
                  </div>
                )}
              </div>

              {/* Stop Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Stop Timeline
                </h3>
                {stopTimeline.length > 0 ? (
                  <div className="space-y-0">
                    {stopTimeline.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ' +
                            (item.isFirst
                              ? 'bg-green-500'
                              : item.isLast
                              ? 'bg-red-500'
                              : 'bg-blue-500')}>
                            {item.isFirst ? 'S' : item.isLast ? 'E' : i}
                          </div>
                          {i < stopTimeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        {/* Stop info */}
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.stop}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.time
                              ? item.time.toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Time not available'}
                            {item.location && (
                              <span className="ml-2 text-blue-500">
                                {parseFloat(item.location.speed || 0).toFixed(0)} km/h
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      {Array.isArray(selectedTrip.stops) && selectedTrip.stops.length > 0
                        ? 'Loading stop times...'
                        : 'No stop data for this route'}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p className="text-5xl mb-4">👆</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Select a trip to view route
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Click any trip on the left to see the map and stop timeline
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}