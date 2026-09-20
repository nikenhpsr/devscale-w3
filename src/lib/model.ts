import { OpenAIClient } from "@anvia/openai";
import { env } from "../env";

const client = new OpenAIClient({
  apiKey: env.OPEN_AI_APIKEY,
  baseUrl: env.OPEN_AI_BASE_URL,
});

export const model = client.completionModel({ modelId: env.AI_MODEL_ID, api: "chat" });
