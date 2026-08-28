import { Link } from 'react-router-dom';
import { Bot, Eye, Play, Star } from 'lucide-react';
import { truncate, formatNumber } from '../../utils/helpers';

export default function FeaturedGameCard({ game, rank }) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="group block overflow-hidden rounded-2xl bg-surface-raised shadow-lg shadow-black/20 ring-1 ring-slate-800 transition-all hover:-translate-y-1 hover:ring-primary/60"
    >
      <div className="relative aspect-[16/11] overflow-hidden sm:aspect-[16/10] lg:aspect-[16/10]">
        <img
          src={game.coverImage || 'https://placehold.co/400x250/1e293b/7c3aed?text=Game'}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-black text-lg">
              {rank}
            </span>
            {game.isAiGenerated && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-purple-600/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur"
                title="Created with AI assistance"
              >
                <Bot className="h-3 w-3" />
                AI
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold leading-tight text-white group-hover:text-primary-light">
              {game.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(game.views ?? 0)}
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {(game.rating ?? 0).toFixed(1)}
                <span className="text-slate-300">({game.ratingCount ?? 0})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 pt-3">
        <p className="line-clamp-2 min-h-[2.75rem] text-[15px] leading-relaxed text-slate-400">{truncate(game.description, 140)}</p>
        <div className="mt-3 flex items-center justify-between">
          {game.genre && (
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
              {game.genre}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-4 w-4" />
            Play Now
          </span>
        </div>
      </div>
    </Link>
  );
}