import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { toScheduleSummary } from '@/lib/schedule-present';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'Get a single schedule by ID.',
  inputSchema: z.object({
    scheduleId: z.string().min(1),
  }),
  async execute({ scheduleId }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const schedule = await getScheduleInNamespace(scheduleId, namespace);
    return { schedule: toScheduleSummary(schedule) };
  },
});
