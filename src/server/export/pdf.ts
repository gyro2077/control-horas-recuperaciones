import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { formatMinutes } from "@/lib/format-minutes";
import type { ReportData } from "@/server/export/report-data";

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

export async function createReportPdf(report: ReportData) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const width = 595;
  const height = 842;
  const margin = 44;
  let page = document.addPage([width, height]);
  let y = height - margin;

  const newPage = () => {
    page = document.addPage([width, height]);
    y = height - margin;
  };
  const line = (text: string, strong = false, size = 9) => {
    if (y < margin + 20) newPage();
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: strong ? bold : regular,
      color: rgb(0.1, 0.16, 0.14),
      maxWidth: width - margin * 2,
    });
    y -= size + 7;
  };

  line("CONTROL DE HORAS", true, 16);
  line("Reporte de jornada, deuda y recuperación", true, 11);
  y -= 6;
  line(`Usuario: ${report.user.name}`);
  line(`Horario: ${report.user.schedule}`);
  line(`Periodo: ${report.period.from} al ${report.period.to}`);
  line(
    `Generado: ${report.generatedAt.toLocaleString("es-EC", {
      timeZone: report.user.timezone,
    })}`,
  );
  y -= 8;
  line("RESUMEN", true, 12);
  for (const [label, value] of [
    ["Esperadas", report.summary.scheduledMinutes],
    ["Trabajadas", report.summary.workedMinutes],
    ["No trabajadas", report.summary.pendingMinutes],
    ["Adicionales", report.summary.extraMinutes],
    ["Recuperadas", report.summary.recoveredMinutes],
    ["Saldo inicial", report.summary.initialBalanceMinutes],
    ["Saldo final", report.summary.finalBalanceMinutes],
    ["Deuda al cierre", report.summary.debtMinutes],
    ["Crédito al cierre", report.summary.creditMinutes],
  ] as const) {
    line(`${label}: ${formatMinutes(value)}`, label === "Saldo final");
  }
  y -= 8;
  line("DETALLE DIARIO", true, 12);
  line("Fecha        Esperado     Trabajado    Saldo       Estado", true);
  for (const day of report.days) {
    line(
      `${day.date}   ${formatMinutes(day.scheduledMinutes).padEnd(12)} ${formatMinutes(day.workedMinutes).padEnd(12)} ${formatMinutes(day.balanceMinutes).padEnd(11)} ${statusLabels[day.status]}`,
    );
  }
  y -= 8;
  line("PERMISOS Y AUSENCIAS", true, 12);
  if (!report.permissions.length) {
    line("No existen permisos en el periodo.");
  } else {
    for (const permission of report.permissions) {
      line(
        `${permission.date} · ${permissionLabels[permission.kind] ?? permission.kind} · ${formatMinutes(permission.durationMinutes)}`,
        true,
      );
      if (permission.reason) line(permission.reason);
    }
  }
  return document.save();
}
