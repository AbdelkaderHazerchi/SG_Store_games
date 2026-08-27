import { Link } from 'react-router-dom';
import { Bot, Eye, Play, UserRound } from 'lucide-react';
import StarRating from './StarRating';
import { truncate } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';

export default function GameCard({ game }) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="group block overflow-hidden rounded-xl bg-surface-raised shadow-lg shadow-black/20 ring-1 ring-slate-800 transition-all hover:-translate-y-1 hover:ring-primary/60"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={game.coverImage || 'https://placehold.co/400x225/1e293b/7c3aed?text=Game'}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {game.isAiGenerated && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-purple-600/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur"
            title="This game was created with AI assistance"
          >
            <Bot className="h-3 w-3" />
            AI
          </span>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs text-slate-200">
          <Eye className="h-3.5 w-3.5" />
          {game.views ?? 0}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-white group-hover:text-primary-light">
            {game.title}
          </h3>
          {game.genre && (
            <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
              {game.genre}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 min-h-[2.4rem] text-sm text-slate-400">
          {truncate(game.description, 110)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <StarRating value={game.rating ?? 0} size="h-3.5 w-3.5" count={game.ratingCount ?? 0} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-light opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-3 w-3" />
            Play now
          </span>
        </div>
      </div>
    </Link>
  );
}
