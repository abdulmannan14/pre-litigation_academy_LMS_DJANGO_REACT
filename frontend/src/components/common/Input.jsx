export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-textDark">
          {label} {required && <span className="text-secondary">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-textDark bg-white placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
          error ? 'border-red-400' : 'border-[#E5DDD9]'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
