import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Gamepad2, Pencil, Trash2, Upload } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import GameCard from '../components/common/GameCard';
import StarRating from '../components/common/StarRating';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import { uploadAvatar } from '../services/cloudinary';
import { LIMITS, ROUTES } from '../utils/constants';
import { formatDate, validateBio } from '../utils/helpers';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { getUserGames, deleteGame } = useGames();

  const [myGames, setMyGames] = useState(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let active = true;
    getUserGames(currentUser.uid)
      .then((games) => active && setMyGames(games))
      .catch(() => active && setMyGames([]));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.uid]);

  function startEditing() {
    setDisplayName(userProfile?.displayName || currentUser.displayName || '');
    setBio(userProfile?.bio || '');
    setEditing(true);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarUploading(true);
    try {
      const photoURL = await uploadAvatar(file);
      await updateUserProfile({ photoURL });
    } catch (err) {
      alert(err.message);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    const bioErr = validateBio(bio);
    if (bioErr) return setBioError(bioErr);
    if (!displayName.trim()) return setNameError('Display name is required.');

    setSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function confirmDelete() {
    await deleteGame(deleteTarget.id);
    setMyGames((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const totalPlays = (myGames ?? []).reduce((sum, g) => sum + (g.views ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header card */}
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-surface-raised p-6 ring-1 ring-slate-800 sm:flex-row sm:items-center">
        <div className="relative">
          {userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-primary"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 ring-2 ring-primary">
              <span className="text-3xl font-bold text-primary-light">
                {(userProfile?.displayName || currentUser.email)[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <label
            className={`absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-2 text-white shadow-lg transition-colors hover:bg-primary-dark ${
              avatarUploading ? 'animate-pulse' : ''
            }`}
            title="Upload photo (512×512)"
          >
            <Camera className="h-4 w-4" />
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="min-w-0 flex-1">
          {!editing ? (
            <>
              <h1 className="text-2xl font-bold text-white">
                {userProfile?.displayName || 'Unnamed Developer'}
              </h1>
              <p className="text-sm text-slate-500">@{userProfile?.username}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                {userProfile?.bio || 'No bio yet.'}
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </>
          ) : (
            <form onSubmit={saveProfile} className="w-full space-y-3">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={nameError}
              />
              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setBioError(validateBio(e.target.value));
                }}
                maxLength={LIMITS.MAX_BIO_LENGTH}
                error={bioError}
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={savingProfile}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center sm:grid-cols-1">
          <div>
            <span className="block text-2xl font-bold text-white">
              {userProfile?.publishedGamesCount ?? 0}
              <span className="text-sm font-normal text-slate-500">/{LIMITS.MAX_GAMES_PER_USER}</span>
            </span>
            <span className="text-xs text-slate-500">games</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-white">{totalPlays}</span>
            <span className="text-xs text-slate-500">plays</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400">
              Joined {formatDate(currentUser.metadata?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* My games */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">My Games</h2>
        <Link to={ROUTES.PUBLISH}>
          <Button size="sm">
            <Upload className="h-4 w-4" /> New Game
          </Button>
        </Link>
      </div>

      {myGames === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : myGames.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="You haven't published any games yet"
          description="Host your HTML5 game externally and share it with the world."
          action={
            <Link to={ROUTES.PUBLISH}>
              <Button>Publish Your First Game</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-3">
          {myGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-4 rounded-xl bg-surface-raised p-4 ring-1 ring-slate-800"
            >
              <img
                src={game.coverImage || 'https://placehold.co/200x113/1e293b/7c3aed?text=Game'}
                alt=""
                className="aspect-video w-28 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-white">{game.title}</h3>
                <div className="mt-1 flex items-center gap-3">
                  <StarRating value={game.rating ?? 0} size="h-3.5 w-3.5" count={game.ratingCount ?? 0} />
                  <span className="text-xs text-slate-500">{game.views ?? 0} views</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate(`/game/${game.id}/edit`)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(game)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Game?">
        <p className="text-sm text-slate-300">
          "<span className="font-medium text-white">{deleteTarget?.title}</span>" will be
          permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

