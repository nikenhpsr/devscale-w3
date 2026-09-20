import { Agent } from "@anvia/core";
import { createSummaryMemoryCompactor } from "@anvia/core/memory";
import { PrismaMemoryStore } from "@anvia/memory-prisma/v8";
import { db } from "../lib/db";
import { model } from "../lib/model";
import { youtubeTools } from "./tools";

export const memory = new PrismaMemoryStore({ client: db });

const instructions = `You summarize YouTube videos.
Workflow: get_video_info for the title, get_transcript for the spoken content, then write the summary and store it with save_summary.
Every tool takes the YouTube id, never a database id: do not invent ids.
Check list_past_summaries first so you do not repeat a summary that already exists, and call save_summary exactly once.
Format: one short paragraph, then 3-6 bullet takeaways.
If no transcript is available, say so instead of guessing what the video says.`;

export const summarizerAgent = new Agent({
  id: "youtube-summarizer",
  name: "YouTube Summarizer",
  description: "Summarizes YouTube videos from their transcript.",
  model,
  instructions,
  maxTurns: 8,
  tools: youtubeTools,
  memory: {
    store: memory,
    savePolicy: "turn",
    compaction: {
      trigger: { afterTokens: 32_000 },
      retention: { recentTurns: 2 },
      compactor: createSummaryMemoryCompactor({ model, maxTokens: 1024 }),
    },
  },
});

export function videoSession(videoId: string) {
  return { sessionId: `video:${videoId}` };
}
