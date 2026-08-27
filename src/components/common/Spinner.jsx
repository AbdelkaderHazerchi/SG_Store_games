export default function Spinner({ size = 'h-10 w-10', className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-4 border-slate-700 border-t-primary ${size} ${className}`}
    />
  );
}
