import { db } from "../lib/db";
import { watchUrl } from "../lib/youtube";

export function findVideoByYoutubeId(youtubeId: string) {
  return db.orm.public.Videos.where({ youtubeId }).select("id").first();
}

export async function findOrCreateVideo(youtubeId: string, youtubeUrl = watchUrl(youtubeId)) {
  const existing = await findVideoByYoutubeId(youtubeId);
  if (existing) {
    return existing;
  }
  return db.orm.public.Videos.select("id").create({
    youtubeUrl,
    youtubeId,
    title: youtubeId,
  });
}

export function createSummary(videoId: string, content: string) {
  return db.orm.public.Summaries.select("id", "createdAt").create({ videoId, content });
}

export function listSummaries(videoId: string, limit?: number) {
  const summaries = db.orm.public.Summaries
    .where({ videoId })
    .select("id", "content", "createdAt")
    .orderBy((summary) => summary.createdAt.desc());

  return limit === undefined ? summaries.all() : summaries.limit(limit).all();
}
