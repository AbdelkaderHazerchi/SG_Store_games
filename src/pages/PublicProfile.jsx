import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Gamepad2, User, ExternalLink, Star, Eye } from 'lucide-react';
import GameCard from '../components/common/GameCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import { formatDate } from '../utils/helpers';
export default function PublicProfile() {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const { getUserGames } = useGames();

  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    getDocs(q).then((snap) => {
      if (!active) return;
      if (snap.empty) {
        setNotFound(true);
        setLoading(false);
      } else {
        const userDoc = snap.docs[0];
        setProfile({ uid: userDoc.id, ...userDoc.data() });
        setLoading(false);
      }
    }).catch(() => {
      if (active) {
        setNotFound(true);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [username]);

  useEffect(() => {
    if (profile) {
      let active = true;
      getUserGames(profile.uid)
        .then((g) => active && setGames(g))
        .catch(() => active && setGames([]));
      return () => { active = false; };
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState
          icon={User}
          title="Developer not found"
          description="No developer exists with this username."
          action={
            <Link to="/">
              <Button>Back to Store</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.uid === profile.uid;
  const totalPlays = (games ?? []).reduce((sum, g) => sum + (g.views ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-10 flex flex-col items-start gap-6 rounded-2xl bg-surface-raised p-6 ring-1 ring-slate-800 sm:flex-row sm:items-center">
        <div className="relative">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="Avatar" className="h-24 w-24 rounded-full object-cover ring-2 ring-primary" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 ring-2 ring-primary">
              <span className="text-3xl font-bold text-primary-light">
                {(profile.displayName || profile.username)[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white">{profile.displayName || 'Unnamed Developer'}</h1>
          <p className="text-sm text-slate-500">@{profile.username}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            {profile.bio || 'No bio yet.'}
          </p>
          {isOwnProfile && (
            <Link to="/profile" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-light hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" />
              Edit Profile
            </Link>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center sm:grid-cols-1">
          <div>
            <span className="block text-2xl font-bold text-white">
              {profile.publishedGamesCount ?? 0}
              <span className="text-sm font-normal text-slate-500">/25</span>
            </span>
            <span className="text-xs text-slate-500">games</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">{totalPlays}</span>
            <span className="text-xs text-slate-500">plays</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400">
              Joined {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Games */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Games by @{profile.username}
        </h2>
      </div>

      {games === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : games.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="No games published yet"
          description={isOwnProfile ? 'Start sharing your creations!' : 'This developer hasn\'t published any games yet.'}
          action={
            isOwnProfile && (
              <Link to="/publish">
                <Button>Publish Your First Game</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

// Need to import collection, query, where, limit, getDocs from firebase/firestore
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';