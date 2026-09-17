import type { Schedule } from '@vercel/schedules';
import { Schedules } from '@vercel/schedules';

export function defaultScheduleName(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export async function getScheduleInNamespace(
  name: string,
  namespace: string
): Promise<Schedule> {
  return Schedules.get({ name, namespace });
}
