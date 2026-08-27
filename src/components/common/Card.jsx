export default function Card({ children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-xl bg-surface-raised shadow-lg shadow-black/20 ring-1 ring-slate-800 transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </div>
  );
}
