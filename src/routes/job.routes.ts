import { Hono } from "hono";
import { getJob } from "../controllers/job.controller";

export const jobRoutes = new Hono();

jobRoutes.get("/:id", getJob);
