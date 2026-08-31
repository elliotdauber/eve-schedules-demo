export const DEFAULT_QUEUE_TOPIC = 'schedule-jobs';
export const PROMPT_NAME_PREFIX = '__prompt__:';

export function encodePromptName(prompt: string): string {
  return `${PROMPT_NAME_PREFIX}${prompt.trim()}`;
}

export function decodePromptName(name: string | undefined): string | null {
  if (!name?.startsWith(PROMPT_NAME_PREFIX)) {
    return null;
  }
  return name.slice(PROMPT_NAME_PREFIX.length);
}
