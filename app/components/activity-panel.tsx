'use client';

import { useMemo } from 'react';
import type { Schedule } from '@vercel/schedules';
import type { ActivityRecord } from '@/lib/activity-log';
import { usePoll } from '@/lib/use-poll';
import { useTenant } from '@/lib/tenant-context';
import { TENANT_HEADER } from '@/lib/tenant';
import styles from './activity-panel.module.css';

type SchedulesResponse = {
  tenantName: string;
  namespace: string;
  schedules: Schedule[];
  count: number;
};

type ActivityResponse = {
  tenantName: string;
  events: ActivityRecord[];
  count: number;
  blobConfigured: boolean;
};

function formatExpression(schedule: Schedule): string {
  if (schedule.expression.type === 'cron') {
    return schedule.expression.cron;
  }
  return schedule.expression.at;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatPollError(error: string | null): string | null {
  if (!error) {
    return null;
  }

  try {
    const outer = JSON.parse(error) as { error?: string };
    if (typeof outer.error === 'string') {
      try {
        const inner = JSON.parse(outer.error) as {
          error?: { message?: string };
        };
        if (inner.error?.message) {
          return inner.error.message;
        }
      } catch {
        return outer.error;
      }
    }
  } catch {
    // fall through
  }

  return error;
}

export function ActivityPanel() {
  const { tenantName, tenantNamespace } = useTenant();
  const tenantHeaders = useMemo(
    () => (tenantName ? { [TENANT_HEADER]: tenantName } : undefined),
    [tenantName]
  );

  const schedulesPoll = usePoll<SchedulesResponse>('/api/schedules', {
    intervalMs: 5000,
    headers: tenantHeaders,
    enabled: Boolean(tenantName),
  });
  const activityPoll = usePoll<ActivityResponse>('/api/activity', {
    intervalMs: 4000,
    headers: tenantHeaders,
    enabled: Boolean(tenantName),
  });

  const schedules = schedulesPoll.data?.schedules ?? [];
  const events = activityPoll.data?.events ?? [];
  const blobConfigured = activityPoll.data?.blobConfigured ?? false;

  const lastUpdated = schedulesPoll.refreshedAt
    ? formatTime(schedulesPoll.refreshedAt)
    : null;

  const pollError = formatPollError(
    schedulesPoll.error ?? activityPoll.error
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Schedules</h2>
          <p className={styles.panelHint}>
            Namespace <code>{tenantNamespace}</code>
            {lastUpdated ? ` · updated ${lastUpdated}` : null}
          </p>
        </div>
      </div>

      {pollError && (
        <p className={styles.error} role="alert">
          {pollError}
        </p>
      )}

      <section className={styles.section}>
        {schedulesPoll.loading && schedules.length === 0 ? (
          <p className={styles.muted}>Loading…</p>
        ) : schedules.length === 0 ? (
          <p className={styles.muted}>No schedules.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Expression</th>
                  <th>Name</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.scheduleId}>
                    <td>
                      <code>{formatExpression(schedule)}</code>
                    </td>
                    <td>{schedule.name || '—'}</td>
                    <td>{schedule.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent runs</h3>
        {!blobConfigured && (
          <p className={styles.note}>
            Connect a Blob store to persist run history across invocations.
          </p>
        )}
        {events.length === 0 ? (
          <p className={styles.muted}>No runs yet.</p>
        ) : (
          <ul className={styles.runList}>
            {events.map(event => (
              <li key={event.id} className={styles.runItem}>
                <div className={styles.runMeta}>
                  <span>{formatTime(event.receivedAt)}</span>
                  <span>{event.type === 'prompt' ? 'prompt' : 'job'}</span>
                  {event.scheduleId ? (
                    <code>{event.scheduleId}</code>
                  ) : null}
                </div>
                {event.type === 'prompt' && event.prompt ? (
                  <>
                    <p className={styles.runPrompt}>{event.prompt}</p>
                    {event.answer ? (
                      <p className={styles.runAnswer}>{event.answer}</p>
                    ) : null}
                  </>
                ) : event.payload !== undefined ? (
                  <pre className={styles.payload}>
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                ) : event.scheduleName ? (
                  <p className={styles.runName}>{event.scheduleName}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
