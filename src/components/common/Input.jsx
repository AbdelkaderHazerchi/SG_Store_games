export default function Input({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name || label;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`block w-full rounded-lg border bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
          error ? 'border-red-500' : 'border-slate-700'
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
