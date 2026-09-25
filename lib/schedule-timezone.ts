export const TIMEZONE_STORAGE_KEY = 'eve-schedules-demo-timezone';
export const TIMEZONE_HEADER = 'x-schedule-timezone';

export const DEFAULT_SCHEDULE_TIMEZONE = 'America/Los_Angeles';
export const MIN_SCHEDULE_LEAD_MS = 15_000;

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

const SINGLE_AT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function normalizeSingleScheduleAt(at: string): string {
  const value = at.trim();
  if (/:\d{2}:\d{2}/.test(value) || value.endsWith('Z')) {
    throw new Error(
      'One-time at must be YYYY-MM-DDTHH:mm with no seconds and no timezone suffix.'
    );
  }

  const match = SINGLE_AT_PATTERN.exec(value);
  if (!match) {
    throw new Error(
      'One-time at must be YYYY-MM-DDTHH:mm in the schedule timezone (minute precision only).'
    );
  }

  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
}

export function currentLocalScheduleTime(timezone: string): string {
  return formatLocalScheduleTime(new Date(), timezone);
}

function localDateTimeParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '00';

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') === '24' ? '00' : get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Format a Date as YYYY-MM-DDTHH:mm in the given IANA timezone. */
export function formatLocalScheduleTime(
  date: Date,
  timezone: string
): string {
  const parts = localDateTimeParts(date, timezone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function localScheduleAtToDate(at: string, timezone: string): Date {
  const normalized = normalizeSingleScheduleAt(at);
  let lo = Date.parse(`${normalized}:00Z`) - 28 * 60 * 60 * 1000;
  let hi = Date.parse(`${normalized}:00Z`) + 28 * 60 * 60 * 1000;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const formatted = formatLocalScheduleTime(new Date(mid), timezone);
    if (formatted < normalized) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  const resolved = formatLocalScheduleTime(new Date(lo), timezone);
  if (resolved !== normalized) {
    throw new Error(`Invalid local schedule time ${at} in ${timezone}`);
  }

  return new Date(lo);
}

function addLocalMinutes(at: string, timezone: string, minutes: number): string {
  const date = localScheduleAtToDate(at, timezone);
  return formatLocalScheduleTime(
    new Date(date.getTime() + minutes * 60_000),
    timezone
  );
}

function ceilToLocalMinute(date: Date, timezone: string): string {
  const parts = localDateTimeParts(date, timezone);
  const base = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;

  if (Number(parts.second) > 0 || date.getMilliseconds() > 0) {
    return addLocalMinutes(base, timezone, 1);
  }

  return base;
}

/** Align to minute boundaries and enforce the minimum lead time. */
export function prepareScheduleAtFromDate(
  target: Date,
  timezone: string,
  now: Date = new Date()
): string {
  let at = ceilToLocalMinute(target, timezone);
  const minMs = now.getTime() + MIN_SCHEDULE_LEAD_MS;

  while (localScheduleAtToDate(at, timezone).getTime() < minMs) {
    at = addLocalMinutes(at, timezone, 1);
  }

  return at;
}

export function prepareSingleScheduleAt(
  at: string,
  timezone: string,
  now: Date = new Date()
): string {
  const normalized = normalizeSingleScheduleAt(at);
  const target = localScheduleAtToDate(normalized, timezone);

  if (target.getTime() <= now.getTime()) {
    throw new Error(
      `One-time schedule at ${normalized} is in the past. Current local time in ${timezone} is ${currentLocalScheduleTime(timezone)}. For relative times ("in 30 seconds", "in 1 minute"), use when.type "delay" instead of "single".`
    );
  }

  return prepareScheduleAtFromDate(target, timezone, now);
}
