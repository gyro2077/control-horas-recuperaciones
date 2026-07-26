import { DateTime } from "luxon";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DailyEntryForm } from "@/components/registration/daily-entry-form";
import type { IsoDate } from "@/domain/time-balance-service";
import { dateInTimezone } from "@/lib/time";
import { getCurrentSession } from "@/server/auth/session";
import { getScheduleForDate } from "@/server/services/daily-entry-service";

export const metadata: Metadata = { title: "Registrar día" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const today = dateInTimezone(new Date(), session.user.timezone);
  let schedule = await getScheduleForDate(
    session.user.id,
    today as IsoDate,
  ).catch(() => null);
  if (schedule && !schedule.day.isWorkingDay) {
    const todayValue = DateTime.fromISO(today, { zone: "utc" });
    const previousWorkingDate = Array.from({ length: 7 }, (_, index) =>
      todayValue.minus({ days: index + 1 }),
    ).find((candidate) =>
      schedule?.schedule.days.some(
        (day) => day.weekday === candidate.weekday && day.isWorkingDay,
      ),
    );
    if (previousWorkingDate) {
      schedule = await getScheduleForDate(
        session.user.id,
        previousWorkingDate.toISODate() as IsoDate,
      ).catch(() => schedule);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm font-bold text-teal-700">Registro diario</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Registra tu día
        </h1>
        <p className="mt-2 text-slate-500">
          El horario esperado ya está definido. Solo dinos qué ocurrió.
        </p>
      </header>
      <DailyEntryForm
        today={today}
        initialSchedule={schedule?.view ?? null}
        initialExistingEntry={schedule?.existingEntry ?? null}
      />
    </div>
  );
}
