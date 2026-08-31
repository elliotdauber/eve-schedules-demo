import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { toScheduleSummary } from '@/lib/schedule-present';
import { getTenantNamespaceFromContext } from '@/lib/tool-tenant';

export default defineTool({
  description: 'List all schedules for the current user.',
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const namespace = getTenantNamespaceFromContext(ctx);
    const result = await Schedules.list({ namespace });

    return {
      schedules: result.data.map(toScheduleSummary),
      count: result.data.length,
    };
  },
});
