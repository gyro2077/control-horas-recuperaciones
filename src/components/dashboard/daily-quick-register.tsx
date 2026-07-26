"use client";

import { BadgeCheck, CalendarClock, PencilLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatMinutes } from "@/lib/format-minutes";

type Schedule = {
  isWorkingDay: boolean;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  expectedMinutes: number;
};

type CurrentEntry = {
  id: string;
  type: "SCHEDULED" | "CUSTOM" | "PERMISSION";
  workedMinutes: number;
  balanceMinutes: number;
};

export function DailyQuickRegister({
  date,
  schedule,
  currentEntry,
}: Readonly<{
  date: string;
  schedule: Schedule | null;
  currentEntry: CurrentEntry | null;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const complete = async () => {
    if (
      !window.confirm(
        `¿Confirmas que cumpliste tu horario de ${schedule?.startTime} a ${schedule?.endTime}?`,
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/daily-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        body: JSON.stringify({ mode: "SCHEDULED", date }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(body.error?.message ?? "No se pudo registrar el día.");
      }
      setMessage("Listo. Tu jornada quedó registrada.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo registrar.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!schedule?.isWorkingDay) {
    return (
      <section className="card p-5 sm:p-6">
        <p className="text-sm font-bold text-teal-700">Hoy</p>
        <h2 className="mt-1 text-xl font-semibold">
          No tienes jornada programada
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Puedes registrar o corregir otro día laboral.
        </p>
        <Link href="/registro" className="button-primary mt-4">
          <PencilLine className="h-4 w-4" />
          Registrar otro día
        </Link>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 p-5 text-white sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-teal-100">Registro de hoy</p>
            <h2 className="mt-1 text-2xl font-semibold">
              {currentEntry
                ? "Tu día ya está registrado"
                : "¿Cumpliste tu horario?"}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-teal-50">
              <CalendarClock className="h-4 w-4" />
              {schedule.startTime}–{schedule.endTime} ·{" "}
              {formatMinutes(schedule.expectedMinutes)}
            </p>
          </div>
          {currentEntry ? (
            <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 font-bold">
              <BadgeCheck className="h-5 w-5" />
              {formatMinutes(currentEntry.workedMinutes)} registradas
            </span>
          ) : (
            <button
              type="button"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-5 font-bold text-teal-800 shadow-sm disabled:opacity-60"
              onClick={() => void complete()}
              disabled={loading}
            >
              <BadgeCheck className="h-5 w-5" />
              {loading ? "Guardando…" : "Sí, cumplí mi horario"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="font-semibold text-slate-700">
            ¿Entraste o saliste a otra hora?
          </p>
          <p className="text-sm text-slate-500">
            También puedes registrar un permiso o una ausencia.
          </p>
        </div>
        <Link href="/registro" className="button-secondary">
          <PencilLine className="h-4 w-4" />
          {currentEntry ? "Editar este día" : "Mi día fue diferente"}
        </Link>
      </div>

      {message ? (
        <p
          role="status"
          className="border-t border-slate-100 px-6 py-3 text-sm"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
