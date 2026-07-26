import { z } from "zod";

import { ScheduleType } from "@/generated/prisma/client";
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

const daySchema = z
  .object({
    weekday: z.number().int().min(1).max(7),
    isWorkingDay: z.boolean(),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    breakMinutes: z.number().int().min(0).max(720),
    expectedMinutes: z.number().int().min(0).max(1_440),
  })
  .refine(
    (value) => !value.isWorkingDay || Boolean(value.startTime && value.endTime),
    "Un día laborable necesita entrada y salida.",
  );
const schema = z
  .object({
    name: z.string().trim().min(2).max(120),
    type: z.enum(ScheduleType).default(ScheduleType.CUSTOM),
    days: z.array(daySchema).length(7),
  })
  .refine((value) => new Set(value.days.map((day) => day.weekday)).size === 7, {
    path: ["days"],
    message: "Configura una sola vez cada día de la semana.",
  });

function time(value: string | null) {
  return value ? new Date(`1970-01-01T${value}:00.000Z`) : null;
}

export async function GET() {
  try {
    const session = await requireSession();
    RbacService.assertAdmin(session.user);
    const schedules = await database.schedule.findMany({
      where: { active: true },
      include: { days: { orderBy: { weekday: "asc" } } },
      orderBy: { name: "asc" },
    });
    return success({ schedules });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    RbacService.assertAdmin(session.user);
    const input = schema.parse(await parseJson(request));
    const schedule = await database.schedule.create({
      data: {
        name: input.name,
        type: input.type,
        days: {
          create: input.days.map((day) => ({
            ...day,
            startTime: time(day.startTime),
            endTime: time(day.endTime),
          })),
        },
      },
      include: { days: true },
    });
    return created({ schedule });
  } catch (error) {
    return errorResponse(error);
  }
}
