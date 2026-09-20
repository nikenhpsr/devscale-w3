import { Studio } from "@anvia/studio";
import { memory, summarizerAgent } from "./agent/summarizer";

await memory.validate();

await new Studio([summarizerAgent]).serve({ port: 4021 });
