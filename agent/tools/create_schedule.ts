import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { DEFAULT_QUEUE_TOPIC } from '@/lib/constants';
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
    'Create a new schedule targeting a queue topic. Use cron for recurring jobs or single for a one-time run at an ISO timestamp.',
  inputSchema: z.object({
    expression: expressionSchema,
    name: z
      .string()
      .optional()
      .describe('Optional label stored on the schedule (visible when it fires)'),
    topic: z
      .string()
      .default(DEFAULT_QUEUE_TOPIC)
      .describe('Queue topic the schedule publishes to'),
  }),
  async execute(input, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const result = await Schedules.create({
      expression: input.expression,
      target: { topic: input.topic },
      namespace,
      ...(input.name ? { name: input.name } : {}),
    });
    const schedule = await getScheduleInNamespace(result.scheduleId, namespace);

    return {
      scheduleId: result.scheduleId,
      namespace,
      schedule,
    };
  },
});
