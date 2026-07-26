"use client";

import { CalendarPlus, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const names = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function CreateScheduleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const days = names.map((_, index) => {
      const weekday = index + 1;
      const isWorkingDay = form.get(`working-${weekday}`) === "on";
      return {
        weekday,
        isWorkingDay,
        startTime: isWorkingDay ? String(form.get(`start-${weekday}`)) : null,
        endTime: isWorkingDay ? String(form.get(`end-${weekday}`)) : null,
        breakMinutes: isWorkingDay ? Number(form.get(`break-${weekday}`)) : 0,
        expectedMinutes: isWorkingDay
          ? Number(form.get(`expected-${weekday}`))
          : 0,
      };
    });
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        body: JSON.stringify({
          name: form.get("name"),
          type: "CUSTOM",
          days,
        }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(body.error?.message ?? "No se pudo crear el horario.");
      }
      setMessage("Horario creado. Ya puedes asignarlo a un usuario.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="button-secondary"
        onClick={() => setOpen(true)}
      >
        <CalendarPlus className="h-5 w-5" />
        Crear horario personalizado
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <p className="text-sm font-bold text-teal-700">Horario personalizado</p>
      <div className="mt-4">
        <label className="label" htmlFor="schedule-name">
          Nombre
        </label>
        <input id="schedule-name" name="name" className="input" required />
      </div>
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[720px] space-y-2">
          <div className="grid grid-cols-[120px_80px_repeat(4,1fr)] gap-2 px-3 text-xs font-bold text-slate-500">
            <span>Día</span>
            <span>Laborable</span>
            <span>Entrada</span>
            <span>Salida</span>
            <span>Descanso</span>
            <span>Esperado</span>
          </div>
          {names.map((name, index) => {
            const weekday = index + 1;
            const working = weekday <= 5;
            const friday = weekday === 5;
            return (
              <div
                key={name}
                className="grid grid-cols-[120px_80px_repeat(4,1fr)] items-center gap-2 rounded-xl bg-slate-50 p-3"
              >
                <strong className="text-sm">{name}</strong>
                <input
                  type="checkbox"
                  name={`working-${weekday}`}
                  defaultChecked={working}
                  aria-label={`${name} laborable`}
                  className="h-4 w-4 accent-teal-700"
                />
                <input
                  type="time"
                  name={`start-${weekday}`}
                  defaultValue={friday ? "08:00" : "08:30"}
                  className="input"
                />
                <input
                  type="time"
                  name={`end-${weekday}`}
                  defaultValue={friday ? "14:00" : "14:30"}
                  className="input"
                />
                <input
                  type="number"
                  name={`break-${weekday}`}
                  defaultValue={0}
                  min={0}
                  className="input"
                  aria-label={`Descanso ${name}`}
                />
                <input
                  type="number"
                  name={`expected-${weekday}`}
                  defaultValue={working ? 360 : 0}
                  min={0}
                  className="input"
                  aria-label={`Minutos esperados ${name}`}
                />
              </div>
            );
          })}
        </div>
      </div>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
      <div className="mt-5 flex gap-2">
        <button className="button-primary" disabled={loading}>
          {loading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <CalendarPlus className="h-5 w-5" />
          )}
          Guardar horario
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => setOpen(false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
