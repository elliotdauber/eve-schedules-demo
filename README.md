# Eve Schedules Demo

A Next.js + [Eve](https://eve.dev) demo for **Vercel Schedules** (`@vercel/schedules@0.0.0-alpha.2`). Chat with an AI agent to create cron jobs and one-shot tasks — schedules and run history display via HTTP polling, designed for Vercel serverless.

## Features

- **Chat-first UI** — create, list, get, and delete schedules via Eve agent tools
- **Queue-based schedules** — all schedules publish to a queue topic (like [cron-test](https://github.com/vercel/cron-test))
- **Scheduled AI prompts** — ask the agent to answer a question later or on a cron
- **Serverless-friendly display** — polls `/api/schedules` (Schedules API) and `/api/activity` (Vercel Blob) instead of in-memory WebSockets

## Agent tools

| Tool | Description |
|------|-------------|
| `create_schedule` | Create a cron or one-time queue schedule |
| `get_schedule` | Fetch a schedule by ID |
| `list_schedules` | List all schedules |
| `delete_schedule` | Delete a schedule |
| `schedule_prompt` | Schedule an AI prompt (delay, cron, or absolute time) |

## Prerequisites

- **Node.js 24+** (required by Eve)
- **Vercel CLI** (`npm i -g vercel@latest`)
- **AI Gateway API key** for the agent and scheduled prompts
- **Vercel Blob store** linked to the project (OIDC auth — no read-write token needed)

## Setup

```bash
cd eve-schedules-demo
pnpm install
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
```

On Vercel, connect a Blob store to the project — `BLOB_STORE_ID` is added automatically and the SDK authenticates via OIDC. Locally, run `vercel env pull` once.

## Development

```bash
pnpm dev:vc
```

Open [http://localhost:3000](http://localhost:3000).

Requires `vc dev` for the schedules broker and queue consumer. Plain `next dev` won't run schedules.

## Try it

1. **List schedules** — "What schedules are running?"
2. **Cron job** — "Create a job named heartbeat that runs every minute"
3. **Delayed prompt** — "In 30 seconds, tell me a fun fact about space"
4. **Cleanup** — "Delete all schedules"

The right panel polls every few seconds to show current schedules and recent runs.

## Architecture

```
Chat UI ──► Eve agent (/eve/v1/*) ──► agent tools ──► @vercel/schedules SDK
                                                          │
Schedule fires ──► queue topic (schedule-jobs) ───────────┘
                         │
                         ▼
              queue handler (handleCallback)
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
    Vercel Blob (activity)     GET /api/schedules (poll)
           │                           │
           └────────► Activity panel ◄─┘
```

### Queue handler

`app/api/queues/schedule-jobs/route.ts` uses `@vercel/queue`'s `handleCallback` (same pattern as cron-test). Wired in `vercel.json`:

```json
{
  "functions": {
    "app/api/queues/schedule-jobs/route.ts": {
      "experimentalTriggers": [{ "type": "queue/v2beta", "topic": "schedule-jobs" }]
    }
  }
}
```

## Deploy

```bash
vercel link
vercel env add AI_GATEWAY_API_KEY
vercel deploy
```

Schedules and queue handlers use Vercel OIDC in production — no manual token setup.
