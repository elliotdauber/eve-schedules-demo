import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'List all schedules in the current tenant namespace.',
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const result = await Schedules.list({ namespace });

    return {
      namespace,
      schedules: result.data,
      count: result.data.length,
      cursor: result.cursor,
    };
  },
});
