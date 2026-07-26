"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatMinutes } from "@/lib/format-minutes";

export function AdminEntryRow({
  entry,
}: Readonly<{
  entry: {
    id: string;
    date: string;
    userName: string;
    workedMinutes: number;
    scheduledMinutes: number;
  };
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [workedMinutes, setWorkedMinutes] = useState(entry.workedMinutes);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/daily-entries/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "control-horas-pwa",
        },
        body: JSON.stringify({ workedMinutes, reason }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(body.error?.message ?? "No se pudo corregir.");
      }
      setMessage("Registro corregido.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo corregir.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-slate-100 px-5 py-4 last:border-0 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">{entry.userName}</p>
          <p className="text-sm text-slate-500">
            {entry.date} · {formatMinutes(entry.workedMinutes)} de{" "}
            {formatMinutes(entry.scheduledMinutes)}
          </p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() => setOpen((value) => !value)}
        >
          Corregir minutos
        </button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <div>
            <label className="label" htmlFor={`worked-${entry.id}`}>
              Minutos trabajados
            </label>
            <input
              id={`worked-${entry.id}`}
              className="input"
              type="number"
              min={0}
              max={1_440}
              value={workedMinutes}
              onChange={(event) => setWorkedMinutes(Number(event.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor={`reason-${entry.id}`}>
              Motivo de la corrección
            </label>
            <input
              id={`reason-${entry.id}`}
              className="input"
              minLength={3}
              maxLength={300}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="button-primary"
            disabled={loading || reason.trim().length < 3}
            onClick={() => void save()}
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
