import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL debe ser una URL de PostgreSQL.",
    ),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.url(),
  DEFAULT_TIMEZONE: z.string().min(1).default("America/Guayaquil"),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  REMEMBER_SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(3).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().positive().default(15),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(1),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let cachedEnvironment: ServerEnvironment | null = null;

export function getServerEnvironment(): ServerEnvironment {
  if (cachedEnvironment) return cachedEnvironment;

  const parsed = serverEnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `La configuración del servidor es inválida. Revise: ${fields || "variables de entorno"}.`,
    );
  }

  cachedEnvironment = parsed.data;
  return cachedEnvironment;
}
