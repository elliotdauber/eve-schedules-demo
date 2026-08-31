import type { Schedule, ScheduleExpression } from '@vercel/schedules';

export type ScheduleSummary = {
  scheduleId: string;
  name: string;
  expression: ScheduleExpression;
  state: Schedule['state'];
  createdAt: number;
  updatedAt: number;
  payload?: unknown;
};

export function toScheduleSummary(
  schedule: Schedule,
  payload?: unknown
): ScheduleSummary {
  return {
    scheduleId: schedule.scheduleId,
    name: schedule.name,
    expression: schedule.expression,
    state: schedule.state,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
    ...(payload !== undefined ? { payload } : {}),
  };
}

export function formatExpression(expression: ScheduleExpression): string {
  if (expression.type === 'cron') {
    return expression.cron;
  }
  return expression.at;
}

export function payloadLabel(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (record.type === 'prompt' && typeof record.prompt === 'string') {
    return record.prompt;
  }

  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message;
  }

  return null;
}
