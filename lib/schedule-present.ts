import type { Schedule, ScheduleExpression } from '@vercel/schedules';

export type ScheduleSummary = {
  scheduleId: string;
  name: string;
  expression: ScheduleExpression;
  state: Schedule['state'];
  createdAt: number;
  updatedAt: number;
};

export function toScheduleSummary(schedule: Schedule): ScheduleSummary {
  return {
    scheduleId: schedule.scheduleId,
    name: schedule.name,
    expression: schedule.expression,
    state: schedule.state,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}

export function formatExpression(expression: ScheduleExpression): string {
  if (expression.type === 'cron') {
    return expression.cron;
  }
  return expression.at;
}
