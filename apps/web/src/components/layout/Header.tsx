'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/lib/ThemeProvider';
import { useAuth } from '@/lib/AuthProvider';
import { signOut } from '@/lib/firebaseClient';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length > 0) {
      router.push(`/stock/${encodeURIComponent(query.trim().toUpperCase())}`);
      setQuery('');
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <button
        aria-label="Toggle navigation menu"
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <Link href="/" className="flex items-center gap-2 font-bold text-brand-600">
        <span aria-hidden="true">📈</span>
        <span className="hidden sm:inline">StockSense Research</span>
      </Link>

      <form onSubmit={handleSearchSubmit} className="ml-2 flex-1 max-w-md">
        <label htmlFor="global-search" className="sr-only">
          Search stocks
        </label>
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search NSE/BSE stocks (e.g. RELIANCE, TCS)"
          className="input-field"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {!loading && user ? (
          <button onClick={() => signOut()} className="btn-secondary">
            Sign out
          </button>
        ) : (
          <Link href="/login" className="btn-primary">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
