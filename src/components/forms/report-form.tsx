"use client";

import {
  FileDown,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatMinutes } from "@/lib/format-minutes";

type ReportUser = Readonly<{ id: string; name: string }>;
type ReportPreview = {
  user: { name: string; schedule: string };
  summary: {
    scheduledMinutes: number;
    workedMinutes: number;
    pendingMinutes: number;
    extraMinutes: number;
    recoveredMinutes: number;
    initialBalanceMinutes: number;
    finalBalanceMinutes: number;
    debtMinutes: number;
    creditMinutes: number;
  };
  days: Array<{
    date: string;
    scheduledMinutes: number;
    workedMinutes: number;
    balanceMinutes: number;
    recoveredMinutes: number;
    status:
      | "COMPLETED"
      | "INCOMPLETE"
      | "PERMISSION"
      | "EXTRA"
      | "NON_WORKING"
      | "IN_PROGRESS"
      | "FUTURE";
    entry: { note: string | null } | null;
  }>;
  permissions: Array<{
    date: string;
    kind: string;
    durationMinutes: number;
    reason: string | null;
  }>;
};

const statusLabels = {
  COMPLETED: "Cumplido",
  INCOMPLETE: "Pendiente",
  PERMISSION: "Permiso",
  EXTRA: "Adicional",
  NON_WORKING: "No laborable",
  IN_PROGRESS: "En curso",
  FUTURE: "Futuro",
} as const;
const permissionLabels: Record<string, string> = {
  UNIVERSITY: "Universidad",
  PERSONAL: "Permiso personal",
  MEDICAL: "Cita médica",
  ILLNESS: "Enfermedad",
  ABSENCE: "Ausencia",
  OTHER: "Otro",
};

export function ReportForm({
  defaultFrom,
  defaultTo,
  weekFrom,
  weekTo,
  today,
  users,
  currentUserId,
}: Readonly<{
  defaultFrom: string;
  defaultTo: string;
  weekFrom: string;
  weekTo: string;
  today: string;
  users: readonly ReportUser[];
  currentUserId: string;
}>) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [userId, setUserId] = useState(currentUserId);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const query = useMemo(
    () => new URLSearchParams({ from, to, userId }).toString(),
    [from, to, userId],
  );

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setError("");
    try {
      const response = await fetch(`/api/reports?${query}`, {
        cache: "no-store",
      });
      const body = (await response.json()) as {
        data?: { report: ReportPreview };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        throw new Error(
          body.error?.message ?? "No se pudo preparar el reporte.",
        );
      }
      setPreview(body.data.report);
    } catch (error) {
      setPreview(null);
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo preparar el reporte.",
      );
    } finally {
      setLoadingPreview(false);
    }
  }, [query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadPreview(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadPreview]);

  const visibleDays =
    preview?.days.filter(
      (day) => day.scheduledMinutes > 0 || Boolean(day.entry),
    ) ?? [];

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-6">
        <p className="text-sm font-bold text-teal-700">Consulta y descarga</p>
        <h2 className="mt-1 text-xl font-semibold">Elige el periodo</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setFrom(weekFrom);
              setTo(weekTo);
            }}
          >
            Esta semana
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setFrom(defaultFrom);
              setTo(defaultTo);
            }}
          >
            Este mes
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {users.length > 1 ? (
            <div className="sm:col-span-2">
              <label className="label" htmlFor="report-user">
                Compañero
              </label>
              <select
                id="report-user"
                className="input"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="label" htmlFor="report-from">
              Desde
            </label>
            <input
              id="report-from"
              className="input"
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="report-to">
              Hasta
            </label>
            <input
              id="report-to"
              className="input"
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            className="button-primary"
            href={`/api/exports/excel?${query}`}
            download
          >
            <FileSpreadsheet className="h-5 w-5" />
            Descargar Excel
          </a>
          <a
            className="button-secondary"
            href={`/api/exports/pdf?${query}`}
            download
          >
            <FileDown className="h-5 w-5" />
            Descargar PDF
          </a>
          <button
            className="button-secondary"
            type="button"
            disabled={loadingPreview}
            onClick={() => void loadPreview()}
          >
            {loadingPreview ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            Actualizar
          </button>
        </div>
      </section>

      {preview ? (
        <>
          <section className="card p-5 sm:p-6">
            <p className="text-sm font-bold text-teal-700">
              {preview.user.name} · {preview.user.schedule}
            </p>
            <h2 className="mt-1 text-xl font-semibold">Resumen del periodo</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Esperadas", preview.summary.scheduledMinutes],
                ["Trabajadas", preview.summary.workedMinutes],
                ["No trabajadas", preview.summary.pendingMinutes],
                ["Adicionales", preview.summary.extraMinutes],
                ["Recuperadas", preview.summary.recoveredMinutes],
                ["Deuda al cierre", preview.summary.debtMinutes],
              ].map(([label, value]) => (
                <article
                  key={String(label)}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatMinutes(Number(value))}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-100 pt-4 text-sm">
              <p>
                Saldo inicial:{" "}
                <strong>
                  {formatMinutes(preview.summary.initialBalanceMinutes)}
                </strong>
              </p>
              <p>
                Saldo final:{" "}
                <strong>
                  {formatMinutes(preview.summary.finalBalanceMinutes)}
                </strong>
              </p>
              <p>
                Crédito:{" "}
                <strong>{formatMinutes(preview.summary.creditMinutes)}</strong>
              </p>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Detalle diario</h2>
            </div>
            {visibleDays.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3">Esperado</th>
                      <th className="px-5 py-3">Trabajado</th>
                      <th className="px-5 py-3">Saldo</th>
                      <th className="px-5 py-3">Recuperado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleDays.map((day) => (
                      <tr key={day.date}>
                        <td className="px-5 py-4 font-semibold">{day.date}</td>
                        <td className="px-5 py-4">
                          {statusLabels[day.status]}
                        </td>
                        <td className="px-5 py-4">
                          {formatMinutes(day.scheduledMinutes)}
                        </td>
                        <td className="px-5 py-4">
                          {formatMinutes(day.workedMinutes)}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {formatMinutes(day.balanceMinutes)}
                        </td>
                        <td className="px-5 py-4">
                          {formatMinutes(day.recoveredMinutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold">
                  No existen jornadas en este periodo.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  El Excel y el PDF mostrarán el resumen en cero.
                </p>
              </div>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Permisos y ausencias</h2>
            </div>
            {preview.permissions.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Tipo</th>
                      <th className="px-5 py-3">Duración</th>
                      <th className="px-5 py-3">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.permissions.map((permission) => (
                      <tr key={`${permission.date}-${permission.kind}`}>
                        <td className="px-5 py-4 font-semibold">
                          {permission.date}
                        </td>
                        <td className="px-5 py-4">
                          {permissionLabels[permission.kind] ?? permission.kind}
                        </td>
                        <td className="px-5 py-4">
                          {formatMinutes(permission.durationMinutes)}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {permission.reason ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                No hay permisos ni ausencias en este periodo.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="card p-10 text-center text-sm text-slate-500">
          {loadingPreview ? "Preparando el reporte…" : "Selecciona un periodo."}
        </section>
      )}
    </div>
  );
}
