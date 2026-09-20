import { Hono } from "hono";
import { createSummary } from "../controllers/summary.controller";

export const summaryRoutes = new Hono();

summaryRoutes.post("/", createSummary);
