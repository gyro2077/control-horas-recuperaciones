import { z } from "zod";

import { Role } from "@/generated/prisma/client";
import { RbacService } from "@/domain/rbac";
import { requireSession } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/password";
import { database } from "@/server/database";
import {
  AppError,
  assertTrustedMutation,
  created,
  errorResponse,
  parseJson,
  success,
} from "@/server/http";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(12)
    .max(200)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
  role: z.enum(Role).default(Role.USER),
  scheduleId: z.uuid().nullable().optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    if (session.user.role !== "ADMIN") {
      return success({ users: [session.user] });
    }
    const users = await database.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        scheduleId: true,
        createdAt: true,
        schedule: { select: { id: true, name: true, type: true } },
      },
      orderBy: { name: "asc" },
    });
    return success({ users });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const session = await requireSession();
    RbacService.assertAdmin(session.user);
    const input = createUserSchema.parse(await parseJson(request));
    if (input.role === "USER" && !input.scheduleId) {
      throw new AppError(
        "SCHEDULE_REQUIRED",
        "Asigna un horario al usuario.",
        422,
      );
    }
    const [existingUser, schedule] = await Promise.all([
      database.user.findUnique({ where: { email: input.email } }),
      input.scheduleId
        ? database.schedule.findFirst({
            where: { id: input.scheduleId, active: true },
          })
        : null,
    ]);
    if (existingUser) {
      throw new AppError(
        "EMAIL_ALREADY_EXISTS",
        "Ya existe un usuario con ese correo.",
        409,
      );
    }
    if (input.role === "USER" && !schedule) {
      throw new AppError(
        "SCHEDULE_NOT_FOUND",
        "El horario seleccionado no está disponible.",
        422,
      );
    }
    const user = await database.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: input.role,
        scheduleId: input.role === "ADMIN" ? null : input.scheduleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
    return created({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
