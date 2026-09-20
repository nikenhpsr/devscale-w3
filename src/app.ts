import { Hono } from "hono";
import { jobRoutes } from "./routes/job.routes";
import { summaryRoutes } from "./routes/summary.routes";
import { videoRoutes } from "./routes/video.routes";

export const app = new Hono();

app.get("/", (c) => c.json({ ok: true }));

app.route("/summaries", summaryRoutes);
app.route("/jobs", jobRoutes);
app.route("/videos", videoRoutes);
