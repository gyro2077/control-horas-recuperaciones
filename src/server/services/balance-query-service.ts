import "server-only";

import { DateTime } from "luxon";

import { calculateBalanceRangeFromData } from "@/domain/balance-range-service";
import type { IsoDate } from "@/domain/time-balance-service";
import type { Prisma } from "@/generated/prisma/client";
import { dateInTimezone, toIsoDate, weekRange } from "@/lib/time";
import { database } from "@/server/database";
import { AppError } from "@/server/http";

export type {
  BalanceRangeDay as CalculatedDay,
  BalanceRangeDayStatus as SimpleDayStatus,
} from "@/domain/balance-range-service";

export type BalanceReadClient = Pick<Prisma.TransactionClient, "user">;

export type BalanceQueryOptions = Readonly<{
  now?: Date;
  client?: BalanceReadClient;
}>;

async function withBalanceReader<T>(
  client: BalanceReadClient | undefined,
  read: (client: BalanceReadClient) => Promise<T>,
): Promise<T> {
  if (client) return read(client);
  return database.$transaction(read, { isolationLevel: "RepeatableRead" });
}

function timeLabel(value: Date | null) {
  if (!value) return null;
  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
    value.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

export async function calculateBalanceRange(
  userId: string,
  timezone: string | undefined,
  from: IsoDate,
  to: IsoDate,
  options: BalanceQueryOptions = {},
) {
  const now = options.now ?? new Date();
  return withBalanceReader(options.client, async (client) => {
    const user = await client.user.findUnique({
      where: { id: userId },
      include: {
        schedule: { include: { days: true } },
        dailyEntries: {
          where: { date: { lte: new Date(`${to}T00:00:00.000Z`) } },
          include: { permission: true },
        },
      },
    });
    if (!user)
      throw new AppError("USER_NOT_FOUND", "Usuario no encontrado.", 404);

    const result = calculateBalanceRangeFromData({
      createdAt: user.createdAt,
      timezone: timezone ?? user.timezone,
      scheduleDays: user.schedule?.days ?? [],
      entries: user.dailyEntries,
      from,
      to,
      now,
    });
    return { user, ...result };
  });
}

export async function getBalanceBeforeDate(
  userId: string,
  date: IsoDate,
  options: BalanceQueryOptions = {},
): Promise<number> {
  const previousDate = DateTime.fromISO(date, { zone: "utc" })
    .minus({ days: 1 })
    .toISODate();
  if (!previousDate) throw new RangeError("La fecha de consulta no es válida.");

  const result = await calculateBalanceRange(
    userId,
    undefined,
    previousDate as IsoDate,
    previousDate as IsoDate,
    options,
  );
  return result.balanceMinutes;
}

export async function getDashboard(
  userId: string,
  timezone: string,
  now = new Date(),
) {
  return withBalanceReader(undefined, async (client) => {
    const today = dateInTimezone(now, timezone);
    const week = weekRange(today);
    const user = await client.user.findUnique({
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
    const result = await calculateBalanceRange(
      userId,
      timezone,
      from,
      week.to,
      { now, client },
    );
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
      weekRemainingMinutes: Math.max(
        0,
        weekExpectedMinutes - weekWorkedMinutes,
      ),
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
  });
}
