import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { DEFAULT_QUEUE_TOPIC } from '@/lib/constants';

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
  async execute({ expression, name, topic }) {
    const result = await Schedules.create({
      expression,
      target: { topic },
      ...(name ? { name } : {}),
    });
    const schedule = await Schedules.get(result.scheduleId);

    return {
      scheduleId: result.scheduleId,
      schedule,
    };
  },
});
