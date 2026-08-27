export default function Textarea({
  label,
  error,
  hint,
  maxLength,
  value = '',
  className = '',
  rows = 4,
  id,
  ...props
}) {
  const fieldId = id || props.name || label;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between">
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        {maxLength && (
          <span
            className={`text-xs ${
              value.length > maxLength ? 'text-red-400' : 'text-slate-500'
            }`}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        className={`block w-full resize-y rounded-lg border bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
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
