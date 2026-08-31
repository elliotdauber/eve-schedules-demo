'use client';

import { AgentChat } from './components/agent-chat';
import { ActivityPanel } from './components/activity-panel';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoMark} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 5v5l3 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Eve Schedules</h1>
            <p className={styles.tagline}>
              Create cron jobs and timed tasks through conversation
            </p>
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.pill}>Vercel Schedules</span>
          <span className={styles.pill}>Eve Agent</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.chatSection}>
          <AgentChat />
        </section>
        <aside className={styles.activitySection}>
          <ActivityPanel />
        </aside>
      </main>
    </div>
  );
}
