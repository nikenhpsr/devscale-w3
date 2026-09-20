import type { Context, Env } from "hono";
import { parseYoutubeId } from "../lib/youtube";
import { createSummarySchema } from "../schemas/summary.schema";
import { requestSummary } from "../services/summary.service";
import { listSummaries } from "../services/video.service";

export async function createSummary(c: Context) {
  const body = createSummarySchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "youtubeUrl is required" }, 400);
  }

  const { youtubeUrl } = body.data;
  const youtubeId = parseYoutubeId(youtubeUrl);
  if (!youtubeId) {
    return c.json({ error: "not a YouTube video url" }, 400);
  }

  const accepted = await requestSummary(youtubeId, youtubeUrl);
  return c.json(accepted, 202);
}

export async function getVideoSummaries(c: Context<Env, "/:id/summaries">) {
  const summaries = await listSummaries(c.req.param("id"));
  return c.json({ summaries });
}
