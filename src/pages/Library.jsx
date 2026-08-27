import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Bookmark, Trash2 } from 'lucide-react';
import GameCard from '../components/common/GameCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { useGames } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

export default function Library() {
  const { currentUser } = useAuth();
  const { getLibrary, removeFromLibrary } = useGames();
  const [games, setGames] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    let active = true;
    getLibrary()
      .then((results) => active && setGames(results))
      .catch(() => active && setGames([]));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.uid]);

  async function handleRemove(gameId) {
    setRemoving(gameId);
    try {
      await removeFromLibrary(gameId);
      setGames((prev) => prev?.filter((g) => g.id !== gameId));
    } catch (err) {
      alert(err.message);
    } finally {
      setRemoving(null);
    }
  }

  if (games === null) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <Bookmark className="h-8 w-8 text-primary" />
            My Library
          </h1>
          <p className="mt-1 text-slate-400">
            {games.length} game{games.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>
        <Link to="/search">
          <Button variant="outline" size="sm">
            <Gamepad2 className="h-4 w-4" /> Discover More
          </Button>
        </Link>
      </header>

      {games.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Your library is empty"
          description="Save games you like by clicking 'Add to Library' on any game page."
          action={
            <Link to="/search">
              <Button>Browse Games</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <div key={game.id} className="relative group">
              <GameCard game={game} />
              <button
                onClick={() => handleRemove(game.id)}
                disabled={removing === game.id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-red-600/90 p-1.5 text-white hover:bg-red-500 disabled:opacity-50"
                aria-label="Remove from library"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}