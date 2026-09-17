import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { getScheduleInNamespace } from '@/lib/schedules-tenant';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'Permanently delete a schedule by name.',
  inputSchema: z.object({
    name: z.string().min(1),
  }),
  async execute({ name }, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    await getScheduleInNamespace(name, namespace);
    await Schedules.delete({ name, namespace });
    return { name, deleted: true };
  },
});
