import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import RequireAuth from './hooks/useRequireAuth';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import PublishGame from './pages/PublishGame';
import EditGame from './pages/EditGame';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Library from './pages/Library';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import SitePolicy from './pages/SitePolicy';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <HashRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/game/:id" element={<GameDetails />} />
                <Route
                  path="/game/:id/edit"
                  element={
                    <RequireAuth>
                      <EditGame />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/publish"
                  element={
                    <RequireAuth>
                      <PublishGame />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route path="/u/:username" element={<PublicProfile />} />
                <Route
                  path="/library"
                  element={
                    <RequireAuth>
                      <Library />
                    </RequireAuth>
                  }
                />
                <Route path="/policy" element={<SitePolicy />} />
                <Route path="/legal" element={<SitePolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </GameProvider>
    </AuthProvider>
  );
}
