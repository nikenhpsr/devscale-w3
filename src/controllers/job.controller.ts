import type { Context, Env } from "hono";
import { findJob } from "../services/job.service";

export async function getJob(c: Context<Env, "/:id">) {
  const job = await findJob(c.req.param("id"));
  if (!job) {
    return c.json({ error: "job not found" }, 404);
  }
  return c.json(job);
}
