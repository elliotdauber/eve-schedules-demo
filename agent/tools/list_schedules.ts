import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';

export default defineTool({
  description: 'List all schedules in this project.',
  inputSchema: z.object({}),
  async execute() {
    const result = await Schedules.list();

    return {
      schedules: result.data,
      count: result.data.length,
      cursor: result.cursor,
    };
  },
});
