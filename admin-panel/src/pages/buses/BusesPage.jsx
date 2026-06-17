import { useState, useEffect } from 'react';
import { getAllBuses, createBus, updateBus, deleteBus } from '../../api/buses.api';
import { getAllRoutes } from '../../api/routes.api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/helpers';

const emptyForm = {
  bus_number: '', capacity: '',
  model: '', year: '', route_id: ''
};

export default function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editBus, setEditBus] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadData(1); }, []);

  async function loadData(page = 1) {
    setLoading(true);
    try {
      const [busRes, routeRes] = await Promise.all([
        getAllBuses(page),
        getAllRoutes(1, 100)
      ]);
      setBuses(busRes.data || []);
      setRoutes(routeRes.data || []);
      setPagination(busRes.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditBus(null);
    setForm(emptyForm);
    setErrors({});
    setModal(true);
  }

  function openEdit(bus) {
    setEditBus(bus);
    setForm({
      bus_number: bus.bus_number,
      capacity: bus.capacity?.toString(),
      model: bus.model || '',
      year: bus.year?.toString() || '',
      route_id: bus.route_id || ''
    });
    setErrors({});
    setModal(true);
  }

  function validate() {
    const e = {};
    if (!form.bus_number.trim()) e.bus_number = 'Bus number required';
    if (!form.capacity || isNaN(form.capacity)) e.capacity = 'Valid capacity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        bus_number: form.bus_number.trim(),
        capacity: parseInt(form.capacity),
        model: form.model.trim() || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        route_id: form.route_id || undefined
      };
      if (editBus) await updateBus(editBus.id, data);
      else await createBus(data);
      await loadData(pagination.page);
      setModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save bus');
    } finally {
      setSaving(false);
    }
  }

  async function toggleBusStatus(bus) {
    const action = bus.is_active ? 'deactivate' : 'reactivate';
    if (!confirm(action.charAt(0).toUpperCase() + action.slice(1) + ' bus ' + bus.bus_number + '?')) return;
    try {
      await updateBus(bus.id, { is_active: !bus.is_active });
      await loadData(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bus status');
    }
  }

  const filteredBuses = buses.filter(bus => {
    const matchSearch = bus.bus_number.toLowerCase().includes(search.toLowerCase()) ||
      (bus.model || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'active'
      ? bus.is_active
      : !bus.is_active;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your fleet — {buses.filter(b => b.is_active).length} active buses
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + Add Bus
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bus number or model..."
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Buses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Bus Cards */}
      {loading ? (
        <Loader />
      ) : filteredBuses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-4xl mb-3">🚌</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No buses found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {search ? 'Try a different search term' : 'Add your first bus to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuses.map((bus) => {
            const assignedRoute = routes.find(r => r.id === bus.route_id);
            return (
              <div
                key={bus.id}
                className={'bg-white dark:bg-gray-800 rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ' +
                  (bus.is_active
                    ? 'border-gray-100 dark:border-gray-700'
                    : 'border-red-100 dark:border-red-900/30 opacity-75')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={'w-12 h-12 rounded-xl flex items-center justify-center text-2xl ' +
                      (bus.is_active
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-gray-100 dark:bg-gray-700')}>
                      🚌
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {bus.bus_number}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {bus.model || 'Standard Bus'} {bus.year ? '• ' + bus.year : ''}
                      </p>
                    </div>
                  </div>
                  <Badge status={bus.is_active ? 'active' : 'inactive'} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Capacity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {bus.capacity} seats
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Route</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {assignedRoute
                        ? assignedRoute.route_number + ' — ' + assignedRoute.route_name
                        : 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Added</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(bus.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(bus)}
                    className="flex-1 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleBusStatus(bus)}
                    className={'flex-1 py-2 text-xs font-semibold rounded-xl transition-colors text-white ' +
                      (bus.is_active
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600')}
                  >
                    {bus.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={loadData}
      />

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editBus ? 'Edit Bus' : 'Add New Bus'}
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
                    Bus Number *
                  </label>
                  <input
                    type="text"
                    value={form.bus_number}
                    onChange={(e) => setForm(p => ({ ...p, bus_number: e.target.value }))}
                    placeholder="e.g. KA-01-F-1234"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.bus_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.bus_number}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Capacity (seats) *
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm(p => ({ ...p, capacity: e.target.value }))}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm(p => ({ ...p, model: e.target.value }))}
                    placeholder="e.g. Tata Starbus"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="e.g. 2022"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Route Assignment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Assign Route
                </label>
                {routes.length === 0 ? (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      No routes available.{' '}
                      <a href="/routes" className="underline font-semibold">
                        Add a route first →
                      </a>
                    </p>
                  </div>
                ) : (
                  <select
                    value={form.route_id}
                    onChange={(e) => setForm(p => ({ ...p, route_id: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No route assigned</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.route_number} — {route.route_name}
                      </option>
                    ))}
                  </select>
                )}
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
                  {saving ? 'Saving...' : editBus ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}