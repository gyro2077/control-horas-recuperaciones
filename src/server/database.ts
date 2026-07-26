import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnvironment } from "@/server/env";

function createPrismaClient() {
  const environment = getServerEnvironment();
  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
    max: environment.DATABASE_POOL_MAX,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 5_000,
  });
  // Fluid Compute keeps the invocation alive in the background until pg has
  // released its idle clients. This avoids leaked connections when Vercel
  // suspends a function while preserving pooling within the request.
  attachDatabasePool(pool);
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalDatabase = globalThis as typeof globalThis & {
  __controlHorasPrisma?: ReturnType<typeof createPrismaClient>;
};

export const database =
  globalDatabase.__controlHorasPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalDatabase.__controlHorasPrisma = database;
}
