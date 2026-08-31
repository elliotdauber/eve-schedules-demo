'use client';

import type { Schedule } from '@vercel/schedules';
import type { ActivityRecord } from '@/lib/activity-log';
import { usePoll } from '@/lib/use-poll';
import styles from './activity-panel.module.css';

type SchedulesResponse = {
  schedules: Schedule[];
  count: number;
};

type ActivityResponse = {
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

function formatTimestamp(value: number): string {
  return new Date(value).toLocaleString();
}

export function ActivityPanel() {
  const schedulesPoll = usePoll<SchedulesResponse>('/api/schedules', 5000);
  const activityPoll = usePoll<ActivityResponse>('/api/activity', 4000);

  const schedules = schedulesPoll.data?.schedules ?? [];
  const events = activityPoll.data?.events ?? [];
  const blobConfigured = activityPoll.data?.blobConfigured ?? false;

  const pollStatus =
    schedulesPoll.error || activityPoll.error
      ? 'error'
      : schedulesPoll.loading
        ? 'loading'
        : 'live';

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Schedules & activity</h2>
          <p className={styles.panelHint}>
            Polls the Schedules API and activity log — works on serverless.
          </p>
        </div>
        <span className={styles.pollStatus} data-status={pollStatus}>
          {pollStatus === 'live' && schedulesPoll.refreshedAt
            ? `Updated ${formatTime(schedulesPoll.refreshedAt)}`
            : pollStatus}
        </span>
      </div>

      {(schedulesPoll.error || activityPoll.error) && (
        <p className={styles.error} role="alert">
          {schedulesPoll.error ?? activityPoll.error}
        </p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{schedules.length}</span>
          <span className={styles.statLabel}>Schedules</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{events.length}</span>
          <span className={styles.statLabel}>Recent runs</span>
        </div>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Active schedules</h3>
        {schedulesPoll.loading && schedules.length === 0 ? (
          <p className={styles.muted}>Loading schedules…</p>
        ) : schedules.length === 0 ? (
          <p className={styles.muted}>
            No schedules yet. Ask the agent to create one.
          </p>
        ) : (
          <ul className={styles.scheduleList}>
            {schedules.map(schedule => (
              <li key={schedule.scheduleId} className={styles.scheduleItem}>
                <div className={styles.scheduleRow}>
                  <code className={styles.scheduleId}>{schedule.scheduleId}</code>
                  <span
                    className={styles.stateBadge}
                    data-state={schedule.state}
                  >
                    {schedule.state}
                  </span>
                </div>
                <p className={styles.scheduleExpr}>
                  {formatExpression(schedule)}
                </p>
                {schedule.name ? (
                  <p className={styles.scheduleName}>{schedule.name}</p>
                ) : null}
                <p className={styles.scheduleMeta}>
                  topic <code>{schedule.target.topic}</code>
                  {' · '}
                  {formatTimestamp(schedule.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent activity</h3>
        {!blobConfigured && (
          <p className={styles.blobHint}>
            Connect a Vercel Blob store to this project for persistent run
            history. Auth uses OIDC automatically — no read-write token needed.
          </p>
        )}
        {events.length === 0 ? (
          <p className={styles.muted}>
            {blobConfigured
              ? 'No runs recorded yet.'
              : 'Runs are logged to the console until Blob is configured.'}
          </p>
        ) : (
          <div className={styles.timeline}>
            {events.map(event => (
              <article key={event.id} className={styles.event}>
                <div className={styles.eventHeader}>
                  <span
                    className={styles.eventKind}
                    data-type={event.type}
                  >
                    {event.type === 'prompt' ? 'AI prompt' : 'Queue job'}
                  </span>
                  <time>{formatTime(event.receivedAt)}</time>
                </div>
                {event.scheduleId ? (
                  <code className={styles.eventScheduleId}>
                    {event.scheduleId}
                  </code>
                ) : null}
                {event.scheduleName ? (
                  <p className={styles.eventName}>{event.scheduleName}</p>
                ) : null}
                {event.type === 'prompt' && event.prompt ? (
                  <>
                    <p className={styles.promptText}>{event.prompt}</p>
                    {event.answer ? (
                      <p className={styles.answerText}>{event.answer}</p>
                    ) : null}
                  </>
                ) : event.payload !== undefined ? (
                  <pre className={styles.payload}>
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
