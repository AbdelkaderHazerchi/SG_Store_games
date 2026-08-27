import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import GameForm from '../components/games/GameForm';
import { useAuth } from '../context/AuthContext';
import { LIMITS, ROUTES } from '../utils/constants';
import Button from '../components/common/Button';

export default function PublishGame() {
  const { userProfile } = useAuth();
  const count = userProfile?.publishedGamesCount ?? 0;
  const atLimit = count >= LIMITS.MAX_GAMES_PER_USER;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Publish a Game</h1>
      <p className="mt-2 text-slate-400">
        Host your game externally (GitHub Pages, itch.io, Netlify) and share the HTTPS link
        here. {LIMITS.MAX_GAMES_PER_USER - count} of {LIMITS.MAX_GAMES_PER_USER} slots remaining.
      </p>

      {atLimit ? (
        <div className="mt-8 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-6 text-center">
          <p className="font-semibold text-yellow-300">Publishing limit reached</p>
          <p className="mt-1 text-sm text-slate-300">
            You have published {count}/{LIMITS.MAX_GAMES_PER_USER} games. Delete an existing game
            to publish a new one.
          </p>
          <Link to={ROUTES.PROFILE}>
            <Button variant="outline" className="mt-4">
              Manage My Games
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <GameForm />
        </div>
      )}
    </div>
  );
}
