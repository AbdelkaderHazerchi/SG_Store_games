import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit as fbLimit,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { COLLECTIONS } from '../utils/constants';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && active) {
        await fetchNotifications(user.uid);
      } else if (active) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function fetchNotifications(uid) {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.NOTIFICATIONS),
        orderBy('dateSent', 'desc'),
        fbLimit(50)
      );
      const snapshot = await getDocs(q);
      const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(
        doc(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.NOTIFICATIONS, notificationId),
        { read: true, dateRead: serverTimestamp() }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, dateRead: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  async function markAllAsRead() {
    const user = auth.currentUser;
    if (!user) return;
    const unreadNotifs = notifications.filter((n) => !n.read);
    try {
      await Promise.all(
        unreadNotifs.map((n) =>
          updateDoc(
            doc(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.NOTIFICATIONS, n.id),
            { read: true, dateRead: serverTimestamp() }
          )
        )
      );
      setNotifications((prev) =>
        prev.map((n) => (n.read ? n : { ...n, read: true, dateRead: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }

  async function deleteNotification(notificationId) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(
        doc(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.NOTIFICATIONS, notificationId)
      );
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notificationId);
        setUnreadCount(filtered.filter((n) => !n.read).length);
        return filtered;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }

  async function createNotification({ title, message, targetUserId }) {
    try {
      await addDoc(
        collection(db, COLLECTIONS.USERS, targetUserId, COLLECTIONS.NOTIFICATIONS),
        {
          title,
          message,
          read: false,
          dateRead: null,
          dateSent: serverTimestamp(),
        }
      );
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  }

  async function cleanupOldReadNotifications() {
    const user = auth.currentUser;
    if (!user) return;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.NOTIFICATIONS),
        where('read', '==', true),
        where('dateRead', '<', twoDaysAgo)
      );
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
      setNotifications((prev) => prev.filter((n) => !(n.read && n.dateRead < twoDaysAgo)));
    } catch (err) {
      console.error('Error cleaning up old notifications:', err);
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    cleanupOldReadNotifications,
    refetch: fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}