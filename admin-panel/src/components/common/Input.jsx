export default function Input({
  label, value, onChange, placeholder,
  type = 'text', error, required,
  className = '', disabled, name
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`px-4 py-2.5 rounded-lg border text-sm transition-all
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600'
          }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}