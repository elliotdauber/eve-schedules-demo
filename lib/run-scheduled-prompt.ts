import { gateway } from '@ai-sdk/gateway';
import { generateText } from 'ai';

const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export async function runScheduledPrompt(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: gateway(process.env.SCHEDULED_PROMPT_MODEL ?? DEFAULT_MODEL),
    prompt,
  });

  return text;
}

export function parsePromptPayload(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || !('prompt' in payload)) {
    throw new Error('Schedule payload must include a "prompt" string');
  }

  const prompt = (payload as { prompt: unknown }).prompt;
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Schedule payload "prompt" must be a non-empty string');
  }

  return prompt.trim();
}
