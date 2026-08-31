export type PromptSchedulePayload = {
  type: 'prompt';
  prompt: string;
};

export type JobSchedulePayload = {
  type: 'job';
  message?: string;
  [key: string]: unknown;
};

export type SchedulePayload = PromptSchedulePayload | JobSchedulePayload;

export function createPromptPayload(prompt: string): PromptSchedulePayload {
  return {
    type: 'prompt',
    prompt: prompt.trim(),
  };
}

export function createJobPayload(
  input: Record<string, unknown> = {}
): JobSchedulePayload {
  return {
    type: 'job',
    ...input,
  };
}

export function isPromptPayload(
  payload: unknown
): payload is PromptSchedulePayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as PromptSchedulePayload).type === 'prompt' &&
    typeof (payload as PromptSchedulePayload).prompt === 'string' &&
    (payload as PromptSchedulePayload).prompt.trim().length > 0
  );
}

export function isJobPayload(payload: unknown): payload is JobSchedulePayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as JobSchedulePayload).type === 'job'
  );
}

export function jobPayloadMessage(payload: unknown): string | null {
  if (!isJobPayload(payload)) {
    return null;
  }

  return typeof payload.message === 'string' && payload.message.length > 0
    ? payload.message
    : null;
}
