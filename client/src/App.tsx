import { useState } from 'react';
import { Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { ProtectedRoute, GuestRoute } from './components/AuthGuard';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizEditPage from './pages/QuizEditPage';
import HostLobbyPage from './pages/HostLobbyPage';
import PlayerLobbyPage from './pages/PlayerLobbyPage';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-pink/10 via-brand-blue/5 to-brand-teal/10 font-sans selection:bg-brand-pink selection:text-white">
      <header className="h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/" className="bg-gradient-to-r from-brand-pink to-brand-blue text-white font-bold px-5 py-2 rounded-lg text-sm tracking-widest shadow-soft hover:shadow-vibrant transition-all hover:scale-105">
            QUIZZZZZ
          </Link>
          <div className="bg-white border border-gray-100 text-brand-pink font-black px-4 py-1.5 rounded-lg text-xs tracking-wider shadow-sm">
            DEV
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 relative">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-pink/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl -z-10"></div>
        <Outlet />
      </main>

      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm px-6 py-4 text-center text-xs font-bold tracking-wider text-slate-500 uppercase z-10">
        Quizzzzz Quiz Editor &mdash; Modern & Minimalist
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:pin" element={<PlayerLobbyPage />} />
          <Route
            path="/admin/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/admin/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
        </Route>

        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Halaman Host Lobby memiliki tampilan full screen */}
        <Route
          path="/admin/game/:pin/lobby"
          element={
            <ProtectedRoute>
              <HostLobbyPage />
            </ProtectedRoute>
          }
        />

        {/* Editor Kuis memiliki layout sendiri (tanpa AdminLayout) */}
        <Route
          path="/admin/quiz/create"
          element={
            <ProtectedRoute>
              <QuizEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quiz/:quizId/edit"
          element={
            <ProtectedRoute>
              <QuizEditPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

function HomePage() {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;
    navigate(`/game/${pin}`, { state: { nickname } });
  };

  return (
    <div className="mx-auto my-auto w-full max-w-sm text-center bg-white rounded-[2rem] shadow-vibrant p-10 border border-gray-100">
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-800">
        Siap Bermain?
      </h1>
      <p className="mb-8 text-sm font-medium text-slate-500">
        Masukkan PIN untuk bergabung
      </p>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="PIN PERMAINAN"
            value={pin}
            onChange={(e) => setPin(e.target.value.toUpperCase())}
            className="w-full text-center text-xl font-bold tracking-widest px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-brand-pink focus:outline-none focus:ring-4 focus:ring-brand-pink/20 transition-all placeholder-slate-300"
            maxLength={6}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="NAMA KAMU"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full text-center font-bold tracking-wider px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all placeholder-slate-300"
            maxLength={15}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!pin || !nickname}
          className="w-full bg-slate-900 text-white rounded-2xl px-8 py-4 font-bold tracking-widest shadow-soft hover:bg-slate-800 active:scale-95 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          Masuk
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-100">
        <Link to="/admin/login" className="text-xs font-bold tracking-wider text-slate-400 hover:text-brand-pink transition-colors uppercase">
          Login sebagai Guru/Host
        </Link>
      </div>
    </div>
  );
}
