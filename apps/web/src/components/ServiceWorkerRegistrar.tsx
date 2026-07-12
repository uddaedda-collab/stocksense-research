'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/registerServiceWorker';

/** Client-only component that registers the PWA service worker on mount. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
