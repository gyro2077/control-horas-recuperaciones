import {
  BatteryCharging,
  CalendarClock,
  CircleGauge,
  TimerReset,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BalanceChart } from "@/components/dashboard/balance-chart";
import { DailyQuickRegister } from "@/components/dashboard/daily-quick-register";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatMinutes } from "@/lib/format-minutes";
import { getCurrentSession } from "@/server/auth/session";
import { getDashboard } from "@/server/services/balance-query-service";

export const metadata: Metadata = { title: "Inicio" };
export const dynamic = "force-dynamic";

const statusText = {
  COMPLETED: "Hoy ya cumpliste tu jornada",
  EXTRA: "Hoy trabajaste horas adicionales",
  PERMISSION: "Hoy registraste un permiso o ausencia",
  INCOMPLETE: "Hoy quedaron horas pendientes",
  IN_PROGRESS: "Tu jornada de hoy está en curso",
  NON_WORKING: "Hoy no tienes jornada",
  FUTURE: "Día futuro",
} as const;

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const dashboard = await getDashboard(session.user.id, session.user.timezone);
  const firstName = session.user.name.split(" ")[0] ?? session.user.name;
  const headline =
    dashboard.totalDebtMinutes > 0
      ? `Debes recuperar ${formatMinutes(dashboard.totalDebtMinutes)}`
      : dashboard.weekExpectedMinutes === 0
        ? "Vas al día"
        : dashboard.weekRemainingMinutes === 0
          ? "Completaste tu meta semanal"
          : `Esta semana te faltan ${formatMinutes(dashboard.weekRemainingMinutes)}`;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-slate-500">
          Hola, {firstName}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {headline}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {dashboard.schedule?.name ?? "Todavía no tienes un horario asignado"}
        </p>
      </header>

      <DailyQuickRegister
        date={dashboard.today}
        schedule={dashboard.schedule?.today ?? null}
        currentEntry={
          dashboard.todayDay?.entry
            ? {
                id: dashboard.todayDay.entry.id,
                type: dashboard.todayDay.entry.type,
                workedMinutes: dashboard.todayDay.workedMinutes,
                balanceMinutes: dashboard.todayDay.balanceMinutes,
              }
            : null
        }
      />

      <section className="card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-teal-700">Progreso semanal</p>
            <p className="mt-1 text-2xl font-semibold">
              {dashboard.progressPercent}%
            </p>
          </div>
          <p className="text-right text-sm text-slate-500">
            {formatMinutes(dashboard.weekWorkedMinutes)} de{" "}
            {formatMinutes(dashboard.weekExpectedMinutes)}
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${dashboard.progressPercent}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {dashboard.todayDay
            ? statusText[dashboard.todayDay.status]
            : "Tu horario está listo para comenzar."}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Esperadas esta semana"
          value={formatMinutes(dashboard.weekExpectedMinutes)}
          helper="Tu horario ya define esta meta."
          icon={CalendarClock}
        />
        <MetricCard
          label="Trabajadas esta semana"
          value={formatMinutes(dashboard.weekWorkedMinutes)}
          helper="Suma de los días registrados."
          icon={CircleGauge}
          tone="lime"
        />
        <MetricCard
          label={
            dashboard.totalCreditMinutes > 0
              ? "Horas adelantadas"
              : dashboard.totalDebtMinutes > 0
                ? "Horas por recuperar"
                : "Saldo histórico"
          }
          value={formatMinutes(
            dashboard.totalCreditMinutes > 0
              ? dashboard.totalCreditMinutes
              : dashboard.totalDebtMinutes,
          )}
          helper={
            dashboard.totalCreditMinutes > 0
              ? "Tiempo a favor disponible para compensar jornadas cortas o completas."
              : dashboard.totalDebtMinutes > 0
                ? "Se reduce automáticamente con horas adicionales."
                : "Sin deuda ni adelanto acumulado."
          }
          icon={TimerReset}
          tone={
            dashboard.totalCreditMinutes
              ? "lime"
              : dashboard.totalDebtMinutes
                ? "amber"
                : "teal"
          }
        />
        <MetricCard
          label="Horas recuperadas"
          value={formatMinutes(dashboard.recoveredMinutes)}
          helper="Tiempo adicional aplicado a deuda anterior."
          icon={BatteryCharging}
          tone="lime"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="card p-5 sm:p-6">
          <p className="text-sm font-bold text-teal-700">Tu saldo</p>
          <h2 className="mt-1 text-xl font-semibold">Evolución reciente</h2>
          {dashboard.recentDays.length > 1 ? (
            <div className="mt-4">
              <BalanceChart days={dashboard.recentDays} />
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">
              El gráfico aparecerá cuando registres tus primeros días.
            </p>
          )}
        </article>
        <article className="card p-5 sm:p-6">
          <p className="text-sm font-bold text-teal-700">Últimos días</p>
          <div className="mt-4 space-y-3">
            {dashboard.recentDays
              .filter((day) => day.status !== "NON_WORKING")
              .slice(-6)
              .reverse()
              .map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold">{day.date}</p>
                    <p className="text-xs text-slate-500">
                      {formatMinutes(day.workedMinutes)} trabajadas
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      day.balanceMinutes < 0
                        ? "bg-amber-50 text-amber-700"
                        : "bg-teal-50 text-teal-700"
                    }`}
                  >
                    {day.balanceMinutes > 0 ? "+" : ""}
                    {formatMinutes(day.balanceMinutes)}
                  </span>
                </div>
              ))}
          </div>
        </article>
      </section>
    </div>
  );
}
