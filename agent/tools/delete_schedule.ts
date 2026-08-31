import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';

export default defineTool({
  description: 'Permanently delete a schedule by ID.',
  inputSchema: z.object({
    scheduleId: z.string().min(1),
  }),
  async execute({ scheduleId }) {
    await Schedules.delete(scheduleId);
    return { scheduleId, deleted: true };
  },
});
