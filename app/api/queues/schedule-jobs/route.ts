import { handleCallback } from '@vercel/queue';
import { recordActivity } from '@/lib/activity-log';
import { decodePromptName } from '@/lib/constants';
import { runScheduledPrompt } from '@/lib/run-scheduled-prompt';
import {
  isPromptPayload,
  jobPayloadMessage,
} from '@/lib/schedule-payload';
import { tenantSlugFromNamespace } from '@/lib/tenant';

export type ScheduleQueueMessage = {
  scheduleId: string;
  name: string;
  namespace: string;
  firedAt?: string;
  source?: string;
  payload?: unknown;
};

function resolveTenantName(message: ScheduleQueueMessage): string | null {
  if (!message.namespace) {
    return null;
  }

  return tenantSlugFromNamespace(message.namespace);
}

function resolvePrompt(message: ScheduleQueueMessage): string | null {
  if (isPromptPayload(message.payload)) {
    return message.payload.prompt;
  }

  return decodePromptName(message.name);
}

export const POST = handleCallback(async (message: ScheduleQueueMessage) => {
  const tenantName = resolveTenantName(message);

  if (!tenantName) {
    console.warn('[schedule fired] missing tenant namespace', message);
    return;
  }

  const prompt = resolvePrompt(message);

  if (prompt) {
    const answer = await runScheduledPrompt(prompt);
    await recordActivity(tenantName, {
      type: 'prompt',
      scheduleId: message.scheduleId,
      scheduleName: message.name,
      prompt,
      answer,
      payload: message.payload,
    });
    console.log(
      '[scheduled prompt]',
      tenantName,
      message.scheduleId,
      message.name,
      prompt,
      answer
    );
    return;
  }

  const jobMessage = jobPayloadMessage(message.payload);

  await recordActivity(tenantName, {
    type: 'job',
    scheduleId: message.scheduleId,
    scheduleName: message.name,
    message: jobMessage ?? undefined,
    payload: message.payload,
  });

  console.log('[schedule fired]', {
    tenantName,
    scheduleId: message.scheduleId,
    scheduleName: message.name,
    payload: message.payload,
  });
});
