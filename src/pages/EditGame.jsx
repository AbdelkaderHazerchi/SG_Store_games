import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import GameForm from '../components/games/GameForm';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useGames } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';

export default function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getGame } = useGames();
  const [game, setGame] = useState(undefined);

  useEffect(() => {
    let active = true;
    getGame(id).then((data) => active && setGame(data));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (game === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!game || !currentUser || game.ownerId !== currentUser.uid) {
    return (
      <EmptyState
        title="Cannot edit this game"
        description="The game does not exist or you do not own it."
        action={
          <Link to="/">
            <Button>Back to Store</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Edit Game</h1>
      <p className="mt-2 text-slate-400">Update details for "{game.title}".</p>
      <div className="mt-8">
        <GameForm existingGame={game} />
      </div>
    </div>
  );
}
