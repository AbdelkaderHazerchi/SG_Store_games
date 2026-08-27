import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Shuffle } from 'lucide-react';
import GameCard from '../components/common/GameCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import FeaturedGameCard from '../components/common/FeaturedGameCard';
import { useGames } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';

export default function Home() {
  const { listGames, listRandomGames } = useGames();
  const { currentUser } = useAuth();
  const [games, setGames] = useState(null);
  const [randomGames, setRandomGames] = useState([]);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    listGames({ sort: 'views', max: 22 })
      .then((results) => active && setGames(results))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  async function loadRandom() {
    setLoadingRandom(true);
    try {
      setRandomGames(await listRandomGames(4));
    } catch {
      /* ignore */
    } finally {
      setLoadingRandom(false);
    }
  }

  useEffect(() => {
    loadRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featured = games?.slice(0, 4) ?? [];
  const popular = games?.slice(4) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-surface-raised to-surface p-8 ring-1 ring-slate-800 sm:p-12">
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
          Discover & Play <span className="text-primary-light">Browser Games</span>
        </h1>
        <p className="mt-3 max-w-lg text-slate-300">
          A zero-install arcade for HTML5 and WebGL games by indie and AI developers.
          Play instantly in your browser — no downloads.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/search">
            <Button size="lg" variant="outline">
              Search Games
            </Button>
          </Link>
          <Link to={currentUser ? ROUTES.PUBLISH : ROUTES.REGISTER}>
            <Button size="lg">
              {currentUser ? 'Publish Your Game' : 'Become a Developer'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured - Top 4 Popular Games (larger cards) */}
      {featured.length > 0 && (
        <section className="mb-12" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2 text-2xl font-bold text-white">
              <Gamepad2 className="h-6 w-6 text-primary" />
              Most Popular
            </span>
            <Link to="/search?sort=views" className="text-sm font-medium text-primary-light hover:text-white transition-colors">
              View all →
            </Link>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((game, index) => (
              <FeaturedGameCard key={game.id} game={game} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Random Picks */}
      <section className="mt-16" aria-labelledby="random-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="random-heading" className="flex items-center gap-2 text-xl font-bold text-white">
            <Shuffle className="h-5 w-5 text-primary-light" />
            Random Picks
          </h2>
          <button
            onClick={loadRandom}
            disabled={loadingRandom}
            className="text-sm font-medium text-primary-light transition-colors hover:text-white disabled:opacity-50"
          >
            {loadingRandom ? 'Rolling…' : 'Shuffle'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loadingRandom && !randomGames.length
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[16/13] animate-pulse rounded-xl bg-surface-raised" />
              ))
            : randomGames.map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </section>
    </div>
  );
}