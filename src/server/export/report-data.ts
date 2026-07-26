import "server-only";

import type { IsoDate } from "@/domain/time-balance-service";
import { RbacService } from "@/domain/rbac";
import { dateInTimezone, toIsoDate } from "@/lib/time";
import type { AuthenticatedUser } from "@/server/auth/session";
import { database } from "@/server/database";
import { AppError } from "@/server/http";
import { calculateBalanceRange } from "@/server/services/balance-query-service";

export async function buildReportData(
  actor: AuthenticatedUser,
  targetUserId: string,
  from: IsoDate,
  to: IsoDate,
) {
  if (from > to) {
    throw new AppError(
      "INVALID_DATE_RANGE",
      "La fecha final debe ser posterior a la inicial.",
      422,
    );
  }
  RbacService.assertUserAccess(actor, targetUserId);
  const target = await database.user.findUnique({
    where: { id: targetUserId },
    include: {
      schedule: true,
      dailyEntries: {
        orderBy: { date: "asc" },
        take: 1,
        select: { date: true },
      },
    },
  });
  if (!target)
    throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);
  const today = dateInTimezone(new Date(), target.timezone);
  if (to > today) {
    throw new AppError(
      "FUTURE_REPORT_DATE",
      "El reporte no puede incluir días futuros.",
      422,
    );
  }

  const accountStart = dateInTimezone(target.createdAt, target.timezone);
  const firstEntryDate = target.dailyEntries[0]
    ? toIsoDate(target.dailyEntries[0].date)
    : null;
  const rangeStart = [accountStart, from, firstEntryDate]
    .filter((date): date is IsoDate => Boolean(date))
    .sort()[0]!;
  const all = await calculateBalanceRange(
    target.id,
    target.timezone,
    rangeStart,
    to,
  );
  const prior = all.days.filter((day) => day.date < from).at(-1);
  const days = all.days.filter((day) => day.date >= from && day.date <= to);
  const initialBalanceMinutes = prior?.accumulatedBalanceMinutes ?? 0;
  const finalBalanceMinutes =
    days.at(-1)?.accumulatedBalanceMinutes ?? initialBalanceMinutes;

  return {
    user: {
      id: target.id,
      name: target.name,
      email: target.email,
      timezone: target.timezone,
      schedule: target.schedule?.name ?? "Sin horario",
      scheduleType: target.schedule?.type ?? "CUSTOM",
    },
    period: { from, to },
    generatedAt: new Date(),
    summary: {
      scheduledMinutes: days.reduce(
        (total, day) => total + day.scheduledMinutes,
        0,
      ),
      workedMinutes: days.reduce((total, day) => total + day.workedMinutes, 0),
      pendingMinutes: days.reduce(
        (total, day) => total + Math.max(0, -day.balanceMinutes),
        0,
      ),
      extraMinutes: days.reduce(
        (total, day) => total + Math.max(0, day.balanceMinutes),
        0,
      ),
      recoveredMinutes: days.reduce(
        (total, day) => total + day.recoveredMinutes,
        0,
      ),
      initialBalanceMinutes,
      finalBalanceMinutes,
      debtMinutes: Math.max(0, -finalBalanceMinutes),
      creditMinutes: Math.max(0, finalBalanceMinutes),
    },
    days,
    permissions: days
      .filter((day) => day.permission)
      .map((day) => ({
        date: day.date,
        ...day.permission!,
      })),
  };
}

export type ReportData = Awaited<ReturnType<typeof buildReportData>>;
