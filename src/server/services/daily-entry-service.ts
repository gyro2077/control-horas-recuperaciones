import "server-only";

import { DateTime } from "luxon";

import {
  TimeBalanceError,
  TimeBalanceService,
  type IsoDate,
} from "@/domain/time-balance-service";
import { RbacService } from "@/domain/rbac";
import type {
  EntryType,
  PermissionKind,
  Prisma,
} from "@/generated/prisma/client";
import { civilDate, dateInTimezone, localDateTime } from "@/lib/time";
import type { AuthenticatedUser } from "@/server/auth/session";
import { database } from "@/server/database";
import { AppError } from "@/server/http";

export type DailyEntryInput =
  | Readonly<{ mode: "SCHEDULED"; date: IsoDate; note?: string }>
  | Readonly<{
      mode: "CUSTOM";
      date: IsoDate;
      startTime: string;
      endTime: string;
      note?: string;
    }>
  | Readonly<{
      mode: "DIFFERENT";
      date: IsoDate;
      startTime: string;
      endTime: string;
      permissionKind?: PermissionKind;
      reason?: string;
    }>
  | Readonly<{
      mode: "RECOVERY";
      date: IsoDate;
      endTime: string;
    }>
  | Readonly<{
      mode: "PERMISSION";
      date: IsoDate;
      permissionKind: PermissionKind;
      workedMinutes: number;
      fullDay: boolean;
      reason?: string;
    }>;

function timeLabel(value: Date | null) {
  if (!value) return null;
  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
    value.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

function localEntryTimeLabel(value: Date, timezone: string) {
  return DateTime.fromJSDate(value, { zone: "utc" })
    .setZone(timezone)
    .toFormat("HH:mm");
}

export async function getScheduleForDate(userId: string, date: IsoDate) {
  const user = await database.user.findUnique({
    where: { id: userId },
    include: {
      schedule: {
        include: { days: true },
      },
      dailyEntries: {
        where: { date: civilDate(date) },
        include: { permission: true },
        take: 1,
      },
    },
  });
  if (!user)
    throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);
  if (!user.schedule?.active) {
    throw new AppError(
      "SCHEDULE_NOT_ASSIGNED",
      "El administrador todavía no te asignó un horario.",
      409,
    );
  }
  const weekday = DateTime.fromISO(date, { zone: "utc" }).weekday;
  const day = user.schedule.days.find((value) => value.weekday === weekday);
  if (!day) {
    throw new AppError(
      "SCHEDULE_DAY_NOT_FOUND",
      "El horario no tiene configurado este día.",
      409,
    );
  }
  const existingEntry = user.dailyEntries[0] ?? null;
  return {
    user,
    schedule: user.schedule,
    day,
    existingEntry: existingEntry
      ? {
          id: existingEntry.id,
          type: existingEntry.type,
          startTime: existingEntry.startDateTime
            ? localEntryTimeLabel(existingEntry.startDateTime, user.timezone)
            : null,
          endTime: existingEntry.endDateTime
            ? localEntryTimeLabel(existingEntry.endDateTime, user.timezone)
            : null,
          workedMinutes: existingEntry.workedMinutes,
          balanceMinutes: existingEntry.balanceMinutes,
          permissionKind: existingEntry.permission?.kind ?? null,
          reason: existingEntry.permission?.reason ?? existingEntry.note,
        }
      : null,
    view: {
      date,
      scheduleName: user.schedule.name,
      scheduleType: user.schedule.type,
      isWorkingDay: day.isWorkingDay,
      startTime: timeLabel(day.startTime),
      endTime: timeLabel(day.endTime),
      breakMinutes: day.breakMinutes,
      expectedMinutes: day.expectedMinutes,
    },
  };
}

function ensureRecordableDate(date: IsoDate, timezone: string) {
  const today = dateInTimezone(new Date(), timezone);
  if (date > today) {
    throw new AppError(
      "FUTURE_DATE",
      "No puedes registrar una jornada futura.",
      422,
    );
  }
}

function entryType(mode: DailyEntryInput["mode"]): EntryType {
  return mode === "RECOVERY" || mode === "DIFFERENT" ? "CUSTOM" : mode;
}

export async function createDailyEntry(
  actor: AuthenticatedUser,
  targetUserId: string,
  input: DailyEntryInput,
) {
  RbacService.assertUserAccess(actor, targetUserId);
  const schedule = await getScheduleForDate(targetUserId, input.date);
  ensureRecordableDate(input.date, schedule.user.timezone);
  if (
    !schedule.day.isWorkingDay ||
    !schedule.day.startTime ||
    !schedule.day.endTime
  ) {
    throw new AppError(
      "NON_WORKING_DAY",
      "Este día no forma parte de tu horario laboral.",
      422,
    );
  }

  const scheduledMinutes = schedule.day.expectedMinutes;
  const normalStart = localDateTime(
    input.date,
    schedule.view.startTime ?? "00:00",
    schedule.user.timezone,
  );
  const normalEnd = localDateTime(
    input.date,
    schedule.view.endTime ?? "00:00",
    schedule.user.timezone,
  );

  let startDateTime: Date | null = normalStart;
  let endDateTime: Date | null = normalEnd;
  let breakMinutes = schedule.day.breakMinutes;
  let workedMinutes = scheduledMinutes;
  let note = "note" in input ? input.note : undefined;
  let recoveryEndDateTime: Date | null = null;
  let resolvedEntryType = entryType(input.mode);
  let permission:
    | {
        kind: PermissionKind;
        durationMinutes: number;
        fullDay: boolean;
        reason?: string;
      }
    | undefined;

  if (input.mode === "SCHEDULED") {
    const today = dateInTimezone(new Date(), schedule.user.timezone);
  }

  if (input.mode === "CUSTOM") {
    startDateTime = localDateTime(
      input.date,
      input.startTime,
      schedule.user.timezone,
    );
    endDateTime = localDateTime(
      input.date,
      input.endTime,
      schedule.user.timezone,
    );
    try {
      workedMinutes = TimeBalanceService.calculateWorkedMinutes(
        startDateTime,
        endDateTime,
        0,
      );
    } catch (error) {
      if (!(error instanceof TimeBalanceError)) throw error;
      throw new AppError("INVALID_TIME_RANGE", error.message, 422);
    }
    breakMinutes = 0;
  }

  const calculateDifferentSchedule = (expectedMinutes: number) => {
    if (input.mode !== "DIFFERENT") {
      throw new Error("El modo de registro no corresponde.");
    }
    try {
      return TimeBalanceService.calculateDifferentSchedule(
        input.startTime,
        input.endTime,
        expectedMinutes,
        schedule.day.breakMinutes,
      );
    } catch (error) {
      if (!(error instanceof TimeBalanceError)) throw error;
      throw new AppError("INVALID_TIME_RANGE", error.message, 422);
    }
  };

  if (input.mode === "DIFFERENT") {
    startDateTime = localDateTime(
      input.date,
      input.startTime,
      schedule.user.timezone,
    );
    endDateTime = localDateTime(
      input.date,
      input.endTime,
      schedule.user.timezone,
    );

    const different = calculateDifferentSchedule(scheduledMinutes);
    breakMinutes = different.breakMinutes;
    workedMinutes = different.workedMinutes;
    note = input.reason;
    if (different.balanceMinutes < 0) {
      permission = {
        kind: input.permissionKind ?? "OTHER",
        durationMinutes: -different.balanceMinutes,
        fullDay: false,
        reason: input.reason,
      };
      resolvedEntryType = "PERMISSION";
    } else {
      resolvedEntryType = "CUSTOM";
    }
  }

  if (input.mode === "RECOVERY") {
    recoveryEndDateTime = localDateTime(
      input.date,
      input.endTime,
      schedule.user.timezone,
    );

    let recovery;
    try {
      recovery = TimeBalanceService.calculateRecovery(
        schedule.view.startTime ?? "00:00",
        input.endTime,
        scheduledMinutes,
        schedule.day.breakMinutes,
      );
    } catch (error) {
      if (!(error instanceof TimeBalanceError)) throw error;
      throw new AppError("INVALID_RECOVERY_TIME", error.message, 422);
    }
    endDateTime = recoveryEndDateTime;
    breakMinutes = recovery.breakMinutes;
    workedMinutes = recovery.workedMinutes;
    note = "Recuperación de horas";
  }

  if (input.mode === "PERMISSION") {
    if (
      !Number.isSafeInteger(input.workedMinutes) ||
      input.workedMinutes < 0 ||
      input.workedMinutes > scheduledMinutes
    ) {
      throw new AppError(
        "INVALID_WORKED_MINUTES",
        "Las horas trabajadas deben estar entre 0 y tu jornada esperada.",
        422,
      );
    }
    workedMinutes = input.fullDay ? 0 : input.workedMinutes;
    if (workedMinutes >= scheduledMinutes) {
      throw new AppError(
        "PERMISSION_WITHOUT_MISSING_TIME",
        "Si cumpliste toda la jornada, utiliza “Cumplí mi horario”.",
        422,
      );
    }
    const missingMinutes = scheduledMinutes - workedMinutes;
    breakMinutes = 0;
    startDateTime = null;
    endDateTime = null;
    permission = {
      kind: input.permissionKind,
      durationMinutes: missingMinutes,
      fullDay: input.fullDay,
      reason: input.reason,
    };
    note = input.reason
      ? `Permiso o ausencia: ${input.reason}`
      : "Permiso o ausencia";
  }

  return database.$transaction(
    async (tx) => {
      const existing = await tx.dailyEntry.findUnique({
        where: {
          userId_date: {
            userId: targetUserId,
            date: civilDate(input.date),
          },
        },
        include: { permission: true },
      });
      if (existing) {
        if (input.mode === "RECOVERY") {
          if (existing.permission || !existing.startDateTime) {
            throw new AppError(
              "RECOVERY_NOT_ALLOWED",
              "Ese día tiene un permiso o no posee una hora de entrada. Registra la corrección desde Administración.",
              409,
            );
          }
          const recoveryStartTime = localEntryTimeLabel(
            existing.startDateTime,
            schedule.user.timezone,
          );
          let recovery;
          try {
            recovery = TimeBalanceService.calculateRecovery(
              recoveryStartTime,
              input.endTime,
              existing.scheduledMinutes,
              schedule.day.breakMinutes,
            );
          } catch (error) {
            if (!(error instanceof TimeBalanceError)) throw error;
            throw new AppError("INVALID_RECOVERY_TIME", error.message, 422);
          }
          if (recovery.workedMinutes <= existing.workedMinutes) {
            throw new AppError(
              "RECOVERY_NOT_EXTENDED",
              "Selecciona una salida posterior a la jornada ya registrada.",
              409,
            );
          }
          const existingNotes = existing.note
            ?.split(" · ")
            .filter((value) => value !== "Recuperación de horas");
          const updatedNote = [
            ...(existingNotes ?? []),
            "Recuperación de horas",
          ].join(" · ");
          return tx.dailyEntry.update({
            where: { id: existing.id },
            data: {
              endDateTime: recoveryEndDateTime,
              breakMinutes: recovery.breakMinutes,
              workedMinutes: recovery.workedMinutes,
              balanceMinutes: recovery.balanceMinutes,
              type: "CUSTOM",
              note: updatedNote,
            },
            include: { permission: true },
          });
        }
        if (
          input.mode === "SCHEDULED" ||
          input.mode === "DIFFERENT" ||
          input.mode === "PERMISSION"
        ) {
          let replacementWorkedMinutes = workedMinutes;
          let replacementBreakMinutes = breakMinutes;
          let replacementType = resolvedEntryType;
          let replacementPermission = permission;

          if (input.mode === "DIFFERENT") {
            const different = calculateDifferentSchedule(
              existing.scheduledMinutes,
            );
            replacementWorkedMinutes = different.workedMinutes;
            replacementBreakMinutes = different.breakMinutes;
            if (different.balanceMinutes < 0) {
              replacementType = "PERMISSION";
              replacementPermission = {
                kind: input.permissionKind ?? "OTHER",
                durationMinutes: -different.balanceMinutes,
                fullDay: false,
                reason: input.reason,
              };
            } else {
              replacementType = "CUSTOM";
              replacementPermission = undefined;
            }
          } else if (replacementPermission) {
            replacementPermission = {
              ...replacementPermission,
              durationMinutes:
                existing.scheduledMinutes - replacementWorkedMinutes,
            };
          }

          const replacementCalculation = TimeBalanceService.calculateDay(
            existing.scheduledMinutes,
            replacementWorkedMinutes,
          );
          await tx.dailyEntry.update({
            where: { id: existing.id },
            data: {
              startDateTime,
              endDateTime,
              breakMinutes: replacementBreakMinutes,
              workedMinutes: replacementWorkedMinutes,
              balanceMinutes: replacementCalculation.balanceMinutes,
              type: replacementType,
              note: note ?? null,
            },
          });

          if (replacementPermission && existing.permission) {
            await tx.permission.update({
              where: { id: existing.permission.id },
              data: replacementPermission,
            });
          } else if (replacementPermission) {
            await tx.permission.create({
              data: {
                userId: targetUserId,
                dailyEntryId: existing.id,
                date: civilDate(input.date),
                ...replacementPermission,
              },
            });
          } else if (existing.permission) {
            await tx.permission.delete({
              where: { id: existing.permission.id },
            });
          }

          return tx.dailyEntry.findUniqueOrThrow({
            where: { id: existing.id },
            include: { permission: true },
          });
        }
        throw new AppError(
          "DAY_ALREADY_RECORDED",
          "Este día ya está registrado. Puedes revisarlo en el historial.",
          409,
        );
      }

      const calculation = TimeBalanceService.calculateDay(
        scheduledMinutes,
        workedMinutes,
      );
      const data: Prisma.DailyEntryCreateInput = {
        user: { connect: { id: targetUserId } },
        date: civilDate(input.date),
        scheduledMinutes,
        startDateTime,
        endDateTime,
        breakMinutes,
        workedMinutes,
        balanceMinutes: calculation.balanceMinutes,
        type: resolvedEntryType,
        note,
        ...(permission
          ? {
              permission: {
                create: {
                  user: { connect: { id: targetUserId } },
                  date: civilDate(input.date),
                  ...permission,
                },
              },
            }
          : {}),
      };
      return tx.dailyEntry.create({
        data,
        include: { permission: true },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
