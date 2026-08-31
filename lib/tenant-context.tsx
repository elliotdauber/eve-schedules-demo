'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  normalizeTenantName,
  TENANT_STORAGE_KEY,
  tenantNamespace,
} from '@/lib/tenant';

type TenantContextValue = {
  tenantName: string | null;
  tenantNamespace: string | null;
  ready: boolean;
  setTenantName: (name: string) => void;
  clearTenantName: () => void;
};

const TenantContext = createContext<TenantContextValue | null>(null);

function readStoredTenantName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(TENANT_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return normalizeTenantName(stored);
  } catch {
    return null;
  }
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantName, setTenantNameState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTenantNameState(readStoredTenantName());
    setReady(true);
  }, []);

  const setTenantName = useCallback((rawName: string) => {
    const normalized = normalizeTenantName(rawName);
    window.localStorage.setItem(TENANT_STORAGE_KEY, normalized);
    setTenantNameState(normalized);
  }, []);

  const clearTenantName = useCallback(() => {
    window.localStorage.removeItem(TENANT_STORAGE_KEY);
    setTenantNameState(null);
  }, []);

  const value = useMemo(
    () => ({
      tenantName,
      tenantNamespace: tenantName ? tenantNamespace(tenantName) : null,
      ready,
      setTenantName,
      clearTenantName,
    }),
    [tenantName, ready, setTenantName, clearTenantName]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
