'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/market', label: 'Market', icon: '📊' },
  { href: '/screener', label: 'Screener', icon: '🔍' },
  { href: '/compare', label: 'Compare', icon: '⚖️' },
  { href: '/watchlist', label: 'Watchlist', icon: '⭐' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
  { href: '/alerts', label: 'Alerts', icon: '🔔' },
  { href: '/heatmap', label: 'Heatmap', icon: '🗺️' },
  { href: '/news', label: 'News', icon: '📰' },
  { href: '/economy', label: 'Economy', icon: '🌍' },
  { href: '/calculators', label: 'Calculators', icon: '🧮' },
  { href: '/chatbot', label: 'AI Chatbot', icon: '🤖' },
  { href: '/admin', label: 'Admin', icon: '🛠️' },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white p-4 transition-transform duration-200 dark:border-gray-800 dark:bg-gray-950 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
