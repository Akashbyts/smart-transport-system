export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function formatTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
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

export function validatePhone(phone) {
  return /^\+?[1-9]\d{9,14}$/.test(phone);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function getStatusColor(status) {
  const map = {
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
    suspended: '#6B7280',
    active: '#10B981',
    completed: '#3B82F6',
    cancelled: '#EF4444'
  };
  return map[status] || '#6B7280';
}