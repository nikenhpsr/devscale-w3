import { Temporal } from "temporal-polyfill";
import type { FieldInputTypes } from "../generated/prisma/contract";
import { db } from "../lib/db";

export type JobStatus = Exclude<FieldInputTypes["public"]["Jobs"]["status"], "PENDING">;

export function createJob(videoId: string) {
  return db.orm.public.Jobs.select("id", "status").create({ videoId });
}

export function findJob(jobId: string) {
  return db.orm.public.Jobs
    .where({ id: jobId })
    .select("id", "videoId", "status", "errorMessage", "createdAt", "completedAt")
    .first();
}

export async function setJobStatus(
  jobId: string,
  status: JobStatus,
  errorMessage: string | null = null,
): Promise<void> {
  await db.orm.public.Jobs.where({ id: jobId }).update({
    status,
    errorMessage,
    completedAt: status === "PROCESSING" ? null : Temporal.Now.instant(),
  });
}
