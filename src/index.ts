import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "./env";
import "./queue/worker";

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API on http://localhost:${info.port}`);
});
