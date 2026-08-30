import { useEffect, useState } from 'react';
import { Trash2, Check, Mail, MailOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate, timeAgo } from '../utils/helpers';

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanupOldReadNotifications,
  } = useNotifications();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  useEffect(() => {
    cleanupOldReadNotifications();
  }, [cleanupOldReadNotifications]);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  async function handleMarkAsRead(id) {
    await markAsRead(id);
  }

  async function handleDelete(id) {
    await deleteNotification(id);
    setDeleteTarget(null);
  }

  async function handleCleanup() {
    await cleanupOldReadNotifications();
    setShowCleanupConfirm(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-3.5 w-3.5" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCleanupConfirm(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              Cleanup Old
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No notifications yet"
          description="When you receive notifications, they'll appear here."
        />
      ) : (
        <>
          {unreadNotifications.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">
                Unread ({unreadNotifications.length})
              </h2>
              <div className="space-y-2">
                {unreadNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onRead={() => handleMarkAsRead(notif.id)}
                    onDelete={() => setDeleteTarget(notif)}
                  />
                ))}
              </div>
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">
                Read ({readNotifications.length})
              </h2>
              <div className="space-y-2">
                {readNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onRead={() => {}}
                    onDelete={() => setDeleteTarget(notif)}
                    isRead
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Notification?">
        <p className="text-sm text-slate-300">
          This notification will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(deleteTarget?.id)}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showCleanupConfirm}
        onClose={() => setShowCleanupConfirm(false)}
        title="Clean Up Old Notifications?"
      >
        <p className="text-sm text-slate-300">
          This will permanently delete all read notifications older than 2 days.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowCleanupConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleCleanup}>
            Clean Up
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function NotificationItem({ notification, onRead, onDelete, isRead = false }) {
  const dateSent = notification.dateSent?.toDate
    ? notification.dateSent.toDate()
    : new Date(notification.dateSent);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-4 ring-1 transition-colors ${
        isRead
          ? 'bg-surface-raised/50 ring-slate-800 opacity-70'
          : 'bg-primary/10 ring-primary/30'
      }`}
      onClick={isRead ? undefined : onRead}
      style={{ cursor: isRead ? 'default' : 'pointer' }}
    >
      <div className="mt-0.5 flex-shrink-0">
        {isRead ? (
          <MailOpen className="h-5 w-5 text-slate-500" />
        ) : (
          <Mail className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white">{notification.title}</h3>
        <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span>Sent: {formatDate(dateSent)}</span>
          <span>({timeAgo(dateSent)})</span>
          {notification.dateRead && (
            <>
              <span className="text-primary">• Read: {formatDate(notification.dateRead)}</span>
            </>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}