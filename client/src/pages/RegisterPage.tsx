import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-soft p-10">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-brand-pink text-white font-bold px-4 py-1.5 rounded-lg tracking-wider mb-6 text-xl">
          QUIZZZZZ
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h1>
        <p className="text-slate-400 text-sm mt-2">Buat akun untuk memulai kuis</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
            placeholder="Masukkan nama"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
            placeholder="Masukkan email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
            placeholder="Masukkan password (min 8 karakter)"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-pink text-white rounded-xl px-6 py-3.5 font-bold tracking-wider shadow-soft hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/admin/login" className="text-brand-pink font-bold hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
