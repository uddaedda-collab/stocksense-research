'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { formatDate } from '@/lib/format';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface DashboardData {
  monitoring: {
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    averageDurationMs: number;
  };
  userCount: number;
  watchlistCount: number;
  portfolioCount: number;
}

interface LogEntry {
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  is_error: boolean;
}

interface AdminUser {
  id: string;
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  last_seen_at: string;
}

type Tab = 'dashboard' | 'logs' | 'errors' | 'users';

export function AdminClient() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [errors, setErrors] = useState<LogEntry[] | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTab = useCallback(async (activeTab: Tab) => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'dashboard') {
        setDashboard(await apiFetch<DashboardData>('/api/admin/dashboard', { auth: true }));
      } else if (activeTab === 'logs') {
        const data = await apiFetch<{ logs: LogEntry[] }>('/api/admin/logs?limit=100', { auth: true });
        setLogs(data.logs);
      } else if (activeTab === 'errors') {
        const data = await apiFetch<{ errors: LogEntry[] }>('/api/admin/errors', { auth: true });
        setErrors(data.errors);
      } else if (activeTab === 'users') {
        const data = await apiFetch<{ users: AdminUser[] }>('/api/admin/users', { auth: true });
        setUsers(data.users);
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.status === 403
            ? 'Admin access required. Your account is not on the admin allowlist.'
            : err.message
          : 'Failed to load admin data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadTab(tab);
  }, [user, tab, loadTab]);

  if (authLoading) return <CardSkeleton />;

  if (!user) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Sign in with an admin account to continue.</p>
        <Link href="/login" className="btn-primary inline-block w-fit">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="flex flex-wrap gap-2" role="tablist">
        {(['dashboard', 'logs', 'errors', 'users'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'btn-primary capitalize' : 'btn-secondary capitalize'}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <CardSkeleton />}

      {!loading && tab === 'dashboard' && dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatCard label="Total Requests (recent)" value={dashboard.monitoring.totalRequests} />
          <StatCard label="Error Rate" value={`${dashboard.monitoring.errorRate}%`} />
          <StatCard label="Avg Response Time" value={`${dashboard.monitoring.averageDurationMs}ms`} />
          <StatCard label="Error Count" value={dashboard.monitoring.errorCount} />
          <StatCard label="Registered Users" value={dashboard.userCount} />
          <StatCard label="Watchlist Items" value={dashboard.watchlistCount} />
          <StatCard label="Portfolio Holdings" value={dashboard.portfolioCount} />
        </div>
      )}

      {!loading && tab === 'logs' && logs && <LogTable rows={logs} />}
      {!loading && tab === 'errors' && errors && <LogTable rows={errors} />}

      {!loading && tab === 'users' && users && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Display Name</th>
                <th className="py-2 pr-3">Joined</th>
                <th className="py-2 pr-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="py-2 pr-3">{u.email ?? '—'}</td>
                  <td className="py-2 pr-3">{u.display_name ?? '—'}</td>
                  <td className="py-2 pr-3">{formatDate(u.created_at)}</td>
                  <td className="py-2 pr-3">{formatDate(u.last_seen_at)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function LogTable({ rows }: { rows: LogEntry[] }) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-gray-500">No entries to show.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <th className="py-2 pr-3">Method</th>
            <th className="py-2 pr-3">Path</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
              <td className="py-2 pr-3 font-mono text-xs">{row.method}</td>
              <td className="py-2 pr-3 font-mono text-xs">{row.path}</td>
              <td className={`py-2 pr-3 ${row.is_error ? 'text-red-600' : 'text-green-600'}`}>{row.status_code}</td>
              <td className="py-2 pr-3">{row.duration_ms}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
