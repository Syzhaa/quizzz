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
    <div className="card-neo mx-auto w-full max-w-md">
      <h1 className="mb-6 text-3xl font-black">Register</h1>

      {error && (
        <div className="mb-4 border-4 border-black bg-red-100 p-3 font-bold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-bold">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-4 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-neo-cyan"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="mb-1 block font-bold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-4 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-neo-cyan"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-bold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-4 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-neo-cyan"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-neo w-full disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center font-bold">
        Already have an account?{' '}
        <Link to="/admin/login" className="text-neo-pink underline">
          Login
        </Link>
      </p>
    </div>
  );
}
