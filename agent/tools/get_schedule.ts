import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { toScheduleSummary } from '@/lib/schedule-present';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'Get a single schedule by name.',
  inputSchema: z.object({
    name: z.string().min(1),
  }),
  async execute({ name }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const schedule = await getScheduleInNamespace(name, namespace);
    return { schedule: toScheduleSummary(schedule) };
  },
});
