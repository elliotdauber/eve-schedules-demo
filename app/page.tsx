'use client';

import { AgentChat } from './components/agent-chat';
import { ActivityPanel } from './components/activity-panel';
import { TenantGate } from './components/tenant-gate';
import { TenantSwitcher } from './components/tenant-switcher';
import styles from './page.module.css';

export default function Home() {
  return (
    <TenantGate>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Eve Schedules Demo</h1>
            <p className={styles.tagline}>
              Manage cron and one-shot schedules via the agent
            </p>
          </div>
          <div className={styles.headerMeta}>
            <TenantSwitcher />
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
    </TenantGate>
  );
}
