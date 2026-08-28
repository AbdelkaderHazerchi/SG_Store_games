import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bot,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Flag,
  Pencil,
  StickyNote,
  Trash2,
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import StarRating from '../components/common/StarRating';
import Textarea from '../components/common/Textarea';
import EmptyState from '../components/common/EmptyState';
import { useGames } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { REPORT_REASONS } from '../utils/constants';
import { timeAgo } from '../utils/helpers';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getGame, incrementViews, rateGame, getUserRating, createReport, deleteGame, addToLibrary, removeFromLibrary, isInLibrary } =
    useGames();

  const [game, setGame] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [myRating, setMyRating] = useState(null);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0].value);
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryBusy, setLibraryBusy] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    let active = true;
    getGame(id).then((data) => {
      if (!active) return;
      if (data) {
        setGame(data);
        setActiveImage(0);
        if (!viewCounted.current) {
          viewCounted.current = true;
          incrementViews(id);
          setGame((prev) => (prev ? { ...prev, views: (prev.views ?? 0) + 1 } : prev));
        }
      } else {
        setNotFound(true);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (game && currentUser) {
      getUserRating(game.id, currentUser.uid).then(setMyRating);
      isInLibrary(game.id).then(setInLibrary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, currentUser?.uid]);

  async function handleRate(stars) {
    setRatingBusy(true);
    try {
      await rateGame(game.id, stars);
      setMyRating(stars);
      const fresh = await getGame(game.id);
      if (fresh) setGame(fresh);
    } catch (err) {
      alert(err.message);
    } finally {
      setRatingBusy(false);
    }
  }

  async function toggleLibrary() {
    if (!currentUser) return;
    setLibraryBusy(true);
    try {
      if (inLibrary) {
        await removeFromLibrary(game.id);
        setInLibrary(false);
      } else {
        await addToLibrary(game.id);
        setInLibrary(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLibraryBusy(false);
    }
  }

  async function handleReport(e) {
    e.preventDefault();
    setReportError(null);
    try {
      await createReport({ gameId: game.id, reason: reportReason, details: reportDetails });
      setReportSent(true);
    } catch (err) {
      setReportError(err.message);
    }
  }

  async function handleDelete() {
    await deleteGame(game.id);
    navigate('/');
  }

  if (notFound) {
    return (
      <EmptyState
        title="Game not found"
        description="This game may have been removed or the link is incorrect."
        action={
          <Link to="/">
            <Button>Back to Store</Button>
          </Link>
        }
      />
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const gallery = [game.coverImage, ...(game.screenshots || [])].filter(Boolean);
  const isOwner = currentUser && game.ownerId === currentUser.uid;

  function goPrev() {
    setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  }
  function goNext() {
    setActiveImage((i) => (i + 1) % gallery.length);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Gallery */}
      <div className="group relative overflow-hidden rounded-2xl ring-1 ring-slate-800">
        <img
          key={gallery[activeImage]}
          src={gallery[activeImage] || 'https://placehold.co/1200x675/1e293b/7c3aed?text=Game'}
          alt={`${game.title} screenshot`}
          className="aspect-video w-full animate-[fadeIn_300ms_ease] bg-slate-900 object-cover"
        />
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2.5 text-white backdrop-blur transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:p-3"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2.5 text-white backdrop-blur transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:p-3"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {activeImage + 1} / {gallery.length}
            </span>
          </>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {gallery.map((url, index) => (
            <button
              key={url + index}
              onClick={() => setActiveImage(index)}
              className={`h-32 w-56 shrink-0 overflow-hidden rounded-xl ring-2 transition-all ${
                index === activeImage
                  ? 'ring-primary'
                  : 'opacity-60 ring-transparent hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            {game.genre && (
              <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-primary-light ring-1 ring-slate-700">
                {game.genre}
              </span>
            )}
            {game.isAiGenerated && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white"
                title="Created with AI assistance — declared by the developer"
              >
                <Bot className="h-3.5 w-3.5" />
                AI-Assisted
              </span>
            )}
            <span className="text-xs text-slate-500">
              Published {timeAgo(game.createdAt)}
            </span>
          </div>

          {/* Publisher card */}
          {game.ownerUsername && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-raised p-4 ring-1 ring-slate-800">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {game.ownerUsername[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-400">Published by</p>
                <Link
                  to={`/u/${game.ownerUsername}`}
                  className="font-semibold text-white hover:text-primary-light transition-colors truncate block"
                >
                  {game.ownerUsername}
                </Link>
              </div>
            </div>
          )}

          <h1 className="mt-3 text-3xl font-bold text-white">{game.title}</h1>

          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-300">
            {game.description}
          </p>

          {game.developerNote && (
            <div className="mt-6 rounded-xl bg-surface-raised p-5 ring-1 ring-slate-800">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                <StickyNote className="h-4 w-4 text-primary-light" />
                Developer Notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {game.developerNote}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button size="lg" className="w-full">
              <ExternalLink className="h-5 w-5" />
              Play Now
            </Button>
          </a>
          <p className="mt-2 break-all text-center text-xs text-slate-500">
            Opens in a new tab · hosted externally
          </p>

          <div className="mt-6 space-y-4 rounded-xl bg-surface-raised p-5 ring-1 ring-slate-800">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <Eye className="h-4 w-4" /> Views
              </span>
              <span className="font-semibold text-white">{game.views ?? 0}</span>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <span className="mb-2 block text-sm text-slate-400">
                Rating {(game.rating ?? 0).toFixed(1)} ({game.ratingCount ?? 0})
              </span>
              {currentUser ? (
                <div>
                  <StarRating
                    value={myRating ?? 0}
                    onChange={ratingBusy ? undefined : handleRate}
                    size="h-7 w-7"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {myRating ? `You rated ${myRating}/5` : 'Click to rate'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sign in to rate this game.</p>
              )}
            </div>
          </div>

          {currentUser && !isOwner && (
            <Button
              variant={inLibrary ? 'secondary' : 'outline'}
              size="md"
              className="w-full"
              onClick={toggleLibrary}
              loading={libraryBusy}
            >
              {inLibrary ? (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  In Library
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  Add to Library
                </>
              )}
            </Button>
          )}

          {!isOwner && (
            <button
              onClick={() => setReportOpen(true)}
              disabled={!currentUser}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Flag className="h-4 w-4" />
              Report this game
            </button>
          )}

          {isOwner && (
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => navigate(`/game/${game.id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button variant="danger" size="md" className="flex-1" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </aside>
      </div>

      {/* Report modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report Game">
        {reportSent ? (
          <div className="py-4 text-center">
            <p className="text-white">Report submitted.</p>
            <p className="mt-1 text-sm text-slate-400">
              Thank you — our moderators will review it.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setReportOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReport} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              label="Details (optional)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Explain the problem…"
            />
            {reportError && <p className="text-xs text-red-400">{reportError}</p>}
            <Button type="submit" variant="danger" className="w-full">
              Submit Report
            </Button>
          </form>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Game?">
        <p className="text-sm text-slate-300">
          "<span className="font-medium text-white">{game.title}</span>" will be permanently
          removed along with its ratings. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}
