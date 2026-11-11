import { DateTime } from "luxon";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { formatMinutes } from "@/lib/format-minutes";
import { dateInTimezone } from "@/lib/time";
import { getCurrentSession } from "@/server/auth/session";
import { database } from "@/server/database";
import { calculateBalanceRange } from "@/server/services/balance-query-service";

export const metadata: Metadata = { title: "Historial" };
export const dynamic = "force-dynamic";

const permissionLabels: Record<string, string> = {
  UNIVERSITY: "Universidad",
  PERSONAL: "Permiso",
  MEDICAL: "Médico",
  ILLNESS: "Salud",
  ABSENCE: "Ausencia",
  OTHER: "Otro",
};

export default async function HistoryPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ userId?: string }>;
}>) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const users = isAdmin
    ? await database.user.findMany({
        where: { role: "USER" },
        select: { id: true, name: true, timezone: true, status: true },
        orderBy: { name: "asc" },
      })
    : [
        {
          id: session.user.id,
          name: session.user.name,
          timezone: session.user.timezone,
          status: "ACTIVE" as const,
        },
      ];
  const requestedUserId = (await searchParams).userId;
  const target = isAdmin
    ? (users.find((user) => user.id === requestedUserId) ?? users.at(0) ?? null)
    : (users[0] ?? null);

  if (!target) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-sm font-bold text-teal-700">Historial</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Todavía no hay compañeros
          </h1>
          <p className="mt-2 text-slate-500">
            Crea un usuario desde Administración para consultar sus jornadas.
          </p>
        </header>
        <Link href="/administracion" className="button-primary">
          Ir a Administración
        </Link>
      </div>
    );
  }

  const today = dateInTimezone(new Date(), target.timezone);
  const now = DateTime.fromISO(today);

  // Desde el día 1 del mes anterior hasta el fin del mes actual
  const from = now
    .minus({ months: 1 })
    .startOf("month")
    .toISODate() as `${number}-${number}-${number}`;
  const to = now.endOf("month").toISODate() as `${number}-${number}-${number}`;

  const result = await calculateBalanceRange(
    target.id,
    target.timezone,
    from,
    to,
  );
  const currentBalance = result.days.at(-1)?.accumulatedBalanceMinutes ?? 0;
  const balanceLabel =
    currentBalance > 0
      ? "Horas adelantadas"
      : currentBalance < 0
        ? "Horas por recuperar"
        : "Saldo al día";

  // Agrupar los días devueltos en meses
  const months = result.days.reduce(
    (acc, day) => {
      const monthKey = day.date.substring(0, 7);
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(day);
      return acc;
    },
    {} as Record<string, typeof result.days>,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-teal-700">Progreso Reciente</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Historial de {target.name}
          </h1>
          <p className="mt-2 text-slate-500">
            Visualiza tu trabajo diario en el calendario.
          </p>
        </div>
        {!isAdmin ? (
          <Link href="/registro" className="button-primary">
            Registrar un día
          </Link>
        ) : null}
      </header>

      <section
        className="card flex flex-wrap items-end justify-between gap-4 border-teal-200 bg-teal-50/50 p-5 sm:p-6"
        aria-label="Saldo acumulado del historial"
      >
        <div>
          <p className="text-sm font-bold text-teal-800">{balanceLabel}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            {currentBalance > 0 ? "+" : ""}
            {formatMinutes(currentBalance)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Saldo acumulado al cierre de {result.asOfDate}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Adelanto disponible</dt>
            <dd className="font-semibold text-teal-800">
              {formatMinutes(result.creditMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Deuda pendiente</dt>
            <dd className="font-semibold text-amber-700">
              {formatMinutes(result.debtMinutes)}
            </dd>
          </div>
        </dl>
      </section>

      {isAdmin ? (
        <form className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label" htmlFor="history-user">
              Compañero
            </label>
            <select
              id="history-user"
              name="userId"
              className="input"
              defaultValue={target.id}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                  {user.status === "INACTIVE" ? " · Inactivo" : ""}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="button-primary">
            Ver historial
          </button>
        </form>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Object.entries(months).map(([monthKey, days]) => {
          const dt = DateTime.fromISO(`${monthKey}-01`).setLocale("es");
          const monthName = dt.toFormat("MMMM yyyy");
          // weekday es 1 (Lunes) a 7 (Domingo). Restamos 1 para offset (Lunes=0).
          const startOffset = dt.weekday - 1;

          return (
            <section key={monthKey} className="card p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-800 capitalize">
                {monthName}
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-slate-400"
                  >
                    {d}
                  </div>
                ))}

                {Array.from({ length: startOffset }).map((_, i) => (
                  <div
                    key={`pad-${i}`}
                    className="h-[5.5rem] rounded-lg bg-slate-50/50"
                  />
                ))}

                {days.map((day) => {
                  const dayNum = parseInt(day.date.substring(8, 10), 10);
                  const isNonWorking = day.status === "NON_WORKING";
                  const isFuture = day.status === "FUTURE";

                  return (
                    <div
                      key={day.date}
                      className={`relative flex h-[5.5rem] flex-col rounded-lg border p-1.5 transition-colors ${
                        isNonWorking || isFuture
                          ? "border-slate-100 bg-slate-50/70"
                          : day.date === today
                            ? "border-teal-200 bg-teal-50/30"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${isNonWorking || isFuture ? "text-slate-400" : "text-slate-700"}`}
                      >
                        {dayNum}
                      </span>

                      {!isNonWorking && !isFuture && (
                        <div className="mt-auto flex flex-col">
                          <span
                            className={`text-xs leading-none font-bold ${
                              day.balanceMinutes < 0
                                ? "text-amber-600"
                                : day.balanceMinutes > 0
                                  ? "text-teal-600"
                                  : "text-slate-500"
                            }`}
                          >
                            {day.balanceMinutes > 0 ? "+" : ""}
                            {day.balanceMinutes !== 0
                              ? formatMinutes(day.balanceMinutes)
                              : "OK"}
                          </span>
                        </div>
                      )}

                      {day.permission && (
                        <span
                          className="mt-auto truncate text-[10px] leading-none font-medium text-indigo-600"
                          title={day.permission.kind}
                        >
                          {permissionLabels[day.permission.kind] ?? "Permiso"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
