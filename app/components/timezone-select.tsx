'use client';

import {
  formatTimezoneLabel,
  timezoneOptions,
} from '@/lib/schedule-timezone';
import { useTenant } from '@/lib/tenant-context';
import styles from './timezone-select.module.css';

type TimezoneSelectProps = {
  compact?: boolean;
};

export function TimezoneSelect({ compact = false }: TimezoneSelectProps) {
  const { timezone, setTimezone } = useTenant();
  const options = timezoneOptions(timezone);

  return (
    <label className={compact ? styles.compact : styles.field}>
      {!compact ? (
        <span className={styles.label}>Timezone</span>
      ) : null}
      <select
        className={styles.select}
        value={timezone}
        onChange={event => setTimezone(event.target.value)}
        aria-label="Schedule timezone"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {formatTimezoneLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
