import { DateTime } from "luxon";

import {
  TimeBalanceService,
  type BalanceMovement,
  type IsoDate,
} from "@/domain/time-balance-service";
import { isEcuadorHoliday } from "@/lib/holidays";
import {
  dateInTimezone,
  eachCivilDate,
  scheduleDateTime,
  toIsoDate,
} from "@/lib/time";

export type BalanceRangePermission = Readonly<{
  kind: string;
  durationMinutes: number;
  fullDay: boolean;
  reason: string | null;
}>;

export type BalanceRangeEntry = Readonly<{
  id: string;
  date: Date;
  scheduledMinutes: number;
  workedMinutes: number;
  type: "SCHEDULED" | "CUSTOM" | "PERMISSION";
  startDateTime: Date | null;
  endDateTime: Date | null;
  breakMinutes: number;
  note: string | null;
  permission: BalanceRangePermission | null;
}>;

export type BalanceRangeScheduleDay = Readonly<{
  weekday: number;
  isWorkingDay: boolean;
  expectedMinutes: number;
  endTime: Date | null;
}>;

export type BalanceRangeInput = Readonly<{
  createdAt: Date;
  timezone: string;
  scheduleDays: readonly BalanceRangeScheduleDay[];
  entries: readonly BalanceRangeEntry[];
  from: IsoDate;
  to: IsoDate;
  now: Date;
}>;

export type BalanceRangeDayStatus =
  | "COMPLETED"
  | "INCOMPLETE"
  | "PERMISSION"
  | "EXTRA"
  | "NON_WORKING"
  | "IN_PROGRESS"
  | "FUTURE";

export type BalanceRangeDay = BalanceMovement &
  Readonly<{
    date: IsoDate;
    scheduledMinutes: number;
    workedMinutes: number;
    balanceMinutes: number;
    compensatedMinutes: number;
    pendingMinutes: number;
    status: BalanceRangeDayStatus;
    entry: Omit<
      BalanceRangeEntry,
      "date" | "scheduledMinutes" | "workedMinutes" | "permission"
    > | null;
    permission: BalanceRangePermission | null;
  }>;

export function calculateBalanceRangeFromData(input: BalanceRangeInput) {
  const { createdAt, timezone, scheduleDays, entries, from, to, now } = input;
  const requestedDates = eachCivilDate(from, to);
  const today = dateInTimezone(now, timezone);
  const accountStart = dateInTimezone(createdAt, timezone);
  const entriesByDate = new Map(
    entries.map((entry) => [toIsoDate(entry.date), entry]),
  );
  const scheduleByWeekday = new Map(
    scheduleDays.map((day) => [day.weekday, day]),
  );
  const firstEntryDate = [...entriesByDate.keys()]
    .filter((date) => date <= to)
    .sort()[0];
  const rangeStart = [accountStart, from, firstEntryDate]
    .filter((date): date is IsoDate => Boolean(date))
    .sort()[0]!;
  const calculationDates =
    rangeStart === from ? requestedDates : eachCivilDate(rangeStart, to);

  const preliminary = calculationDates.map((date) => {
    const weekday = DateTime.fromISO(date, { zone: "utc" }).weekday;
    const scheduleDay = scheduleByWeekday.get(weekday);
    const entry = entriesByDate.get(date) ?? null;
    const isWorkingDay =
      Boolean(entry && entry.scheduledMinutes > 0) ||
      (date >= accountStart &&
        Boolean(scheduleDay?.isWorkingDay) &&
        !isEcuadorHoliday(date));
    const scheduledMinutes =
      entry?.scheduledMinutes ??
      (isWorkingDay ? (scheduleDay?.expectedMinutes ?? 0) : 0);
    const workedMinutes = entry?.workedMinutes ?? 0;

    let finalized = date < today || Boolean(entry);
    if (date > today) finalized = false;
    if (date === today && !entry && scheduleDay?.endTime && isWorkingDay) {
      finalized = now >= scheduleDateTime(date, scheduleDay.endTime, timezone);
    }

    const calculation = TimeBalanceService.calculateDay(
      scheduledMinutes,
      workedMinutes,
    );
    const balanceMinutes = finalized ? calculation.balanceMinutes : 0;
    const status: BalanceRangeDayStatus = !isWorkingDay
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
      entry: entry
        ? {
            id: entry.id,
            type: entry.type,
            startDateTime: entry.startDateTime,
            endDateTime: entry.endDateTime,
            breakMinutes: entry.breakMinutes,
            note: entry.note,
          }
        : null,
      permission: entry?.permission ? { ...entry.permission } : null,
    };
  });

  const accumulated = TimeBalanceService.accumulate(
    preliminary.map((day) => ({ day, balanceMinutes: day.balanceMinutes })),
  );
  const prior = accumulated.days.filter(({ day }) => day.date < from).at(-1);
  const days: BalanceRangeDay[] = accumulated.days
    .filter(({ day }) => day.date >= from)
    .map(({ day, ...movement }) => ({
      ...day,
      ...movement,
      compensatedMinutes: movement.creditUsedMinutes,
      pendingMinutes: movement.uncoveredMinutes,
    }));

  return {
    days,
    initialBalanceMinutes: prior?.accumulatedBalanceMinutes ?? 0,
    balanceMinutes: accumulated.balanceMinutes,
    creditMinutes: accumulated.creditMinutes,
    debtMinutes: accumulated.debtMinutes,
    recoveredMinutes: days.reduce(
      (total, day) => total + day.recoveredMinutes,
      0,
    ),
    asOfDate: to < today ? to : today,
    calculatedAt: new Date(now.getTime()),
  };
}
