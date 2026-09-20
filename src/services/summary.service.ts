import { summarizeQueue } from "../queue/summarize";
import { createJob } from "./job.service";
import { findOrCreateVideo } from "./video.service";

export async function requestSummary(youtubeId: string, youtubeUrl: string) {
  const video = await findOrCreateVideo(youtubeId, youtubeUrl);
  const job = await createJob(video.id);

  await summarizeQueue.add("summarize", {
    jobId: job.id,
    videoId: video.id,
    youtubeId,
    youtubeUrl,
  });

  return { jobId: job.id, videoId: video.id, status: job.status };
}
