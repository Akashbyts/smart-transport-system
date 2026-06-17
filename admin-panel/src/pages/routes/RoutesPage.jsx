import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from '../../api/routes.api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const emptyForm = {
  route_number: '', route_name: '',
  start_location: '', end_location: '',
  stops: '', estimated_duration_minutes: ''
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadRoutes(); }, []);

  async function loadRoutes() {
    setLoading(true);
    try {
      const res = await getAllRoutes(1, 100);
      setRoutes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditRoute(null);
    setForm(emptyForm);
    setErrors({});
    setModal(true);
  }

  function openEdit(route) {
    setEditRoute(route);
    setForm({
      route_number: route.route_number,
      route_name: route.route_name,
      start_location: route.start_location,
      end_location: route.end_location,
      stops: Array.isArray(route.stops) ? route.stops.join(', ') : '',
      estimated_duration_minutes: route.estimated_duration_minutes?.toString() || ''
    });
    setErrors({});
    setModal(true);
  }

  function validate() {
    const e = {};
    if (!form.route_number.trim()) e.route_number = 'Route number required';
    if (!form.route_name.trim()) e.route_name = 'Route name required';
    if (!form.start_location.trim()) e.start_location = 'Start location required';
    if (!form.end_location.trim()) e.end_location = 'End location required';
    if (!form.stops.trim()) e.stops = 'At least one stop required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const stopsArray = form.stops.split(',').map(s => s.trim()).filter(Boolean);
      const data = {
        route_number: form.route_number.trim(),
        route_name: form.route_name.trim(),
        start_location: form.start_location.trim(),
        end_location: form.end_location.trim(),
        stops: stopsArray,
        estimated_duration_minutes: form.estimated_duration_minutes
          ? parseInt(form.estimated_duration_minutes)
          : undefined
      };
      if (editRoute) await updateRoute(editRoute.id, data);
      else await createRoute(data);
      await loadRoutes();
      setModal(false);
      setEditRoute(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save route');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(route) {
    if (!confirm('Delete route ' + route.route_name + '? This will deactivate it.')) return;
    try {
      await deleteRoute(route.id);
      await loadRoutes();
      if (selectedRoute?.id === route.id) setSelectedRoute(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete route');
    }
  }

  // Get waypoints from route for map display
  function getRouteWaypoints(route) {
    if (route.waypoints && Array.isArray(route.waypoints) && route.waypoints.length > 0) {
      return route.waypoints.map(p => [p.latitude, p.longitude]);
    }
    return null;
  }

  const filteredRoutes = routes.filter(r =>
    r.route_name.toLowerCase().includes(search.toLowerCase()) ||
    r.route_number.toLowerCase().includes(search.toLowerCase()) ||
    r.start_location.toLowerCase().includes(search.toLowerCase()) ||
    r.end_location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Routes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {routes.filter(r => r.is_active).length} active routes
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + Add Route
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search routes by name, number, or location..."
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Route List */}
        <div className="space-y-3">
          {loading ? (
            <Loader />
          ) : filteredRoutes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-gray-500 dark:text-gray-400">No routes found</p>
            </div>
          ) : (
            filteredRoutes.map(route => (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={'bg-white dark:bg-gray-800 rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ' +
                  (selectedRoute?.id === route.id
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
                    : 'border-gray-100 dark:border-gray-700')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                        {route.route_number}
                      </span>
                      <Badge status={route.is_active ? 'active' : 'inactive'} />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {route.route_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {route.start_location} → {route.end_location}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        {Array.isArray(route.stops) ? route.stops.length : 0} stops
                      </span>
                      {route.estimated_duration_minutes && (
                        <span>~{route.estimated_duration_minutes} min</span>
                      )}
                      {getRouteWaypoints(route) && (
                        <span className="text-green-500">📍 Map data available</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(route)}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(route)}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Stops preview */}
                {Array.isArray(route.stops) && route.stops.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {route.stops.slice(0, 4).map((stop, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg"
                      >
                        {stop}
                      </span>
                    ))}
                    {route.stops.length > 4 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-0.5">
                        +{route.stops.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Map Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6" style={{ height: '500px' }}>
          {selectedRoute ? (
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {selectedRoute.route_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedRoute.start_location} → {selectedRoute.end_location}
                </p>
              </div>

              {getRouteWaypoints(selectedRoute) ? (
                <MapContainer
                  style={{ flex: 1 }}
                  center={getRouteWaypoints(selectedRoute)[0]}
                  zoom={13}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />
                  <Polyline
                    positions={getRouteWaypoints(selectedRoute)}
                    color="#2563eb"
                    weight={4}
                    opacity={0.8}
                  />
                  {getRouteWaypoints(selectedRoute).map((pos, i) => (
                    <Marker key={i} position={pos}>
                      <Popup>
                        {i === 0
                          ? 'Start: ' + selectedRoute.start_location
                          : i === getRouteWaypoints(selectedRoute).length - 1
                          ? 'End: ' + selectedRoute.end_location
                          : 'Stop ' + i}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-4xl mb-3">🗺️</p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                    No map data for this route
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 text-center px-4">
                    Map data is available for routes drawn by drivers using the Draw Route feature in the driver app.
                  </p>
                  <div className="mt-4 px-4 w-full">
                    <div className="space-y-2">
                      {Array.isArray(selectedRoute.stops) && selectedRoute.stops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-xl">
                          <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ' +
                            (i === 0 ? 'bg-green-500' : i === selectedRoute.stops.length - 1 ? 'bg-red-500' : 'bg-blue-500')}>
                            {i === 0 ? 'S' : i === selectedRoute.stops.length - 1 ? 'E' : i}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-5xl mb-4">👆</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Select a route to preview
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Click any route on the left
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editRoute ? 'Edit Route' : 'Add New Route'}
              </h2>
              <button
                onClick={() => setModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Route Number *
                  </label>
                  <input
                    type="text"
                    value={form.route_number}
                    onChange={(e) => setForm(p => ({ ...p, route_number: e.target.value }))}
                    placeholder="e.g. RT-01"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.route_number && <p className="text-red-500 text-xs mt-1">{errors.route_number}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={form.estimated_duration_minutes}
                    onChange={(e) => setForm(p => ({ ...p, estimated_duration_minutes: e.target.value }))}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  value={form.route_name}
                  onChange={(e) => setForm(p => ({ ...p, route_name: e.target.value }))}
                  placeholder="e.g. City Center to Airport"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.route_name && <p className="text-red-500 text-xs mt-1">{errors.route_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Location *
                  </label>
                  <input
                    type="text"
                    value={form.start_location}
                    onChange={(e) => setForm(p => ({ ...p, start_location: e.target.value }))}
                    placeholder="e.g. City Center"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.start_location && <p className="text-red-500 text-xs mt-1">{errors.start_location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    End Location *
                  </label>
                  <input
                    type="text"
                    value={form.end_location}
                    onChange={(e) => setForm(p => ({ ...p, end_location: e.target.value }))}
                    placeholder="e.g. Airport"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.end_location && <p className="text-red-500 text-xs mt-1">{errors.end_location}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stops (comma separated) *
                </label>
                <input
                  type="text"
                  value={form.stops}
                  onChange={(e) => setForm(p => ({ ...p, stops: e.target.value }))}
                  placeholder="City Center, Mall Road, Hospital, Airport"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.stops && <p className="text-red-500 text-xs mt-1">{errors.stops}</p>}
                <p className="text-xs text-gray-400 mt-1">Separate each stop with a comma</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  {saving ? 'Saving...' : editRoute ? 'Update Route' : 'Add Route'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}