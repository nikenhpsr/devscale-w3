import "temporal-polyfill/global";
import postgres from "@prisma/orm-postgres/runtime";
import { env } from "../env";
import type { Contract } from "../generated/prisma/contract";
import contractJson from "../generated/prisma/contract.json" with { type: "json" };

export const db = postgres<Contract>({ contractJson, url: env.DATABASE_URL });
