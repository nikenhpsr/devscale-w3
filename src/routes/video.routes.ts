import { Hono } from "hono";
import { getVideoSummaries } from "../controllers/summary.controller";

export const videoRoutes = new Hono();

videoRoutes.get("/:id/summaries", getVideoSummaries);
