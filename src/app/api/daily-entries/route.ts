import { z } from "zod";
import { revalidatePath } from "next/cache";

import { PermissionKind } from "@/generated/prisma/client";
import { RbacService } from "@/domain/rbac";
import { requireSession } from "@/server/auth/session";
import { database } from "@/server/database";
import {
  assertTrustedMutation,
  created,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";
import { createDailyEntry } from "@/server/services/daily-entry-service";

const date = z.iso.date();
const halfHour = z
  .string()
  .regex(/^([01]\d|2[0-3]):(?:00|30)$/, "Selecciona una hora o media hora.");
const schema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("SCHEDULED"),
    date,
    note: z.string().trim().max(1_000).optional(),
  }),
  z.object({
    mode: z.literal("CUSTOM"),
    date,
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    note: z.string().trim().max(1_000).optional(),
  }),
  z.object({
    mode: z.literal("RECOVERY"),
    date,
    endTime: halfHour,
  }),
  z.object({
    mode: z.literal("DIFFERENT"),
    date,
    startTime: halfHour,
    endTime: halfHour,
    permissionKind: z.enum(PermissionKind).optional(),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({
    mode: z.literal("PERMISSION"),
    date,
    permissionKind: z.enum(PermissionKind),
    workedMinutes: z.number().int().min(0).max(1_440),
    fullDay: z.boolean(),
    reason: z.string().trim().max(500).optional(),
  }),
]);

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const userId =
      new URL(request.url).searchParams.get("userId") ?? session.user.id;
    RbacService.assertUserAccess(session.user, userId);
    const entries = await database.dailyEntry.findMany({
      where: { userId },
      include: { permission: true },
      orderBy: { date: "desc" },
      take: 180,
    });
    return success({ entries });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    const input = schema.parse(await parseJson(request));
    const entry = await createDailyEntry(
      session.user,
      session.user.id,
      input as Parameters<typeof createDailyEntry>[2],
    );
    revalidatePath("/dashboard");
    revalidatePath("/historial");
    revalidatePath("/reportes");
    return created({ entry });
  } catch (error) {
    return errorResponse(error);
  }
}
