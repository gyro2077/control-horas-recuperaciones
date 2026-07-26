import "server-only";

import type { Role, UserStatus } from "@/generated/prisma/client";
import { RbacService } from "@/domain/rbac";
import type { AuthenticatedUser, CurrentSession } from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { database } from "@/server/database";
import { AppError } from "@/server/http";

type AdminUserChanges = Readonly<{
  name?: string;
  email?: string;
  role?: Role;
  status?: UserStatus;
  scheduleId?: string | null;
  password?: string;
}>;

async function assertEmailAvailable(email: string, excludedUserId: string) {
  const existing = await database.user.findFirst({
    where: { email, id: { not: excludedUserId } },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(
      "EMAIL_ALREADY_EXISTS",
      "Ya existe un usuario con ese correo.",
      409,
    );
  }
}

async function assertScheduleAvailable(scheduleId: string) {
  const schedule = await database.schedule.findFirst({
    where: { id: scheduleId, active: true },
    select: { id: true },
  });
  if (!schedule) {
    throw new AppError(
      "SCHEDULE_NOT_FOUND",
      "El horario seleccionado no está disponible.",
      422,
    );
  }
}

async function assertAnotherActiveAdmin(excludedUserId: string) {
  const activeAdmins = await database.user.count({
    where: {
      role: "ADMIN",
      status: "ACTIVE",
      id: { not: excludedUserId },
    },
  });
  if (activeAdmins === 0) {
    throw new AppError(
      "LAST_ADMIN_REQUIRED",
      "Debe existir al menos otro administrador activo.",
      409,
    );
  }
}

export async function updateOwnProfile(
  actor: AuthenticatedUser,
  input: Readonly<{ name: string; email: string }>,
) {
  await assertEmailAvailable(input.email, actor.id);
  return database.user.update({
    where: { id: actor.id },
    data: { name: input.name, email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      timezone: true,
    },
  });
}

export async function changeOwnPassword(
  session: CurrentSession,
  currentPassword: string,
  newPassword: string,
) {
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AppError(
      "CURRENT_PASSWORD_INVALID",
      "La contraseña actual no es correcta.",
      422,
    );
  }
  if (await verifyPassword(newPassword, user.passwordHash)) {
    throw new AppError(
      "PASSWORD_UNCHANGED",
      "La nueva contraseña debe ser diferente.",
      422,
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await database.$transaction([
    database.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    database.session.deleteMany({
      where: {
        userId: session.user.id,
        id: { not: session.id },
      },
    }),
  ]);
}

export async function adminUpdateUser(
  actor: AuthenticatedUser,
  targetUserId: string,
  input: AdminUserChanges,
) {
  RbacService.assertAdmin(actor);
  const target = await database.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      role: true,
      status: true,
      scheduleId: true,
      email: true,
    },
  });
  if (!target) {
    throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);
  }

  const nextRole = input.role ?? target.role;
  const nextStatus = input.status ?? target.status;
  const requestedScheduleId =
    input.scheduleId === undefined ? target.scheduleId : input.scheduleId;
  const nextScheduleId = nextRole === "ADMIN" ? null : requestedScheduleId;

  if (
    target.id === actor.id &&
    (nextRole !== "ADMIN" || nextStatus !== "ACTIVE")
  ) {
    throw new AppError(
      "CANNOT_DISABLE_SELF",
      "No puedes desactivar ni quitar el rol de tu propia cuenta.",
      409,
    );
  }
  if (
    target.role === "ADMIN" &&
    target.status === "ACTIVE" &&
    (nextRole !== "ADMIN" || nextStatus !== "ACTIVE")
  ) {
    await assertAnotherActiveAdmin(target.id);
  }
  if (nextRole === "USER" && !nextScheduleId) {
    throw new AppError(
      "SCHEDULE_REQUIRED",
      "Asigna un horario al usuario.",
      422,
    );
  }
  if (nextScheduleId) await assertScheduleAvailable(nextScheduleId);

  const email = input.email ?? target.email;
  if (email !== target.email) {
    await assertEmailAvailable(email, target.id);
  }
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : null;

  return database.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: target.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        role: nextRole,
        status: nextStatus,
        scheduleId: nextScheduleId,
        ...(passwordHash
          ? {
              passwordHash,
              failedLoginAttempts: 0,
              lockedUntil: null,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        scheduleId: true,
      },
    });
    if (passwordHash) {
      await tx.session.deleteMany({ where: { userId: target.id } });
    }
    return updated;
  });
}

export async function adminDeleteUser(
  actor: AuthenticatedUser,
  targetUserId: string,
) {
  RbacService.assertAdmin(actor);
  if (actor.id === targetUserId) {
    throw new AppError(
      "CANNOT_DELETE_SELF",
      "No puedes eliminar tu propia cuenta.",
      409,
    );
  }
  const target = await database.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      role: true,
      status: true,
      _count: { select: { dailyEntries: true } },
    },
  });
  if (!target) {
    throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);
  }
  if (target.role === "ADMIN" && target.status === "ACTIVE") {
    await assertAnotherActiveAdmin(target.id);
  }

  await database.user.delete({ where: { id: target.id } });
  return {
    id: target.id,
    name: target.name,
    deletedEntries: target._count.dailyEntries,
  };
}
