import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'Permanently delete a schedule by ID.',
  inputSchema: z.object({
    scheduleId: z.string().min(1),
  }),
  async execute({ scheduleId }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    await getScheduleInNamespace(scheduleId, namespace);
    await Schedules.delete(scheduleId);
    return { scheduleId, deleted: true };
  },
});
