'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/Spinner';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
      } else {
        login(data.user);
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/40">
            CB
          </div>
          <span className="text-2xl font-bold text-white">CrewBoard</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

          <AlertMessage type="error" message={error} />

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          {/* Demo hints */}
          <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-500 mb-2 font-medium">Quick demo access (Case Sensitive!):</p>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@example.com', password: 'Admin@123' })}
              className="text-xs text-indigo-400 hover:text-indigo-300 block mb-1 text-left w-full"
            >
              → Admin: admin@example.com / Admin@123
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'member@example.com', password: 'Member@123' })}
              className="text-xs text-indigo-400 hover:text-indigo-300 block text-left w-full"
            >
              → Member: member@example.com / Member@123
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center mt-5">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
