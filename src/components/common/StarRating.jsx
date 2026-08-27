import { Star } from 'lucide-react';

export default function StarRating({
  value = 0,
  onChange,
  size = 'h-5 w-5',
  showValue = false,
  count,
}) {
  const interactive = typeof onChange === 'function';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = value >= star - 0.25;
          const starEl = (
            <Star
              className={`${size} transition-colors ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-600'
              } ${interactive ? 'cursor-pointer hover:scale-110 hover:text-yellow-300' : ''}`}
            />
          );
          if (!interactive) return <span key={star}>{starEl}</span>;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`Rate ${star} stars`}
              onClick={() => onChange(star)}
            >
              {starEl}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-300">
          {Number(value).toFixed(1)}
        </span>
      )}
      {typeof count === 'number' && (
        <span className="text-xs text-slate-500">({count})</span>
      )}
    </div>
  );
}
