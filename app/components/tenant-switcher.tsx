'use client';

import { FormEvent, useState } from 'react';
import { useTenant } from '@/lib/tenant-context';
import styles from './tenant-switcher.module.css';

export function TenantSwitcher() {
  const { tenantName, tenantNamespace, setTenantName } = useTenant();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(tenantName ?? '');
  const [error, setError] = useState<string | null>(null);

  if (!tenantName || !tenantNamespace) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const next = draft.trim();
      if (next === tenantName) {
        setOpen(false);
        return;
      }
      setTenantName(next);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.current}
        onClick={() => {
          setDraft(tenantName);
          setError(null);
          setOpen(current => !current);
        }}
      >
        <span className={styles.label}>as</span>
        <code className={styles.name}>{tenantName}</code>
      </button>

      {open ? (
        <form className={styles.panel} onSubmit={handleSubmit}>
          <p className={styles.hint}>
            Namespace <code>{tenantNamespace}</code>
          </p>
          <div className={styles.warning}>
            Demo only — others using the same name share this data.
          </div>
          <input
            className={styles.input}
            value={draft}
            onChange={event => setDraft(event.target.value)}
            aria-label="Display name"
            required
            minLength={1}
            maxLength={32}
          />
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.primary}>
              Save
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
