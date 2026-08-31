'use client';

import { useCallback, useEffect, useState } from 'react';

type PollState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshedAt: string | null;
};

export function usePoll<T>(url: string, intervalMs = 5000): PollState<T> {
  const [state, setState] = useState<PollState<T>>({
    data: null,
    error: null,
    loading: true,
    refreshedAt: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = (await response.json()) as T;
      setState({
        data,
        error: null,
        loading: false,
        refreshedAt: new Date().toISOString(),
      });
    } catch (error) {
      setState(current => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        loading: false,
      }));
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
    const timer = setInterval(() => void fetchData(), intervalMs);
    return () => clearInterval(timer);
  }, [fetchData, intervalMs]);

  return state;
}
