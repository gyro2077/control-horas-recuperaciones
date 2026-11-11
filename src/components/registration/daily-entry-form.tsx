"use client";

import { BadgeCheck, CalendarMinus, Clock3, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { TimeBalanceService } from "@/domain/time-balance-service";
import { formatMinutes } from "@/lib/format-minutes";

type ScheduleView = {
  date: string;
  scheduleName: string;
  scheduleType: string;
  isWorkingDay: boolean;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  expectedMinutes: number;
  balanceBeforeDateMinutes: number;
};

type ExistingEntry = {
  id: string;
  version: string;
  type: "SCHEDULED" | "CUSTOM" | "PERMISSION";
  startTime: string | null;
  endTime: string | null;
  workedMinutes: number;
  breakMinutes: number;
  balanceMinutes: number;
  permissionKind: string | null;
  reason: string | null;
};

type Mode = "SCHEDULED" | "DIFFERENT" | "COMPENSATED" | "ABSENCE";

const HALF_HOUR_OPTIONS = Array.from(
  { length: (20 - 6) * 2 + 1 },
  (_, index) => {
    const totalMinutes = 6 * 60 + index * 30;
    return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
      totalMinutes % 60,
    ).padStart(2, "0")}`;
  },
);

const permissionOptions = [
  ["UNIVERSITY", "Universidad"],
  ["PERSONAL", "Permiso personal"],
  ["MEDICAL", "Cita médica"],
  ["ILLNESS", "Enfermedad"],
  ["ABSENCE", "Ausencia"],
  ["OTHER", "Otro"],
] as const;

export function DailyEntryForm({
  today,
  initialSchedule,
  initialExistingEntry,
}: Readonly<{
  today: string;
  initialSchedule: ScheduleView | null;
  initialExistingEntry: ExistingEntry | null;
}>) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [date, setDate] = useState(initialSchedule?.date ?? today);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [existingEntry, setExistingEntry] = useState(initialExistingEntry);
  const [startTime, setStartTime] = useState(
    initialExistingEntry?.startTime ?? initialSchedule?.startTime ?? "08:30",
  );
  const [endTime, setEndTime] = useState(
    initialExistingEntry?.endTime ?? initialSchedule?.endTime ?? "14:30",
  );
  const [breakMinutes, setBreakMinutes] = useState(
    initialExistingEntry?.breakMinutes ?? initialSchedule?.breakMinutes ?? 0,
  );
  const [permissionKind, setPermissionKind] = useState(
    initialExistingEntry?.permissionKind ?? "OTHER",
  );
  const [note, setNote] = useState(initialExistingEntry?.reason ?? "");
  const [loading, setLoading] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [message, setMessage] = useState("");

  const applyDay = (
    nextSchedule: ScheduleView,
    nextExistingEntry: ExistingEntry | null,
  ) => {
    setSchedule(nextSchedule);
    setExistingEntry(nextExistingEntry);
    setStartTime(
      nextExistingEntry?.startTime ?? nextSchedule.startTime ?? "08:30",
    );
    setEndTime(nextExistingEntry?.endTime ?? nextSchedule.endTime ?? "14:30");
    setBreakMinutes(
      nextExistingEntry?.breakMinutes ?? nextSchedule.breakMinutes,
    );
    setPermissionKind(nextExistingEntry?.permissionKind ?? "OTHER");
    setNote(nextExistingEntry?.reason ?? "");
  };

  useEffect(() => {
    if (date === initialSchedule?.date) return;
    let active = true;
    void fetch(`/api/daily-entries/schedule?date=${date}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          data?: {
            schedule: ScheduleView;
            existingEntry: ExistingEntry | null;
          };
          error?: { message?: string };
        };
        if (!response.ok || !body.data) {
          throw new Error(
            body.error?.message ?? "No se pudo cargar el horario.",
          );
        }
        if (!active) return;
        applyDay(body.data.schedule, body.data.existingEntry);
      })
      .catch((error: unknown) => {
        if (active) {
          setSchedule(null);
          setExistingEntry(null);
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el horario.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingDay(false);
      });
    return () => {
      active = false;
    };
  }, [date, initialSchedule?.date]);

  const differentPreview = useMemo(() => {
    if (!schedule?.isWorkingDay) return null;
    try {
      return TimeBalanceService.calculateEffectiveInterval(
        startTime,
        endTime,
        schedule.expectedMinutes,
        schedule.breakMinutes,
        breakMinutes,
      );
    } catch {
      return null;
    }
  }, [breakMinutes, endTime, schedule, startTime]);
  const balanceMinutes = differentPreview?.balanceMinutes ?? 0;
  const isMissingTime = balanceMinutes < 0;
  const timeOptions = Array.from(
    new Set([startTime, endTime, ...HALF_HOUR_OPTIONS]),
  ).sort();

  const changeDate = (nextDate: string) => {
    setMode(null);
    setMessage("");
    if (nextDate === initialSchedule?.date && initialSchedule) {
      applyDay(initialSchedule, initialExistingEntry);
      setLoadingDay(false);
    } else {
      setLoadingDay(true);
    }
    setDate(nextDate);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mode) return;
    setLoading(true);
    setMessage("");
    try {
      const payload =
        mode === "SCHEDULED"
          ? { mode, date }
          : mode === "COMPENSATED"
            ? { mode, date }
            : mode === "DIFFERENT"
              ? {
                  mode,
                  date,
                  startTime,
                  endTime,
                  breakMinutes,
                  permissionKind: isMissingTime ? permissionKind : undefined,
                  reason: note || undefined,
                }
              : {
                  mode: "PERMISSION",
                  date,
                  permissionKind,
                  workedMinutes: 0,
                  fullDay: true,
                  reason: note || undefined,
                };
      const response = await fetch("/api/daily-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(body.error?.message ?? "No se pudo guardar el día.");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo guardar.",
      );
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    {
      id: "SCHEDULED" as const,
      label: "Cumplí mi horario",
      helper: schedule?.startTime
        ? `${schedule.startTime}–${schedule.endTime}`
        : "Usar mi jornada asignada",
      icon: BadgeCheck,
    },
    {
      id: "DIFFERENT" as const,
      label: "Trabajé otras horas",
      helper: "Entré o salí a otra hora",
      icon: Clock3,
    },
    ...(!existingEntry &&
    schedule &&
    schedule.balanceBeforeDateMinutes >= schedule.expectedMinutes
      ? [
          {
            id: "COMPENSATED" as const,
            label: "Compensar jornada",
            helper: `Usar ${formatMinutes(schedule.expectedMinutes)} de saldo a favor`,
            icon: BadgeCheck,
          },
        ]
      : []),
    {
      id: "ABSENCE" as const,
      label: "No trabajé",
      helper: "Permiso, universidad o ausencia",
      icon: CalendarMinus,
    },
  ];

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
          <div>
            <label className="label" htmlFor="daily-date">
              1. Elige el día
            </label>
            <input
              id="daily-date"
              className="input"
              type="date"
              max={today}
              value={date}
              onChange={(event) => changeDate(event.target.value)}
              required
            />
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <strong className="block text-slate-800">
              {loadingDay
                ? "Cargando horario…"
                : (schedule?.scheduleName ?? "Sin horario")}
            </strong>
            <span className="mt-1 block text-slate-500">
              {schedule?.isWorkingDay
                ? `${schedule.startTime}–${schedule.endTime} · debes cumplir ${formatMinutes(schedule.expectedMinutes)}`
                : "Este día no forma parte de tu horario laboral"}
            </span>
          </div>
        </div>

        {existingEntry ? (
          <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
            Ya registraste {formatMinutes(existingEntry.workedMinutes)} este
            día. Si guardas nuevamente, actualizaremos ese mismo registro.
          </div>
        ) : null}
      </section>

      {schedule?.isWorkingDay ? (
        <section className="card p-5 sm:p-6">
          <p className="text-sm font-bold text-teal-700">
            2. ¿Qué ocurrió ese día?
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {modes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`min-h-24 rounded-2xl border p-4 text-left transition ${
                    mode === item.id
                      ? "border-teal-700 bg-teal-50 text-teal-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <strong className="mt-3 block">{item.label}</strong>
                  <span className="mt-1 block text-xs opacity-75">
                    {item.helper}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="card p-6 text-center">
          <p className="font-semibold">Selecciona un día laboral.</p>
          <p className="mt-2 text-sm text-slate-500">
            Los fines de semana no generan horas pendientes.
          </p>
        </section>
      )}

      {mode ? (
        <section className="card p-5 sm:p-6">
          {mode === "SCHEDULED" ? (
            <div className="rounded-2xl bg-teal-50 p-5">
              <p className="font-bold text-teal-900">Jornada completa</p>
              <p className="mt-2 text-sm text-slate-600">
                Registraremos automáticamente{" "}
                {formatMinutes(schedule?.expectedMinutes ?? 0)} trabajadas, sin
                deuda ni recuperación.
              </p>
            </div>
          ) : null}

          {mode === "COMPENSATED" ? (
            <div className="rounded-2xl bg-lime-50 p-5">
              <p className="font-bold text-lime-950">
                Jornada cubierta con tu saldo
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Usaremos {formatMinutes(schedule?.expectedMinutes ?? 0)} de tus{" "}
                {formatMinutes(schedule?.balanceBeforeDateMinutes ?? 0)} a
                favor. No se registrarán horas trabajadas.
              </p>
            </div>
          ) : null}

          {mode === "DIFFERENT" ? (
            <>
              <div>
                <p className="font-bold text-slate-800">
                  Selecciona cuándo entraste y cuándo saliste
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Elige horas completas o medias horas hasta las 20:00. Indica
                  el descanso que realmente tomaste.
                </p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="different-start">
                    Entrada
                  </label>
                  <select
                    id="different-start"
                    className="input"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="different-end">
                    Salida
                  </label>
                  <select
                    id="different-end"
                    className="input"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 max-w-xs">
                <label className="label" htmlFor="actual-break">
                  Descanso tomado (minutos)
                </label>
                <input
                  id="actual-break"
                  className="input"
                  type="number"
                  min={0}
                  max={1_440}
                  step={1}
                  value={breakMinutes}
                  onChange={(event) =>
                    setBreakMinutes(Number(event.target.value))
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  El horario propone{" "}
                  {formatMinutes(schedule?.breakMinutes ?? 0)}.
                </p>
              </div>

              {differentPreview ? (
                <div
                  className={`mt-5 rounded-2xl p-5 ${
                    balanceMinutes > 0
                      ? "bg-lime-50"
                      : balanceMinutes < 0
                        ? "bg-amber-50"
                        : "bg-teal-50"
                  }`}
                >
                  <p className="text-sm text-slate-600">
                    Trabajaste{" "}
                    <strong>
                      {formatMinutes(differentPreview.workedMinutes)}
                    </strong>{" "}
                    de {formatMinutes(schedule?.expectedMinutes ?? 0)}.
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {balanceMinutes > 0
                      ? `Recuperarás ${formatMinutes(balanceMinutes)}`
                      : balanceMinutes < 0
                        ? `Te faltarán ${formatMinutes(-balanceMinutes)}`
                        : "Cumpliste tu jornada"}
                  </p>
                  {differentPreview.effectiveBreakMinutes > 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      El cálculo incluye{" "}
                      {formatMinutes(differentPreview.effectiveBreakMinutes)} de
                      descanso realmente tomado.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  La salida debe ser posterior a la entrada.
                </p>
              )}
            </>
          ) : null}

          {mode === "ABSENCE" || (mode === "DIFFERENT" && isMissingTime) ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="permission-kind">
                  {mode === "ABSENCE"
                    ? "Motivo de la ausencia"
                    : "¿Por qué faltaron horas?"}
                </label>
                <select
                  id="permission-kind"
                  className="input"
                  value={permissionKind}
                  onChange={(event) => setPermissionKind(event.target.value)}
                >
                  {permissionOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="daily-note">
                  Explicación opcional
                </label>
                <input
                  id="daily-note"
                  className="input"
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Puedes añadir una explicación breve"
                />
              </div>
            </div>
          ) : mode === "DIFFERENT" ? (
            <div className="mt-5">
              <label className="label" htmlFor="daily-note">
                Nota opcional
              </label>
              <input
                id="daily-note"
                className="input"
                maxLength={500}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ejemplo: recuperación de horas"
              />
            </div>
          ) : null}

          {mode === "ABSENCE" ? (
            <div className="mt-5 rounded-2xl bg-amber-50 p-5">
              <p className="font-bold text-amber-900">
                Se añadirán {formatMinutes(schedule?.expectedMinutes ?? 0)}{" "}
                pendientes.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                El motivo quedará visible en tu historial y reportes.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {message ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        className="button-primary w-full sm:w-auto"
        disabled={
          loading ||
          loadingDay ||
          !mode ||
          !schedule?.isWorkingDay ||
          (mode === "DIFFERENT" && !differentPreview)
        }
      >
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <BadgeCheck className="h-5 w-5" />
        )}
        {existingEntry ? "Actualizar este día" : "Guardar este día"}
      </button>
    </form>
  );
}
