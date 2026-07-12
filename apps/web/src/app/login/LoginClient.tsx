'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import {
  signInWithEmail,
  signInWithGoogle,
  registerWithEmail,
} from '@/lib/firebaseClient';
import { IS_FIREBASE_CONFIGURED } from '@/lib/config';

export function LoginClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!IS_FIREBASE_CONFIGURED) {
    return (
      <div className="card mx-auto max-w-md space-y-3">
        <h1 className="text-xl font-bold">Sign In</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Authentication is not configured on this deployment yet. Set the{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">NEXT_PUBLIC_FIREBASE_*</code> environment
          variables to enable sign-in, watchlist sync, and portfolio tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card space-y-4">
        <div className="flex gap-2">
          <button
            className={mode === 'signin' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
            onClick={() => setMode('signin')}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === 'register' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
            onClick={() => setMode('register')}
            type="button"
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Email</span>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Password</span>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          OR
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <button type="button" className="btn-secondary w-full" onClick={handleGoogleSignIn} disabled={submitting}>
          Continue with Google
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Signing in lets you sync your watchlist, virtual portfolio, and price alerts. We never share your data with
        third parties.
      </p>
    </div>
  );
}
