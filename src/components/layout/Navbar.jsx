import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, LogOut, User, Upload, Search, Bookmark, Bell, BellRing } from 'lucide-react';
import { APP_NAME, ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import Button from '../common/Button';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate(ROUTES.HOME);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-bold text-white">
          <Gamepad2 className="h-7 w-7 text-primary" />
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/search"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white md:flex"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>

          {currentUser ? (
            <>
              <Link to={ROUTES.PUBLISH}>
                <Button size="sm">
                  <Upload className="h-4 w-4" />
                  Publish
                </Button>
              </Link>
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setNotifMenuOpen((open) => !open)}
                  className="relative rounded-lg p-2 text-slate-300 transition-colors hover:bg-surface-raised hover:text-white"
                  aria-label="Notifications"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-lg bg-surface-raised py-1 shadow-xl ring-1 ring-slate-700">
                    <div className="px-4 py-2.5 text-sm font-medium text-white border-b border-slate-700">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 text-sm text-slate-400 text-center">
                        Click to view all notifications
                      </div>
                    </div>
                    <Link
                      to={ROUTES.NOTIFICATIONS}
                      onClick={() => setNotifMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-center text-primary-light hover:text-primary hover:bg-slate-800"
                    >
                      View All
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-surface-raised"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-primary"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary-light" />
                  )}
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {currentUser.displayName || 'Profile'}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-raised py-1 shadow-xl ring-1 ring-slate-700">
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/library"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      My Library
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-slate-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
