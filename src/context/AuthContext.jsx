import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { COLLECTIONS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && active) {
        const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        setUserProfile(
          snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null
        );
      } else if (active) {
        setUserProfile(null);
      }
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function isUsernameTaken(username) {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('username', '==', username),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async function register({ fullName, username, email, password }) {
    if (await isUsernameTaken(username)) {
      throw new Error('This username is already taken.');
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: fullName });
    const profileData = {
      uid: user.uid,
      username,
      displayName: fullName,
      email,
      photoURL: '',
      bio: '',
      publishedGamesCount: 0,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), profileData);
    setUserProfile(profileData);
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function updateUserProfile(updates) {
    if (!currentUser) throw new Error('Not authenticated');
    await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), updates);
    if (updates.displayName) {
      await updateProfile(currentUser, { displayName: updates.displayName });
    }
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
    isUsernameTaken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
