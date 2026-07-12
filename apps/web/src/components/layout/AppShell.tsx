'use client';

import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
