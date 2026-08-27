import { createContext, useContext } from 'react';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  increment,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { COLLECTIONS, LIMITS } from '../utils/constants';

const GameContext = createContext(null);

function gamesRef() {
  return collection(db, COLLECTIONS.GAMES);
}

function libraryRef(uid) {
  return collection(db, COLLECTIONS.USERS, uid, 'library');
}

export function GameProvider({ children }) {
  /**
   * Creates a game inside a transaction that enforces the
   * per-account publishing cap (25 games) at write time.
   */
  async function createGame(gameData) {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be signed in to publish.');

    const gameRef = doc(gamesRef());
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);

    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);
      if (userSnap.exists()) {
        const count = userSnap.data().publishedGamesCount ?? 0;
        if (count >= LIMITS.MAX_GAMES_PER_USER) {
          throw new Error(
            `Publishing limit reached (${LIMITS.MAX_GAMES_PER_USER} games per account).`
          );
        }
      }
      tx.set(gameRef, {
        ...gameData,
        ownerId: user.uid,
        ownerUsername: userSnap.exists() ? userSnap.data().username : '',
        rating: 0,
        ratingCount: 0,
        views: 0,
        randomIndex: Math.random(),
        createdAt: new Date().toISOString(),
      });
      tx.set(
        userRef,
        { publishedGamesCount: increment(1) },
        { merge: true }
      );
    });

    return gameRef.id;
  }

  async function getGame(id) {
    const snapshot = await getDoc(doc(gamesRef(), id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  async function listGames({ genre, search, sort = 'newest', max = 60 } = {}) {
    let q = query(gamesRef());
    if (sort === 'rating') q = query(q, orderBy('rating', 'desc'));
    else if (sort === 'views') q = query(q, orderBy('views', 'desc'));
    else q = query(q, orderBy('createdAt', 'desc'));
    q = query(q, fbLimit(max));

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (genre) results = results.filter((g) => g.genre === genre);
    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (g) =>
          g.title?.toLowerCase().includes(term) ||
          g.description?.toLowerCase().includes(term)
      );
    }
    return results;
  }

  /** Efficient random fetch using the randomIndex field (no full scan). */
  async function listRandomGames(count = 8) {
    const threshold = Math.random();
    const above = query(
      gamesRef(),
      where('randomIndex', '>=', threshold),
      orderBy('randomIndex'),
      fbLimit(count)
    );
    const below = query(
      gamesRef(),
      where('randomIndex', '<=', threshold),
      orderBy('randomIndex', 'desc'),
      fbLimit(count)
    );

    const [aboveSnap, belowSnap] = await Promise.all([
      getDocs(above),
      getDocs(below),
    ]);
    const seen = new Set();
    const results = [];
    for (const snap of [...aboveSnap.docs, ...belowSnap.docs]) {
      if (!seen.has(snap.id)) {
        seen.add(snap.id);
        results.push({ id: snap.id, ...snap.data() });
      }
      if (results.length >= count) break;
    }
    return results.sort(() => Math.random() - 0.5);
  }

  async function getUserGames(ownerId) {
    const q = query(gamesRef(), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    const games = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return games.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /** Only the owner may pass ownership-protected fields; verified client-side and by rules. */
  async function updateGame(id, gameData) {
    const user = auth.currentUser;
    const gameSnap = await getDoc(doc(gamesRef(), id));
    if (!gameSnap.exists()) throw new Error('Game not found.');
    if (gameSnap.data().ownerId !== user?.uid) {
      throw new Error('You can only edit your own games.');
    }
    await updateDoc(doc(gamesRef(), id), gameData);
  }

  async function deleteGame(id) {
    const user = auth.currentUser;
    const gameSnap = await getDoc(doc(gamesRef(), id));
    if (!gameSnap.exists()) throw new Error('Game not found.');
    if (gameSnap.data().ownerId !== user?.uid) {
      throw new Error('You can only delete your own games.');
    }

    // Delete ratings subcollection entries first.
    const ratingsSnap = await getDocs(collection(gamesRef(), id, 'ratings'));
    for (const ratingDoc of ratingsSnap.docs) {
      await deleteDoc(ratingDoc.ref);
    }
    await deleteDoc(doc(gamesRef(), id));

    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    await setDoc(userRef, { publishedGamesCount: increment(-1) }, { merge: true });
  }

  async function incrementViews(id) {
    try {
      await updateDoc(doc(gamesRef(), id), { views: increment(1) });
    } catch {
      /* non-critical */
    }
  }

  /**
   * Rating: one vote per user stored in games/{id}/ratings/{uid}.
   * The parent document's average is recomputed in a transaction.
   */
  async function rateGame(gameId, value) {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to rate games.');
    const ratingRef = doc(gamesRef(), gameId, 'ratings', user.uid);

    const previousValue = await runTransaction(db, async (tx) => {
      const ratingSnap = await tx.get(ratingRef);
      const previous = ratingSnap.exists() ? ratingSnap.data().value : null;
      tx.set(ratingRef, { value: Number(value), ratedAt: new Date().toISOString() });
      return previous;
    });

    await runTransaction(db, async (tx) => {
      const gameRef = doc(gamesRef(), gameId);
      const gameSnap = await tx.get(gameRef);
      if (!gameSnap.exists()) return;

      const ratingsSnap = await getDocs(collection(gamesRef(), gameId, 'ratings'));
      const values = ratingsSnap.docs.map((d) => d.data().value);
      const avg =
        values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1);

      tx.update(gameRef, {
        rating: Math.round(avg * 10) / 10,
        ratingCount: values.length,
      });
    });

    return previousValue;
  }

  async function getUserRating(gameId, uid) {
    const snapshot = await getDoc(doc(gamesRef(), gameId, 'ratings', uid));
    return snapshot.exists() ? snapshot.data().value : null;
  }

  async function createReport({ gameId, reason, details }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to report games.');
    return addDoc(collection(db, COLLECTIONS.REPORTS), {
      gameId,
      reportedBy: user.uid,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  // --- Library ---
  async function addToLibrary(gameId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to save games.');
    await setDoc(doc(libraryRef(user.uid), gameId), {
      gameId,
      savedAt: new Date().toISOString(),
    });
  }

  async function removeFromLibrary(gameId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to manage library.');
    await deleteDoc(doc(libraryRef(user.uid), gameId));
  }

  async function isInLibrary(gameId) {
    const user = auth.currentUser;
    if (!user) return false;
    const snap = await getDoc(doc(libraryRef(user.uid), gameId));
    return snap.exists();
  }

  async function getLibrary() {
    const user = auth.currentUser;
    if (!user) return [];
    const q = query(libraryRef(user.uid), orderBy('savedAt', 'desc'));
    const snap = await getDocs(q);
    const gameIds = snap.docs.map((d) => d.data().gameId);
    if (!gameIds.length) return [];
    // Fetch game details in parallel (max ~50 for free tier)
    const games = await Promise.all(
      gameIds.slice(0, 50).map((id) => getGame(id))
    );
    return games.filter(Boolean);
  }

  const value = {
    createGame,
    getGame,
    listGames,
    listRandomGames,
    getUserGames,
    updateGame,
    deleteGame,
    incrementViews,
    rateGame,
    getUserRating,
    createReport,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    getLibrary,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGames() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
}
