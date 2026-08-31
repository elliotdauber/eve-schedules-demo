import { Schedules } from '@vercel/schedules';
import type { ScheduleExpression } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import {
  DEFAULT_QUEUE_TOPIC,
  encodePromptName,
} from '@/lib/constants';
import { toScheduleSummary } from '@/lib/schedule-present';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

const whenSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cron'),
    cron: z.string().min(1),
  }),
  z.object({
    type: z.literal('single'),
    at: z.string().min(1),
  }),
  z.object({
    type: z.literal('delay'),
    duration: z
      .string()
      .regex(/^\d+(s|m|h|d)$/, 'Use durations like 30s, 5m, 1h, 1d'),
  }),
]);

function whenToExpression(
  when: z.infer<typeof whenSchema>
): ScheduleExpression {
  if (when.type === 'delay') {
    const match = /^(\d+)(s|m|h|d)$/.exec(when.duration);
    if (!match) {
      throw new Error('Invalid delay duration');
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const at = new Date(
      Date.now() + amount * multipliers[unit as keyof typeof multipliers]
    ).toISOString();

    return { type: 'single', at };
  }

  return when;
}

export default defineTool({
  description:
    'Schedule an AI prompt to run later or on a cron. Use delay for relative times like 1m or 30s. Answers appear in the activity panel.',
  inputSchema: z.object({
    prompt: z.string().min(1),
    when: whenSchema,
    name: z.string().optional(),
  }),
  async execute({ prompt, when, name }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const expression = whenToExpression(when);
    const scheduleName = name ?? encodePromptName(prompt);

    const result = await Schedules.create({
      expression,
      target: { topic: DEFAULT_QUEUE_TOPIC },
      namespace,
      name: scheduleName,
    });

    const schedule = await getScheduleInNamespace(result.scheduleId, namespace);

    return {
      schedule: toScheduleSummary(schedule),
      note: 'The answer will appear in the activity panel when the schedule runs.',
    };
  },
});
