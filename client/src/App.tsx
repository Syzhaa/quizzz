import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { ProtectedRoute, GuestRoute } from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizEditPage from './pages/QuizEditPage';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b-4 border-black bg-neo-yellow px-4 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link to="/" className="text-2xl font-black tracking-tight">
              Quzzzz
            </Link>
            <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold">
              DEV
            </span>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-12">
          <Routes>
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
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
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
        </main>

        <footer className="border-t-4 border-black bg-white px-4 py-3 text-center text-sm font-bold">
          Quzzzz &mdash; Interactive Quiz Platform &mdash; Development Phase
        </footer>
      </div>
    </AuthProvider>
  );
}

function HomePage() {
  return (
    <div className="card-neo max-w-lg text-center">
      <h1 className="mb-4 text-4xl font-black tracking-tight">Quzzzz</h1>
      <p className="mb-6 text-lg font-bold">
        Interactive Quiz Platform
      </p>

      <div className="mb-6 space-y-2 text-left text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-neo-green shadow-neo-sm" />
          <span>Frontend: React + Vite + TypeScript</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-neo-cyan shadow-neo-sm" />
          <span>Backend: Express + Socket.IO + TypeScript</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-neo-yellow shadow-neo-sm" />
          <span>Database: MongoDB + Redis</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/admin/register" className="btn-neo text-center text-sm">
          Get Started
        </Link>
        <Link
          to="/admin/login"
          className="border-4 border-black bg-white px-6 py-3 text-center text-sm font-bold shadow-neo transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          I have an account
        </Link>
      </div>
    </div>
  );
}
