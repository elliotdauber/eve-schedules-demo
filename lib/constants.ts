export const DEFAULT_QUEUE_TOPIC = 'schedule-jobs';

/** @deprecated Legacy prompt schedules stored the prompt in the schedule name. */
export const PROMPT_NAME_PREFIX = '__prompt__:';

export function decodePromptName(name: string | undefined): string | null {
  if (!name?.startsWith(PROMPT_NAME_PREFIX)) {
    return null;
  }
  return name.slice(PROMPT_NAME_PREFIX.length);
}
