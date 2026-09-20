import { Queue } from "bullmq";
import { createRedis } from "../lib/redis";

export const SUMMARIZE_QUEUE = "summarize";

export type SummarizeJobData = {
  jobId: string;
  videoId: string;
  youtubeId: string;
  youtubeUrl: string;
};

export const summarizeQueue = new Queue<SummarizeJobData>(SUMMARIZE_QUEUE, {
  connection: createRedis(),
});
