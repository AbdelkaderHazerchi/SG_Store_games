import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Search as SearchIcon, X, SlidersHorizontal, Star, Eye, Bot, ChevronDown } from 'lucide-react';
import GameCard from '../components/common/GameCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useGames } from '../context/GameContext';
import { GENRES, SORT_OPTIONS } from '../utils/constants';
import { formatNumber } from '../utils/helpers';

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5', label: '4.5+ Stars' },
  { value: '4', label: '4+ Stars' },
  { value: '3.5', label: '3.5+ Stars' },
  { value: '3', label: '3+ Stars' },
];

const VIEWS_OPTIONS = [
  { value: '', label: 'Any Views' },
  { value: '1000', label: '1K+' },
  { value: '10000', label: '10K+' },
  { value: '100000', label: '100K+' },
];

const AI_OPTIONS = [
  { value: '', label: 'All Games' },
  { value: 'true', label: 'AI-Assisted Only' },
  { value: 'false', label: 'Non-AI Only' },
];

export default function Search() {
  const { listGames } = useGames();
  const [games, setGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minViews, setMinViews] = useState('');
  const [aiFilter, setAiFilter] = useState('');
  const [sort, setSort] = useState('views');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listGames({ sort, max: 100 })
      .then((results) => {
        if (active) setGames(results);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const filtered = useMemo(() => {
    if (!games) return null;
    let results = games;

    if (query.trim()) {
      const term = query.toLowerCase().trim();
      results = results.filter(
        (g) =>
          g.title?.toLowerCase().includes(term) ||
          g.description?.toLowerCase().includes(term)
      );
    }
    if (genre) results = results.filter((g) => g.genre === genre);
    if (minRating) results = results.filter((g) => (g.rating ?? 0) >= Number(minRating));
    if (minViews) results = results.filter((g) => (g.views ?? 0) >= Number(minViews));
    if (aiFilter) results = results.filter((g) => String(g.isAiGenerated) === aiFilter);

    return results;
  }, [games, query, genre, minRating, minViews, aiFilter]);

  const hasActiveFilters = genre || minRating || minViews || aiFilter;

  function clearFilters() {
    setGenre('');
    setMinRating('');
    setMinViews('');
    setAiFilter('');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <SearchIcon className="h-8 w-8 text-primary" />
          Search Games
        </h1>
        <p className="mt-1 text-slate-400">Find browser games by name, genre, rating, views, and AI status.</p>
      </header>

      {/* Filters */}
      <section className="mb-8">
        <div className="rounded-xl bg-surface-raised p-5 ring-1 ring-slate-800">
          {/* Primary search */}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by game name…"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-base text-white placeholder-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Advanced filters toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                >
                  <option value="">All Genres</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                >
                  {RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Minimum Views</label>
                <select
                  value={minViews}
                  onChange={(e) => setMinViews(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                >
                  {VIEWS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">AI Status</label>
                <select
                  value={aiFilter}
                  onChange={(e) => setAiFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                >
                  {AI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Active filters:</span>
              {genre && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary-light">
                  {genre}
                  <button type="button" onClick={() => setGenre('')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary-light">
                  ⭐ {minRating}+
                  <button type="button" onClick={() => setMinRating('')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minViews && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary-light">
                  <Eye className="h-3 w-3" /> {formatNumber(Number(minViews))}+
                  <button type="button" onClick={() => setMinViews('')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {aiFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary-light">
                  {aiFilter === 'true' ? (
                    <>
                      <Bot className="h-3 w-3" /> AI-Assisted
                    </>
                  ) : (
                    'Non-AI'
                  )}
                  <button type="button" onClick={() => setAiFilter('')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section aria-labelledby="results-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="results-heading" className="text-xl font-bold text-white">
            {filtered === null
              ? 'Loading…'
              : `Found ${filtered.length} game${filtered.length !== 1 ? 's' : ''}`}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-primary-light hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {filtered === null ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No games match your criteria"
            description="Try adjusting your filters or search terms."
            action={
              <button onClick={clearFilters} className="text-primary-light hover:text-white">
                Clear all filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}