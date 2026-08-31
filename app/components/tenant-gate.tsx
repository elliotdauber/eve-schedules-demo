'use client';

import { FormEvent, useState } from 'react';
import { useTenant } from '@/lib/tenant-context';
import styles from './tenant-gate.module.css';

export function TenantGate({ children }: { children: React.ReactNode }) {
  const { tenantName, ready, setTenantName } = useTenant();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.card}>
          <p className={styles.loading}>Loading…</p>
        </div>
      </div>
    );
  }

  if (tenantName) {
    return children;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      setTenantName(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className={styles.backdrop}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Choose a display name</h1>
        <p className={styles.lead}>
          Your schedules are grouped under{' '}
          <code className={styles.inlineCode}>user.your-name</code>. Activity
          logs are stored in a matching blob folder.
        </p>
        <div className={styles.warning} role="note">
          <strong>Demo only.</strong> This is not secure multi-tenancy — anyone
          who enters the same name can see and manage those schedules and
          activity history.
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Display name</span>
          <input
            className={styles.input}
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="e.g. elliot"
            autoFocus
            required
            minLength={1}
            maxLength={32}
            pattern="[A-Za-z0-9_-]+"
          />
        </label>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={styles.button}>
          Continue
        </button>
      </form>
    </div>
  );
}
