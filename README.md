# YouTube Summarizer Agent

Agent that summarizes a YouTube video from its transcript. Hono for the API, BullMQ + Redis for the job queue, Prisma Next (Postgres) for both product data and agent memory.

## Layout

| Path | Purpose |
|---|---|
| `src/index.ts` | Server bootstrap; also starts the queue worker |
| `src/app.ts` | Hono app, mounts the route groups |
| `src/routes/` | Path → controller (`summary`, `job`, `video`) |
| `src/controllers/` | Read the request, call a service, shape the response |
| `src/services/` | The actual work: DB queries and enqueueing |
| `src/schemas/` | Zod request schemas |
| `src/agent/summarizer.ts` | The agent: model, instructions, tools, Prisma memory with compaction |
| `src/agent/tools.ts` | `get_video_info`, `get_transcript`, `save_summary`, `list_past_summaries` |
| `src/queue/summarize.ts` | BullMQ queue |
| `src/queue/worker.ts` | Worker: runs the agent, updates the `Jobs` row through `job.service` |
| `src/lib/` | Shared clients and helpers: `db`, `model`, `redis`, `youtube` |
| `src/studio.ts` | Anvia Studio bound to the same agent |
| `prisma/schema.prisma` | Data contract, including the generated Anvia memory models |

Request flow: `routes → controllers → services → db/queue`. Controllers never touch `db` directly, and services never touch the Hono `Context`, so the worker reuses `services/job.service.ts` unchanged.

## Setup

```sh
cp .env.example .env   # fill DATABASE_URL, REDIS_URL, OPEN_AI_APIKEY, OPEN_AI_BASE_URL, AI_MODEL_ID
docker compose up -d
pnpm install
pnpm prisma contract emit
pnpm prisma db update
```

## Run

```sh
pnpm dev      # API + worker on :3000
pnpm studio   # Studio playground on :4021/playground
```

## API

```sh
curl -X POST localhost:3000/summaries -H 'content-type: application/json' \
  -d '{"youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
# -> { jobId, videoId, status }

curl localhost:3000/jobs/<jobId>
curl localhost:3000/videos/<videoId>/summaries
```

## Memory

`PrismaMemoryStore` (`@anvia/memory-prisma/v8`) keeps one session per video (`video:<videoId>`) in the `AgentMemory*` tables.