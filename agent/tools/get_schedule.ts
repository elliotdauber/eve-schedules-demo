import { Schedules } from '@vercel/schedules';
import { defineTool } from 'eve/tools';
import { z } from 'zod';

export default defineTool({
  description: 'Get a single schedule by ID.',
  inputSchema: z.object({
    scheduleId: z.string().min(1),
  }),
  async execute({ scheduleId }) {
    const schedule = await Schedules.get(scheduleId);
    return { scheduleId, schedule };
  },
});
