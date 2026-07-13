import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-vibrant p-10 border border-white">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-r from-brand-pink to-brand-blue text-white font-bold px-6 py-2 rounded-xl tracking-widest mb-6 text-xl shadow-soft">
          QUIZZZZZ
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang</h1>
        <p className="text-slate-500 font-medium text-sm mt-2">Silakan login ke akun Anda</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold text-center shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold tracking-widest text-slate-500 uppercase">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            placeholder="Masukkan email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold tracking-widest text-slate-500 uppercase">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            placeholder="Masukkan password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-pink to-brand-blue text-white rounded-xl px-6 py-3.5 font-bold tracking-wider shadow-vibrant hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase"
        >
          {loading ? 'MEMPROSES...' : 'LOGIN'}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-500">
          Belum punya akun?{' '}
          <Link to="/admin/register" className="text-brand-pink font-bold hover:text-brand-blue transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
