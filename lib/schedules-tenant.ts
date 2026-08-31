import type { Schedule } from '@vercel/schedules';
import { Schedules } from '@vercel/schedules';

export async function getScheduleInNamespace(
  scheduleId: string,
  namespace: string
): Promise<Schedule> {
  const schedule = await Schedules.get(scheduleId);
  if (schedule.namespace !== namespace) {
    throw new Error(`Schedule ${scheduleId} is not in namespace ${namespace}`);
  }
  return schedule;
}
