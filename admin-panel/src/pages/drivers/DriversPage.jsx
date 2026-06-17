import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllDrivers, getPendingDrivers, approveDriver, rejectDriver } from '../../api/drivers.api';
import { API_URL } from '../../utils/constants';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import { formatDateTime, getKYCStatusLabel } from '../../utils/helpers';

export default function DriversPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'all');
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, pages: 1, total: 0, limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [kycModal, setKycModal] = useState(false);

  useEffect(() => {
    loadDrivers(1);
  }, [tab]);

  async function loadDrivers(page = 1) {
  setLoading(true);
  try {
    const res = tab === 'pending'
      ? await getPendingDrivers(page)
      : await getAllDrivers(page);

    // Handle both array and paginated response
    const data = res.data;
    if (Array.isArray(data)) {
      setDrivers(data);
      setPagination({ page: 1, pages: 1, total: data.length, limit: 20 });
    } else {
      setDrivers(data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0, limit: 20 });
    }
  } catch (err) {
    console.error('loadDrivers error:', err);
  } finally {
    setLoading(false);
  }
}

  async function handleApprove(driver) {
    setActionLoading(true);
    try {
      await approveDriver(driver.id);
      await loadDrivers(pagination.page);
      setKycModal(false);
      setSelectedDriver(null);
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
      await rejectDriver(selectedDriver.id, rejectReason);
      await loadDrivers(pagination.page);
      setRejectModal(false);
      setKycModal(false);
      setSelectedDriver(null);
      setRejectReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  }

  function openKYCModal(driver) {
    setSelectedDriver(driver);
    setKycModal(true);
  }

  function closeKYCModal() {
    setKycModal(false);
    setSelectedDriver(null);
  }

  function openRejectModal() {
    setKycModal(false);
    setRejectModal(true);
  }

  function closeRejectModal() {
    setRejectModal(false);
    setRejectReason('');
  }

  const columns = [
    {
      header: 'Driver',
      render: (row) => (
        <div
          className="cursor-pointer"
          onClick={() => navigate('/drivers/' + row.id)}
        >
          <p className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {row.name}
          </p>
          <p className="text-xs text-gray-500">{row.phone}</p>
        </div>
      )
    },
    {
      header: 'Account Status',
      render: (row) => React.createElement(Badge, { status: row.status })
    },
    {
      header: 'KYC Status',
      render: (row) => React.createElement(Badge, {
        status: row.kyc_status || 'not_submitted',
        text: getKYCStatusLabel(row.kyc_status)
      })
    },
    {
      header: 'Registered',
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDateTime(row.created_at)}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.kyc_status === 'pending' && (
            <button
              onClick={() => openKYCModal(row)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Review KYC
            </button>
          )}
          {row.kyc_status === 'approved' && row.status !== 'approved' && (
            <button
              onClick={() => handleApprove(row)}
              className="px-3 py-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Approve
            </button>
          )}
          {row.status === 'approved' && (
            <span className="text-xs text-green-600 font-semibold">
              Active
            </span>
          )}
        </div>
      )
    }
  ];

  // ─── KYC Modal Content ──────────────────────────────────────────────────────

  function renderKYCModalContent() {
    if (!selectedDriver) return null;

    const docItems = [
      { label: 'Driving License', key: 'license_image' },
      { label: 'ID Card', key: 'id_card_image' }
    ];

    const infoItems = [
      { label: 'Name', value: selectedDriver.name },
      { label: 'Phone', value: selectedDriver.phone },
      { label: 'License No.', value: selectedDriver.license_number || 'N/A' },
      { label: 'License Expiry', value: selectedDriver.license_expiry || 'N/A' },
      { label: 'ID Card No.', value: selectedDriver.id_card_number || 'N/A' },
      { label: 'Submitted', value: formatDateTime(selectedDriver.submitted_at) }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Driver Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {infoItems.map((item, i) => (
              <div key={i}>
                <p className="text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Uploaded Documents
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {docItems.map((doc) => {
              const imageFile = selectedDriver[doc.key];
              const imageUrl = imageFile
                ? API_URL + '/uploads/' + imageFile
                : null;
              return (
                <div key={doc.key}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {doc.label}
                  </p>
                  {imageUrl ? (
                    <a href={imageUrl} target="_blank" rel="noreferrer">
                      <img
                        src={imageUrl}
                        alt={doc.label}
                        className="w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-600 hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            disabled={actionLoading}
            onClick={() => handleApprove(selectedDriver)}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl transition-colors"
          >
            {actionLoading ? 'Processing...' : 'Approve Driver'}
          </button>
          <button
            onClick={openRejectModal}
            className="flex-1 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            Reject Driver
          </button>
        </div>
      </div>
    );
  }

  // ─── Reject Modal Content ───────────────────────────────────────────────────

  function renderRejectModalContent() {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Please provide a reason for rejecting{' '}
          <strong className="text-gray-900 dark:text-white">
            {selectedDriver?.name}
          </strong>
          's KYC application.
        </p>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Documents are unclear or expired"
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={closeRejectModal}
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
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Drivers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage and verify driver accounts
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'All Drivers' },
          { key: 'pending', label: 'Pending KYC' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ' +
              (tab === t.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <div>
            <Table
              columns={columns}
              data={drivers}
              emptyMessage="No drivers found"
            />
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => loadDrivers(p)}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={kycModal}
        onClose={closeKYCModal}
        title="Review KYC Documents"
        size="lg"
      >
        {renderKYCModalContent()}
      </Modal>

      <Modal
        isOpen={rejectModal}
        onClose={closeRejectModal}
        title="Reject Driver KYC"
        size="sm"
      >
        {renderRejectModalContent()}
      </Modal>
    </div>
  );
}