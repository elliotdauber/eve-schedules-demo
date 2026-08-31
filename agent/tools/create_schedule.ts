import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { DEFAULT_QUEUE_TOPIC } from '@/lib/constants';
import { createJobPayload } from '@/lib/schedule-payload';
import { toScheduleSummary } from '@/lib/schedule-present';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

const expressionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cron'),
    cron: z.string().min(1),
  }),
  z.object({
    type: z.literal('single'),
    at: z.string().min(1),
  }),
]);

export default defineTool({
  description:
    'Create a new schedule. Use cron for recurring jobs or single for a one-time run at an ISO timestamp. Optional payload is delivered when the schedule fires.',
  inputSchema: z.object({
    expression: expressionSchema,
    name: z
      .string()
      .optional()
      .describe('Optional label for the schedule'),
    payload: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'JSON payload delivered when the schedule fires, e.g. { "message": "heartbeat" }'
      ),
  }),
  async execute(input, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const payload = input.payload
      ? createJobPayload(input.payload)
      : undefined;

    const result = await Schedules.create({
      expression: input.expression,
      target: { topic: DEFAULT_QUEUE_TOPIC },
      namespace,
      ...(input.name ? { name: input.name } : {}),
      ...(payload ? { payload } : {}),
    });
    const schedule = await getScheduleInNamespace(result.scheduleId, namespace);

    return {
      schedule: toScheduleSummary(schedule, payload),
    };
  },
});
