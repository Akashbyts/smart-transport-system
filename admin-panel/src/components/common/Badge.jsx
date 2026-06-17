export default function Badge({ status, text }) {
  const colorMap = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    verified: 'bg-green-100 text-green-700 border-green-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    submitted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    suspended: 'bg-gray-100 text-gray-600 border-gray-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    not_submitted: 'bg-gray-100 text-gray-500 border-gray-200',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  const dotMap = {
    approved: 'bg-green-500',
    verified: 'bg-green-500',
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    submitted: 'bg-yellow-500',
    rejected: 'bg-red-500',
    suspended: 'bg-gray-400',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500',
    not_submitted: 'bg-gray-400',
    inactive: 'bg-gray-400'
  };

  const key = status?.toLowerCase() || 'inactive';
  const colorClass = colorMap[key] || colorMap.inactive;
  const dotClass = dotMap[key] || dotMap.inactive;
  const label = text || (key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '));

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}