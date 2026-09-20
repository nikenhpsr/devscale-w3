import { createTool } from "@anvia/core";
import { YoutubeTranscript } from "youtube-transcript";
import { z } from "zod";
import { watchUrl } from "../lib/youtube";
import {
  createSummary,
  findOrCreateVideo,
  findVideoByYoutubeId,
  listSummaries,
} from "../services/video.service";

const MAX_TRANSCRIPT_CHARS = 40_000;

const getVideoInfo = createTool({
  name: "get_video_info",
  description: "Get the title and channel of a YouTube video by its id.",
  inputSchema: z.object({ youtubeId: z.string() }),
  execute: async ({ youtubeId }) => {
    const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl(youtubeId))}`;
    const response = await fetch(oembed);
    if (!response.ok) {
      return { found: false as const, status: response.status };
    }
    const video = (await response.json()) as { title: string; author_name: string };
    return { found: true as const, title: video.title, channel: video.author_name };
  },
});

const getTranscript = createTool({
  name: "get_transcript",
  description: "Get the spoken transcript of a YouTube video by its id.",
  inputSchema: z.object({
    youtubeId: z.string(),
    lang: z.string().optional().describe("ISO language code, e.g. en or id"),
  }),
  execute: async ({ youtubeId, lang }) => {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(youtubeId, lang ? { lang } : undefined);
      const text = segments.map((segment) => segment.text).join(" ");
      return {
        available: true as const,
        truncated: text.length > MAX_TRANSCRIPT_CHARS,
        text: text.slice(0, MAX_TRANSCRIPT_CHARS),
      };
    } catch (error) {
      return { available: false as const, reason: error instanceof Error ? error.message : "unknown error" };
    }
  },
});

const saveSummary = createTool({
  name: "save_summary",
  description: "Store the finished summary for a YouTube video.",
  inputSchema: z.object({
    youtubeId: z.string(),
    content: z.string().min(1),
  }),
  execute: async ({ youtubeId, content }) => {
    const video = await findOrCreateVideo(youtubeId);
    const summary = await createSummary(video.id, content);
    return { summaryId: summary.id, createdAt: summary.createdAt.toString() };
  },
});

const listPastSummaries = createTool({
  name: "list_past_summaries",
  description: "List earlier summaries stored for a YouTube video, newest first.",
  inputSchema: z.object({
    youtubeId: z.string(),
    limit: z.number().int().min(1).max(10).default(3),
  }),
  execute: async ({ youtubeId, limit }) => {
    const video = await findVideoByYoutubeId(youtubeId);
    if (!video) {
      return { summaries: [] };
    }
    const summaries = await listSummaries(video.id, limit);
    return {
      summaries: summaries.map((summary) => ({
        id: summary.id,
        content: summary.content,
        createdAt: summary.createdAt.toString(),
      })),
    };
  },
});

export const youtubeTools = [getVideoInfo, getTranscript, saveSummary, listPastSummaries];
