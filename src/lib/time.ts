import { DateTime } from "luxon";

import type { IsoDate } from "@/domain/time-balance-service";

export function toIsoDate(value: Date): IsoDate {
  return value.toISOString().slice(0, 10) as IsoDate;
}

export function civilDate(value: IsoDate | string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function dateInTimezone(date: Date, timezone: string): IsoDate {
  const value = DateTime.fromJSDate(date, { zone: "utc" })
    .setZone(timezone)
    .toISODate();
  if (!value) throw new RangeError("No se pudo obtener la fecha local.");
  return value as IsoDate;
}

export function startOfLocalDay(date: IsoDate, timezone: string): Date {
  const value = DateTime.fromISO(date, { zone: timezone }).startOf("day");
  if (!value.isValid) throw new RangeError("La fecha local no es válida.");
  return value.toUTC().toJSDate();
}

export function endOfLocalDay(date: IsoDate, timezone: string): Date {
  const value = DateTime.fromISO(date, { zone: timezone })
    .plus({ days: 1 })
    .startOf("day");
  if (!value.isValid) throw new RangeError("La fecha local no es válida.");
  return value.toUTC().toJSDate();
}

export function localTimeParts(value: Date): {
  hour: number;
  minute: number;
} {
  return {
    hour: value.getUTCHours(),
    minute: value.getUTCMinutes(),
  };
}

export function scheduleDateTime(
  date: IsoDate,
  localTime: Date,
  timezone: string,
): Date {
  const time = localTimeParts(localTime);
  const value = DateTime.fromISO(date, { zone: timezone }).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });
  if (!value.isValid) throw new RangeError("La hora del horario no es válida.");
  return value.toUTC().toJSDate();
}

export function localDateTime(
  date: IsoDate,
  time: string,
  timezone: string,
): Date {
  const value = DateTime.fromISO(`${date}T${time}:00`, { zone: timezone });
  if (!value.isValid)
    throw new RangeError("La fecha u hora local no es válida.");
  return value.toUTC().toJSDate();
}

export function eachCivilDate(from: IsoDate, to: IsoDate): IsoDate[] {
  const start = DateTime.fromISO(from, { zone: "utc" });
  const end = DateTime.fromISO(to, { zone: "utc" });
  if (!start.isValid || !end.isValid || start > end) {
    throw new RangeError("El rango de fechas no es válido.");
  }

  const dates: IsoDate[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current.toISODate() as IsoDate);
    current = current.plus({ days: 1 });
  }
  return dates;
}

export function weekRange(date: IsoDate): { from: IsoDate; to: IsoDate } {
  const value = DateTime.fromISO(date, { zone: "utc" });
  return {
    from: value.startOf("week").toISODate() as IsoDate,
    to: value.endOf("week").toISODate() as IsoDate,
  };
}
