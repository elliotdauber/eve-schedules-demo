import { Schedules } from '@vercel/schedules';
import type { ScheduleExpression } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { DEFAULT_QUEUE_TOPIC } from '@/lib/constants';
import { createPromptPayload } from '@/lib/schedule-payload';
import { toScheduleSummary } from '@/lib/schedule-present';
import { defaultScheduleName } from '@/lib/schedules-tenant';
import {
  prepareScheduleAtFromDate,
  prepareSingleScheduleAt,
} from '@/lib/schedule-timezone';
import {
  getScheduleTimezoneFromContext,
  getTenantNamespaceFromContext,
} from '@/lib/tool-tenant';

const whenSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cron'),
    cron: z.string().min(1),
  }),
  z.object({
    type: z.literal('single'),
    at: z
      .string()
      .min(1)
      .describe(
        'Future local datetime YYYY-MM-DDTHH:mm (minute precision, no seconds). Prefer type "delay" for relative times.'
      ),
  }),
  z.object({
    type: z.literal('delay'),
    duration: z
      .string()
      .regex(/^\d+(s|m|h|d)$/, 'Use durations like 30s, 5m, 1h, 1d'),
  }),
]);

function whenToExpression(
  when: z.infer<typeof whenSchema>,
  timezone: string
): ScheduleExpression {
  if (when.type === 'delay') {
    const match = /^(\d+)(s|m|h|d)$/.exec(when.duration);
    if (!match) {
      throw new Error('Invalid delay duration');
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const at = prepareScheduleAtFromDate(
      new Date(
        Date.now() + amount * multipliers[unit as keyof typeof multipliers]
      ),
      timezone
    );

    return { type: 'single', at };
  }

  if (when.type === 'single') {
    return {
      type: 'single',
      at: prepareSingleScheduleAt(when.at, timezone),
    };
  }

  return when;
}

export default defineTool({
  description:
    'Schedule an AI prompt to run later or on a cron. For relative times ("in 30 seconds", "in 1 minute"), always use when.type "delay" — never type "single" with a hand-computed at. Answers appear in the activity panel.',
  inputSchema: z.object({
    prompt: z.string().min(1),
    when: whenSchema,
    name: z.string().optional(),
  }),
  async execute({ prompt, when, name }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const timezone = getScheduleTimezoneFromContext(ctx);
    const expression = whenToExpression(when, timezone);
    const payload = createPromptPayload(prompt);

    const schedule = await Schedules.create({
      name: name ?? defaultScheduleName('scheduled-prompt'),
      expression,
      timezone,
      target: { topic: DEFAULT_QUEUE_TOPIC },
      namespace,
      payload,
    });

    return {
      schedule: toScheduleSummary(schedule, payload),
      note: 'The answer will appear in the activity panel when the schedule runs.',
    };
  },
});
