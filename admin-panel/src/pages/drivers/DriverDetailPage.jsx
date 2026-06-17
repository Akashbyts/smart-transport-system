import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { approveDriver, rejectDriver } from '../../api/drivers.api';
import apiClient from '../../api/client';
import { API_URL } from '../../utils/constants';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatDateTime, getKYCStatusLabel } from '../../utils/helpers';

export default function DriverDetailPage() {
  const { driverId } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadDriver = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/drivers?limit=100');
      const allDrivers = res.data?.data || [];
      const found = allDrivers.find((d) => d.id === driverId) || null;
      setDriver(found);
      if (found) {
        try {
          const tripRes = await apiClient.get('/api/admin/trips?limit=10');
          const allTrips = tripRes.data?.data || [];
          setTrips(allTrips.filter((t) => t.driver_name === found.name));
        } catch {
          setTrips([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadDriver();
  }, [loadDriver]);

  async function handleApprove() {
    setActionLoading(true);
    try {
      await approveDriver(driverId);
      await loadDriver();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await rejectDriver(driverId, rejectReason);
      await loadDriver();
      setRejectModal(false);
      setRejectReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Extracted image renderer — avoids parser issues inside ternary ─────────
  function renderDocImage(imageFile, altText) {
    if (!imageFile) {
      return (
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl mb-2">📷</p>
            <p className="text-gray-400 text-xs">No image uploaded</p>
          </div>
        </div>
      );
    }
    const url = API_URL + '/uploads/' + imageFile;
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={altText}
          className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-gray-600 hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    );
  }

  // ─── Loading / Not Found ──────────────────────────────────────────────────────
  if (loading) return <Loader message="Loading driver details..." />;

  if (!driver) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">😔</p>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Driver not found</p>
        <button
          onClick={() => navigate('/drivers')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/drivers')}
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          ← Back to Drivers
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {driver.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{driver.phone}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge status={driver.status} />
          <Badge
            status={driver.kyc_status || 'not_submitted'}
            text={getKYCStatusLabel(driver.kyc_status)}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Driver Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Driver Information
            </h3>
            <div className="space-y-0">
              {[
                { label: 'Full Name', value: driver.name },
                { label: 'Phone', value: driver.phone },
                { label: 'Account Status', value: driver.status },
                { label: 'KYC Status', value: getKYCStatusLabel(driver.kyc_status) },
                { label: 'Registered', value: formatDateTime(driver.created_at) }
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right ml-4">
                    {item.value || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KYC Actions */}
          {driver.kyc_status === 'pending' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                KYC Actions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Review the documents and take action.
              </p>
              <div className="space-y-3">
                <button
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="w-full py-2.5 text-sm font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  {actionLoading ? 'Processing...' : 'Approve Driver'}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => setRejectModal(true)}
                  className="w-full py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  Reject Driver
                </button>
              </div>
            </div>
          )}

          {driver.kyc_status === 'approved' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
              <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                KYC Verified ✅
              </p>
              <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                Driver is approved and can start trips.
              </p>
            </div>
          )}

          {driver.kyc_status === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4">
              <p className="text-red-700 dark:text-red-400 font-semibold text-sm">
                KYC Rejected ❌
              </p>
              <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                Driver must resubmit documents.
              </p>
            </div>
          )}
        </div>

        {/* ── Right Column ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* KYC Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              KYC Documents
            </h3>

            {driver.license_number ? (
              <div className="space-y-5">

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'License Number', value: driver.license_number },
                    { label: 'License Expiry', value: driver.license_expiry },
                    { label: 'ID Card Number', value: driver.id_card_number },
                    { label: 'Submitted At', value: formatDateTime(driver.submitted_at) }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                        {item.label}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.value || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Document images — using extracted function */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Uploaded Photos
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Driving License
                      </p>
                      {renderDocImage(driver.license_image, 'Driving License')}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        ID Card
                      </p>
                      {renderDocImage(driver.id_card_image, 'ID Card')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-5xl mb-3">📄</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No KYC documents submitted yet
                </p>
              </div>
            )}
          </div>

          {/* Recent Trips */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Recent Trips
            </h3>
            {trips.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-5xl mb-3">📋</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No trips yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map((trip, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl">
                      🚌
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {trip.bus_number}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {trip.route_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge status={trip.status} />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(trip.started_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal — inline, no Modal component */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setRejectModal(false); setRejectReason(''); }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Reject Driver KYC
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Provide a reason for rejecting{' '}
              <strong className="text-gray-900 dark:text-white">
                {driver.name}
              </strong>.
            </p>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Rejection Reason *
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Documents are unclear or expired"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(false); setRejectReason(''); }}
                className="flex-1 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleReject}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}