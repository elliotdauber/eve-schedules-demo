import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'Get a single schedule by ID within the current tenant namespace.',
  inputSchema: z.object({
    scheduleId: z.string().min(1),
  }),
  async execute({ scheduleId }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const schedule = await getScheduleInNamespace(scheduleId, namespace);
    return { scheduleId, namespace, schedule };
  },
});
