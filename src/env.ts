import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  OPEN_AI_APIKEY: z.string().min(1),
  OPEN_AI_BASE_URL: z.string().min(1),
  AI_MODEL_ID: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
