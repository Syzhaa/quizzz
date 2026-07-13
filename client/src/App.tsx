import { Routes, Route, Link, Outlet } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { ProtectedRoute, GuestRoute } from './components/AuthGuard';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizEditPage from './pages/QuizEditPage';

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
  return (
    <div className="mx-auto my-auto w-full max-w-2xl text-center bg-white rounded-[2rem] shadow-soft p-12">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-800">
        Quizzzzz Quiz Platform
      </h1>
      <p className="mb-10 text-lg font-medium text-slate-500">
        Interactive & Minimalist Quiz Editor
      </p>

      <div className="mb-10 space-y-4 text-left text-sm font-medium text-slate-600 p-8 bg-gray-50/50 border border-gray-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-brand-teal shadow-soft" />
          <span>Frontend: React + Vite + TypeScript</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-brand-blue shadow-soft" />
          <span>Backend: Express + Socket.IO + TypeScript</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-brand-yellow shadow-soft" />
          <span>Database: MongoDB + Redis</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/admin/register" className="w-full sm:w-auto bg-brand-pink text-white rounded-xl px-8 py-3.5 font-bold tracking-wider shadow-soft hover:bg-opacity-90 active:scale-[0.98] transition-all uppercase text-sm">
          Get Started
        </Link>
        <Link
          to="/admin/login"
          className="w-full sm:w-auto bg-white text-slate-600 border border-gray-200 rounded-xl px-8 py-3.5 font-bold tracking-wider shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all uppercase text-sm"
        >
          Login Account
        </Link>
      </div>
    </div>
  );
}
