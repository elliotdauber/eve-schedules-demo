'use client';

import { useEveAgent } from 'eve/react';
import styles from './agent-chat.module.css';

const SUGGESTIONS = [
  'List all my schedules',
  'Create a job named "heartbeat" that runs every minute',
  'In 30 seconds, tell me a fun fact about the moon',
  'Delete a schedule — show me what exists first',
];

function MessagePart({
  part,
}: {
  part: {
    type: string;
    text?: string;
    toolName?: string;
    state?: string;
    input?: unknown;
    output?: unknown;
  };
}) {
  if (part.type === 'text' && part.text) {
    return <p className={styles.messageText}>{part.text}</p>;
  }

  if (part.type === 'dynamic-tool') {
    const isDone = part.state === 'output-available';
    return (
      <div className={styles.toolCall} data-done={isDone}>
        <div className={styles.toolHeader}>
          <span className={styles.toolIcon} aria-hidden>
            {isDone ? '✓' : '⚡'}
          </span>
          <span className={styles.toolName}>{part.toolName}</span>
          {part.state ? (
            <span className={styles.toolState}>{part.state}</span>
          ) : null}
        </div>
        {part.input !== undefined ? (
          <details className={styles.toolDetails} open={!isDone}>
            <summary>Input</summary>
            <pre className={styles.toolPayload}>
              {JSON.stringify(part.input, null, 2)}
            </pre>
          </details>
        ) : null}
        {part.output !== undefined ? (
          <details className={styles.toolDetails} open>
            <summary>Output</summary>
            <pre className={styles.toolPayload}>
              {JSON.stringify(part.output, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>
    );
  }

  if (part.type === 'reasoning' && part.text) {
    return (
      <details className={styles.reasoning}>
        <summary>Reasoning</summary>
        <p className={styles.messageText}>{part.text}</p>
      </details>
    );
  }

  return null;
}

function formatAgentError(error: Error): string {
  const message = error.message;

  if (
    message.includes('<!DOCTYPE html>') ||
    message.includes('404') ||
    message.includes('This page could not be found')
  ) {
    return (
      'Eve agent unavailable — /eve/v1/session returned 404. ' +
      'Run with Node.js 24+ via `pnpm dev:vc`.'
    );
  }

  return message.length > 400 ? `${message.slice(0, 400)}…` : message;
}

export function AgentChat() {
  const agent = useEveAgent();
  const isBusy =
    agent.status === 'submitted' || agent.status === 'streaming';

  return (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        <div>
          <h2 className={styles.chatTitle}>Schedule assistant</h2>
          <p className={styles.chatHint}>
            All schedule CRUD goes through agent tools. The panel on the right
            polls the Schedules API for the current state.
          </p>
        </div>
        <span className={styles.statusBadge} data-status={agent.status}>
          {agent.status}
        </span>
      </div>

      {agent.error ? (
        <p className={styles.error} role="alert">
          {formatAgentError(agent.error)}
        </p>
      ) : null}

      <div className={styles.messages} aria-live="polite">
        {agent.data.messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Try one of these</p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  className={styles.suggestionChip}
                  disabled={isBusy}
                  onClick={() => void agent.send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          agent.data.messages.map(message => (
            <article
              key={message.id}
              className={styles.message}
              data-role={message.role}
            >
              <header className={styles.messageRole}>
                {message.role === 'user' ? 'You' : 'Agent'}
              </header>
              <div className={styles.messageBody}>
                {message.parts.map((part, index) => (
                  <MessagePart key={index} part={part} />
                ))}
              </div>
            </article>
          ))
        )}
      </div>

      <form
        className={styles.composer}
        onSubmit={event => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const message = String(form.get('message') ?? '').trim();
          if (message.length === 0) {
            return;
          }

          void agent.send(message);
          event.currentTarget.reset();
        }}
      >
        <textarea
          name="message"
          className={styles.input}
          placeholder="Create a cron job, schedule a prompt, list schedules…"
          rows={2}
          disabled={isBusy}
        />
        <div className={styles.composerActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            disabled={isBusy}
            onClick={() => agent.reset()}
          >
            New chat
          </button>
          <button
            type="submit"
            className={styles.button}
            disabled={isBusy}
          >
            {isBusy ? 'Working…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
