import { handleCallback } from '@vercel/queue';
import { Schedules } from '@vercel/schedules';
import { recordActivity } from '@/lib/activity-log';
import { decodePromptName } from '@/lib/constants';
import { runScheduledPrompt } from '@/lib/run-scheduled-prompt';
import { tenantSlugFromNamespace } from '@/lib/tenant';

type QueuePayload = {
  scheduleId?: string;
  name?: string;
  [key: string]: unknown;
};

async function resolveScheduleContext(payload: QueuePayload): Promise<{
  scheduleId?: string;
  scheduleName?: string;
  tenantName?: string;
  namespace?: string;
}> {
  const scheduleId =
    typeof payload.scheduleId === 'string' ? payload.scheduleId : undefined;

  if (!scheduleId) {
    return {
      scheduleId,
      scheduleName:
        typeof payload.name === 'string' ? payload.name : undefined,
    };
  }

  try {
    const schedule = await Schedules.get(scheduleId);
    const tenantName = tenantSlugFromNamespace(schedule.namespace) ?? undefined;
    return {
      scheduleId,
      scheduleName: schedule.name,
      tenantName,
      namespace: schedule.namespace,
    };
  } catch {
    return { scheduleId };
  }
}

export const POST = handleCallback(async (payload: QueuePayload) => {
  const context = await resolveScheduleContext(payload);
  const { scheduleId, scheduleName, tenantName } = context;
  const prompt = decodePromptName(scheduleName);

  if (!tenantName) {
    console.warn('[schedule fired] missing tenant namespace', context);
    return;
  }

  if (prompt) {
    const answer = await runScheduledPrompt(prompt);
    await recordActivity(tenantName, {
      type: 'prompt',
      scheduleId,
      scheduleName,
      prompt,
      answer,
      payload,
    });
    console.log('[scheduled prompt]', tenantName, scheduleId, prompt, answer);
    return;
  }

  await recordActivity(tenantName, {
    type: 'job',
    scheduleId,
    scheduleName,
    payload,
  });

  console.log('[schedule fired]', { tenantName, scheduleId, scheduleName, payload });
});
