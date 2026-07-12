'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from './apiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches data from the API on mount (and whenever `path` changes), tracking
 * loading/error state. Skips the fetch entirely if `path` is null, which is
 * useful for conditionally-dependent queries.
 */
export function useApi<T>(path: string | null, deps: unknown[] = []): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: !!path, error: null });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch<T>(path)
      .then((data) => {
        if (mountedRef.current) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (mountedRef.current) setState({ data: null, loading: false, error: err.message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  return state;
}
