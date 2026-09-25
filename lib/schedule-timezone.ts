export const TIMEZONE_STORAGE_KEY = 'eve-schedules-demo-timezone';
export const TIMEZONE_HEADER = 'x-schedule-timezone';

export const DEFAULT_SCHEDULE_TIMEZONE = 'America/Los_Angeles';

export const TIMEZONE_OPTIONS = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const;

export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_SCHEDULE_TIMEZONE;
  }
}

export function isValidTimezone(value: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimezone(raw: string): string {
  const value = raw.trim();
  if (!value) {
    throw new Error('Missing timezone');
  }
  if (!isValidTimezone(value)) {
    throw new Error(`Invalid timezone: ${value}`);
  }
  return value;
}

export function timezoneOptions(current?: string): string[] {
  const options = new Set<string>(TIMEZONE_OPTIONS);
  if (current && isValidTimezone(current)) {
    options.add(current);
  }
  return [...options].sort((a, b) => a.localeCompare(b));
}

export function formatTimezoneLabel(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const offset =
      parts.find(part => part.type === 'timeZoneName')?.value ?? '';
    const label = timezone.replace(/_/g, ' ');
    return offset ? `${label} (${offset})` : label;
  } catch {
    return timezone.replace(/_/g, ' ');
  }
}

/** Format a Date as YYYY-MM-DDTHH:mm in the given IANA timezone. */
export function formatLocalScheduleTime(
  date: Date,
  timezone: string
): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '00';

  const hour = get('hour') === '24' ? '00' : get('hour');

  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}
