export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function formatTime(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function formatDuration(startedAt, endedAt) {
  if (!startedAt) return 'N/A';
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  const diffMins = Math.floor((end - start) / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function getKYCStatusLabel(status) {
  const map = {
    pending: 'Submitted',
    approved: 'Verified',
    rejected: 'Rejected',
    not_submitted: 'Not Submitted'
  };
  return map[status] || 'Not Submitted';
}

export function getKYCStatusColor(status) {
  const map = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    not_submitted: 'gray'
  };
  return map[status] || 'gray';
}