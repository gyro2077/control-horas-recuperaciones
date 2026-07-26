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

const labels = {
  COMPLETED: "Cumplido",
  INCOMPLETE: "Pendiente",
  PERMISSION: "Permiso",
  EXTRA: "Adicional",
  NON_WORKING: "No laborable",
  IN_PROGRESS: "En curso",
  FUTURE: "Próximo",
} as const;

const permissionLabels: Record<string, string> = {
  UNIVERSITY: "Universidad",
  PERSONAL: "Permiso personal",
  MEDICAL: "Cita médica",
  ILLNESS: "Enfermedad",
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
  const target =
    users.find((user) => user.id === requestedUserId) ?? users.at(0) ?? null;

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
  const from = DateTime.fromISO(today)
    .minus({ days: 60 })
    .toISODate() as `${number}-${number}-${number}`;
  const result = await calculateBalanceRange(
    target.id,
    target.timezone,
    from,
    today,
  );
  const workingDays = result.days
    .filter((day) => day.status !== "NON_WORKING")
    .reverse();

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-teal-700">Últimos 60 días</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Historial de {target.name}
          </h1>
          <p className="mt-2 text-slate-500">
            Cada fila muestra lo esperado, lo trabajado y la diferencia.
          </p>
        </div>
        {!isAdmin ? (
          <Link href="/registro" className="button-primary">
            Registrar un día
          </Link>
        ) : null}
      </header>

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

      <section className="card overflow-hidden">
        {workingDays.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">Todavía no existen jornadas.</p>
            <p className="mt-2 text-sm text-slate-500">
              El historial aparecerá después de registrar el primer día.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Esperado</th>
                  <th className="px-5 py-3">Trabajado</th>
                  <th className="px-5 py-3">Diferencia</th>
                  <th className="px-5 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workingDays.map((day) => (
                  <tr key={day.date}>
                    <td className="px-5 py-4 font-semibold">{day.date}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                        {labels[day.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {formatMinutes(day.scheduledMinutes)}
                    </td>
                    <td className="px-5 py-4">
                      {formatMinutes(day.workedMinutes)}
                    </td>
                    <td
                      className={`px-5 py-4 font-bold ${
                        day.balanceMinutes < 0
                          ? "text-amber-700"
                          : "text-teal-700"
                      }`}
                    >
                      {day.balanceMinutes > 0 ? "+" : ""}
                      {formatMinutes(day.balanceMinutes)}
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-500">
                      {day.permission
                        ? `${permissionLabels[day.permission.kind] ?? day.permission.kind} · faltaron ${formatMinutes(day.permission.durationMinutes)}`
                        : (day.entry?.note ?? "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
