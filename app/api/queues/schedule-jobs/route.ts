import { handleCallback } from '@vercel/queue';
import { Schedules } from '@vercel/schedules';
import { recordActivity } from '@/lib/activity-log';
import { decodePromptName } from '@/lib/constants';
import { runScheduledPrompt } from '@/lib/run-scheduled-prompt';

type QueuePayload = {
  scheduleId?: string;
  name?: string;
  [key: string]: unknown;
};

async function resolveScheduleName(
  payload: QueuePayload
): Promise<{ scheduleId?: string; scheduleName?: string }> {
  const scheduleId =
    typeof payload.scheduleId === 'string' ? payload.scheduleId : undefined;

  if (typeof payload.name === 'string' && payload.name.length > 0) {
    return { scheduleId, scheduleName: payload.name };
  }

  if (!scheduleId) {
    return {};
  }

  try {
    const schedule = await Schedules.get(scheduleId);
    return { scheduleId, scheduleName: schedule.name };
  } catch {
    return { scheduleId };
  }
}

export const POST = handleCallback(async (payload: QueuePayload) => {
  const { scheduleId, scheduleName } = await resolveScheduleName(payload);
  const prompt = decodePromptName(scheduleName);

  if (prompt) {
    const answer = await runScheduledPrompt(prompt);
    await recordActivity({
      type: 'prompt',
      scheduleId,
      scheduleName,
      prompt,
      answer,
      payload,
    });
    console.log('[scheduled prompt]', scheduleId, prompt, answer);
    return;
  }

  await recordActivity({
    type: 'job',
    scheduleId,
    scheduleName,
    payload,
  });

  console.log('[schedule fired]', { scheduleId, scheduleName, payload });
});
