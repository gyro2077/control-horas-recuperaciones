import "server-only";

import { DateTime } from "luxon";

import type { IsoDate } from "@/domain/time-balance-service";
import { TimeBalanceService } from "@/domain/time-balance-service";
import {
  dateInTimezone,
  eachCivilDate,
  localDateTime,
  toIsoDate,
  weekRange,
} from "@/lib/time";
import { database } from "@/server/database";
import { AppError } from "@/server/http";

export type SimpleDayStatus =
  | "COMPLETED"
  | "INCOMPLETE"
  | "PERMISSION"
  | "EXTRA"
  | "NON_WORKING"
  | "IN_PROGRESS"
  | "FUTURE";

export type CalculatedDay = Readonly<{
  date: IsoDate;
  scheduledMinutes: number;
  workedMinutes: number;
  balanceMinutes: number;
  recoveredMinutes: number;
  accumulatedBalanceMinutes: number;
  debtMinutes: number;
  creditMinutes: number;
  status: SimpleDayStatus;
  entry: {
    id: string;
    type: "SCHEDULED" | "CUSTOM" | "PERMISSION";
    startDateTime: Date | null;
    endDateTime: Date | null;
    breakMinutes: number;
    note: string | null;
  } | null;
  permission: {
    kind: string;
    durationMinutes: number;
    fullDay: boolean;
    reason: string | null;
  } | null;
}>;

function timeLabel(value: Date | null) {
  if (!value) return null;
  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
    value.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

export async function calculateBalanceRange(
  userId: string,
  timezone: string,
  from: IsoDate,
  to: IsoDate,
) {
  const user = await database.user.findUnique({
    where: { id: userId },
    include: {
      schedule: { include: { days: true } },
      dailyEntries: {
        where: {
          date: {
            gte: new Date(`${from}T00:00:00.000Z`),
            lte: new Date(`${to}T00:00:00.000Z`),
          },
        },
        include: { permission: true },
      },
    },
  });
  if (!user)
    throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);

  const today = dateInTimezone(new Date(), timezone);
  const accountStart = dateInTimezone(user.createdAt, timezone);
  const preliminary = eachCivilDate(from, to).map((date) => {
    const weekday = DateTime.fromISO(date, { zone: "utc" }).weekday;
    const scheduleDay = user.schedule?.days.find(
      (value) => value.weekday === weekday,
    );
    const entry = user.dailyEntries.find(
      (value) => toIsoDate(value.date) === date,
    );
    const isWorkingDay =
      Boolean(entry && entry.scheduledMinutes > 0) ||
      (date >= accountStart && Boolean(scheduleDay?.isWorkingDay));
    const scheduledMinutes =
      entry?.scheduledMinutes ??
      (isWorkingDay ? (scheduleDay?.expectedMinutes ?? 0) : 0);
    const workedMinutes = entry?.workedMinutes ?? 0;

    let finalized = date < today || Boolean(entry);
    if (date > today) finalized = false;
    if (date === today && !entry && scheduleDay?.endTime && isWorkingDay) {
      const end = localDateTime(
        date,
        timeLabel(scheduleDay.endTime) ?? "23:59",
        timezone,
      );
      finalized = new Date() >= end;
    }

    const balanceMinutes = finalized ? workedMinutes - scheduledMinutes : 0;
    const status: SimpleDayStatus = !isWorkingDay
      ? "NON_WORKING"
      : date > today
        ? "FUTURE"
        : !finalized
          ? "IN_PROGRESS"
          : entry?.permission
            ? "PERMISSION"
            : balanceMinutes > 0
              ? "EXTRA"
              : balanceMinutes === 0
                ? "COMPLETED"
                : "INCOMPLETE";

    return {
      date,
      scheduledMinutes,
      workedMinutes,
      balanceMinutes,
      status,
      entry,
    };
  });

  const accumulated = TimeBalanceService.accumulate(
    preliminary.map((day) => ({
      day: day.date,
      balanceMinutes: day.balanceMinutes,
    })),
  );
  const days: CalculatedDay[] = preliminary.map((day, index) => {
    const balance = accumulated.days[index];
    if (!balance) throw new Error("No se pudo acumular el saldo diario.");
    return {
      date: day.date,
      scheduledMinutes: day.scheduledMinutes,
      workedMinutes: day.workedMinutes,
      balanceMinutes: day.balanceMinutes,
      recoveredMinutes: balance.recoveredMinutes,
      accumulatedBalanceMinutes: balance.accumulatedBalanceMinutes,
      debtMinutes: balance.debtMinutes,
      creditMinutes: balance.creditMinutes,
      status: day.status,
      entry: day.entry
        ? {
            id: day.entry.id,
            type: day.entry.type,
            startDateTime: day.entry.startDateTime,
            endDateTime: day.entry.endDateTime,
            breakMinutes: day.entry.breakMinutes,
            note: day.entry.note,
          }
        : null,
      permission: day.entry?.permission
        ? {
            kind: day.entry.permission.kind,
            durationMinutes: Math.max(
              0,
              day.scheduledMinutes - day.workedMinutes,
            ),
            fullDay: day.entry.permission.fullDay,
            reason: day.entry.permission.reason,
          }
        : null,
    };
  });

  return {
    user,
    days,
    balanceMinutes: accumulated.balanceMinutes,
    debtMinutes: accumulated.debtMinutes,
    creditMinutes: accumulated.creditMinutes,
    recoveredMinutes: accumulated.recoveredMinutes,
  };
}

export async function getDashboard(userId: string, timezone: string) {
  const today = dateInTimezone(new Date(), timezone);
  const week = weekRange(today);
  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      dailyEntries: {
        orderBy: { date: "asc" },
        take: 1,
        select: { date: true },
      },
    },
  });
  if (!user)
    throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);
  const accountStart = dateInTimezone(user.createdAt, timezone);
  const firstEntryDate = user.dailyEntries[0]
    ? toIsoDate(user.dailyEntries[0].date)
    : null;
  const from = [accountStart, week.from, firstEntryDate]
    .filter((date): date is IsoDate => Boolean(date))
    .sort()[0]!;
  const result = await calculateBalanceRange(userId, timezone, from, week.to);
  const weekDays = result.days.filter(
    (day) => day.date >= week.from && day.date <= week.to,
  );
  const weekExpectedMinutes = weekDays.reduce(
    (total, day) => total + day.scheduledMinutes,
    0,
  );
  const weekWorkedMinutes = weekDays.reduce(
    (total, day) => total + day.workedMinutes,
    0,
  );
  const todayDay = result.days.find((day) => day.date === today) ?? null;
  const scheduleDay = result.user.schedule?.days.find(
    (day) => day.weekday === DateTime.fromISO(today).weekday,
  );

  return {
    today,
    week,
    weekExpectedMinutes,
    weekWorkedMinutes,
    weekRemainingMinutes: Math.max(0, weekExpectedMinutes - weekWorkedMinutes),
    totalDebtMinutes: result.debtMinutes,
    totalCreditMinutes: result.creditMinutes,
    recoveredMinutes: result.recoveredMinutes,
    progressPercent:
      weekExpectedMinutes === 0
        ? 0
        : Math.min(
            100,
            Math.round((weekWorkedMinutes / weekExpectedMinutes) * 100),
          ),
    todayDay,
    schedule: result.user.schedule
      ? {
          id: result.user.schedule.id,
          name: result.user.schedule.name,
          type: result.user.schedule.type,
          today: scheduleDay
            ? {
                isWorkingDay: scheduleDay.isWorkingDay,
                startTime: timeLabel(scheduleDay.startTime),
                endTime: timeLabel(scheduleDay.endTime),
                breakMinutes: scheduleDay.breakMinutes,
                expectedMinutes: scheduleDay.expectedMinutes,
              }
            : null,
        }
      : null,
    recentDays: result.days.filter((day) => day.date <= today).slice(-14),
  };
}
