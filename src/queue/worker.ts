import { Worker } from "bullmq";
import { summarizerAgent, videoSession } from "../agent/summarizer";
import { createRedis } from "../lib/redis";
import { setJobStatus } from "../services/job.service";
import { SUMMARIZE_QUEUE, type SummarizeJobData } from "./summarize";

async function summarize(data: SummarizeJobData): Promise<void> {
  await setJobStatus(data.jobId, "PROCESSING");

  const outcome = await summarizerAgent.generate({
    prompt: `Summarize ${data.youtubeUrl}. The YouTube id is ${data.youtubeId}.`,
    session: videoSession(data.videoId),
  });

  if (outcome.type !== "response") {
    throw new Error(`agent returned ${outcome.type}`);
  }

  await setJobStatus(data.jobId, "COMPLETED");
}

export const summarizeWorker = new Worker<SummarizeJobData>(
  SUMMARIZE_QUEUE,
  async (job) => {
    try {
      await summarize(job.data);
    } catch (error) {
      await setJobStatus(job.data.jobId, "FAILED", error instanceof Error ? error.message : "unknown error");
      throw error;
    }
  },
  { connection: createRedis(), concurrency: 2 },
);
