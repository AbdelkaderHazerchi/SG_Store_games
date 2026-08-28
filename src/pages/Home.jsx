import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Gamepad2, Shuffle } from 'lucide-react';
import GameCard from '../components/common/GameCard';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import FeaturedGameCard from '../components/common/FeaturedGameCard';
import { useGames } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

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
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [featured.length]);

  function scrollByCard(dir) {
    const el = trackRef.current;
    if (!el || !el.firstElementChild) return;
    const cardW = el.firstElementChild.getBoundingClientRect().width;
    const gap = 24;
    const max = el.scrollWidth - el.clientWidth;
    let next = el.scrollLeft + dir * (cardW + gap);
    // wrap around
    if (next < 0) next = max;
    else if (next > max + 8) next = 0;
    el.scrollTo({ left: next, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-surface-raised to-surface p-8 ring-1 ring-slate-800 sm:p-12">
        {/* Purple 3D geometric shapes — background decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* soft glow */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute -bottom-24 right-32 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

          {/* 3D cube — large */}
          <div className="absolute right-6 top-6 hidden h-36 w-36 rotate-[-14deg] rounded-2xl bg-gradient-to-br from-violet-400 via-purple-600 to-indigo-800 opacity-[0.22] shadow-[0_20px_60px_rgba(124,58,237,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] ring-1 ring-white/10 sm:block lg:right-10 lg:h-44 lg:w-44">
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/12 to-transparent" />
          </div>
          {/* cube — side face accent (isometric feel) */}
          <div className="absolute right-16 top-[5.5rem] hidden h-28 w-16 -skew-y-[18deg] rounded-lg bg-gradient-to-b from-purple-700/40 to-indigo-900/30 opacity-60 sm:block lg:right-20" />

          {/* 3D sphere */}
          <div className="absolute bottom-4 right-24 hidden h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-600 to-violet-800 opacity-[0.20] shadow-[0_12px_40px_rgba(168,85,247,0.4),inset_-10px_-12px_20px_rgba(0,0,0,0.35),inset_8px_8px_16px_rgba(255,255,255,0.22)] sm:block lg:h-28 lg:w-28" />

          {/* 3D pyramid (CSS clip) */}
          <div
            className="absolute right-[11rem] top-10 hidden h-20 w-20 rotate-[18deg] bg-gradient-to-br from-violet-500 to-purple-700 opacity-[0.18] shadow-[0_16px_30px_rgba(124,58,237,0.35)] sm:block lg:right-[13rem]"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
          {/* small floating cuboid */}
          <div className="absolute bottom-10 right-[19rem] hidden h-14 w-20 rotate-[10deg] rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-700/20 opacity-70 ring-1 ring-white/5 sm:block" />

          {/* tiny cube */}
          <div className="absolute right-56 top-20 hidden h-10 w-10 rotate-45 rounded-lg bg-gradient-to-br from-purple-400 to-violet-600 opacity-[0.14] shadow-lg sm:block" />
        </div>

        <div className="relative z-10">
          <h1 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
            Discover & Play <span className="text-primary-light">Browser Games</span>
          </h1>
          <p className="mt-3 max-w-lg text-slate-300">
            A zero-install arcade for HTML5 and WebGL games by indie and AI developers. Play instantly in your browser — no downloads.
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
        </div>
      </section>

      {/* Featured - Top 4 Popular Games — larger carousel with arrows */}
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
          <div className="relative">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByCard(-1)}
              className="absolute left-0 top-1/2 z-10 hidden -translate-x-3 -translate-y-1/2 rounded-full border border-slate-700 bg-surface-raised p-2.5 text-white shadow-xl transition hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none sm:flex lg:-translate-x-5"
              disabled={!canLeft && featured.length <= 2}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByCard(1)}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-3 rounded-full border border-slate-700 bg-surface-raised p-2.5 text-white shadow-xl transition hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none sm:flex lg:translate-x-5"
              disabled={!canRight && featured.length <= 2}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* arrows for mobile — overlay inside */}
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByCard(-1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/80 sm:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByCard(1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/80 sm:hidden"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-2 pt-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {featured.map((game, index) => (
                <div key={game.id} className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)]">
                  <FeaturedGameCard game={game} rank={index + 1} />
                </div>
              ))}
            </div>
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