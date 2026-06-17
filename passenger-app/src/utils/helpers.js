export function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function formatTime(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatDateTime(d) {
  if (!d) return 'N/A';
  return formatDate(d) + ' ' + formatTime(d);
}

export function formatDuration(start, end) {
  if (!start) return 'N/A';
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
}

export function formatDistance(meters) {
  if (!meters && meters !== 0) return 'N/A';
  if (meters < 1000) return Math.round(meters) + ' m';
  return (meters / 1000).toFixed(1) + ' km';
}

export function formatETA(minutes) {
  if (!minutes && minutes !== 0) return 'N/A';
  if (minutes < 1) return 'Arriving';
  if (minutes < 60) return minutes + ' min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h + 'h ' + m + 'm';
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^\+?[1-9]\d{9,14}$/.test(phone);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function getStatusColor(status) {
  const map = {
    active: '#10B981', completed: '#3B82F6',
    cancelled: '#EF4444', pending: '#F59E0B',
    delayed: '#F59E0B', ontime: '#10B981'
  };
  return map[status] || '#6B7280';
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}