'use client';

import { useCallback, useEffect, useState } from 'react';

type PollState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshedAt: string | null;
};

type PollOptions = {
  intervalMs?: number;
  headers?: Record<string, string>;
  enabled?: boolean;
};

export function usePoll<T>(
  url: string,
  { intervalMs = 5000, headers, enabled = true }: PollOptions = {}
): PollState<T> {
  const [state, setState] = useState<PollState<T>>({
    data: null,
    error: null,
    loading: true,
    refreshedAt: null,
  });

  const headerKey = JSON.stringify(headers ?? {});

  const fetchData = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers,
      });
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
  }, [url, enabled, headerKey]);

  useEffect(() => {
    if (!enabled) {
      setState(current => ({ ...current, loading: false }));
      return;
    }

    void fetchData();
    const timer = setInterval(() => void fetchData(), intervalMs);
    return () => clearInterval(timer);
  }, [fetchData, intervalMs, enabled]);

  return state;
}
