import { z } from "zod";

export const createSummarySchema = z.object({ youtubeUrl: z.string().url() });
