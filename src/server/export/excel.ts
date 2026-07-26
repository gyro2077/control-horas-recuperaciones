import "server-only";

import ExcelJS from "exceljs";

import { formatMinutes } from "@/lib/format-minutes";
import type { ReportData } from "@/server/export/report-data";

const HEADER_FILL = "FF0F766E";
const statusLabels = {
  COMPLETED: "Cumplido",
  INCOMPLETE: "Pendiente",
  PERMISSION: "Permiso o ausencia",
  EXTRA: "Horas adicionales",
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

function styleSheet(sheet: ExcelJS.Worksheet, widths: number[]) {
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: widths.length },
  };
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };
  widths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
}

function localTime(value: Date | null, timezone: string) {
  if (!value) return "";
  return value.toLocaleTimeString("es-EC", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function createReportExcel(report: ReportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Control de Horas";
  workbook.created = report.generatedAt;

  const summary = workbook.addWorksheet("Resumen");
  summary.addRow(["Concepto", "Valor", "Minutos"]);
  summary.addRows([
    ["Usuario", report.user.name, ""],
    ["Correo", report.user.email, ""],
    ["Horario", report.user.schedule, ""],
    ["Periodo", `${report.period.from} al ${report.period.to}`, ""],
    [
      "Horas esperadas",
      formatMinutes(report.summary.scheduledMinutes),
      report.summary.scheduledMinutes,
    ],
    [
      "Horas trabajadas",
      formatMinutes(report.summary.workedMinutes),
      report.summary.workedMinutes,
    ],
    [
      "Horas no trabajadas",
      formatMinutes(report.summary.pendingMinutes),
      report.summary.pendingMinutes,
    ],
    [
      "Horas adicionales",
      formatMinutes(report.summary.extraMinutes),
      report.summary.extraMinutes,
    ],
    [
      "Horas recuperadas",
      formatMinutes(report.summary.recoveredMinutes),
      report.summary.recoveredMinutes,
    ],
    [
      "Saldo inicial",
      formatMinutes(report.summary.initialBalanceMinutes),
      report.summary.initialBalanceMinutes,
    ],
    [
      "Saldo final",
      formatMinutes(report.summary.finalBalanceMinutes),
      report.summary.finalBalanceMinutes,
    ],
    [
      "Deuda al cierre",
      formatMinutes(report.summary.debtMinutes),
      report.summary.debtMinutes,
    ],
    [
      "Crédito al cierre",
      formatMinutes(report.summary.creditMinutes),
      report.summary.creditMinutes,
    ],
  ]);
  styleSheet(summary, [28, 38, 14]);

  const daily = workbook.addWorksheet("Detalle diario");
  daily.addRow([
    "Fecha",
    "Esperado",
    "Entrada",
    "Salida",
    "Descanso",
    "Trabajado",
    "Saldo",
    "Recuperado",
    "Estado",
    "Nota",
  ]);
  for (const day of report.days) {
    daily.addRow([
      new Date(`${day.date}T00:00:00.000Z`),
      day.scheduledMinutes,
      localTime(day.entry?.startDateTime ?? null, report.user.timezone),
      localTime(day.entry?.endDateTime ?? null, report.user.timezone),
      day.entry?.breakMinutes ?? 0,
      day.workedMinutes,
      day.balanceMinutes,
      day.recoveredMinutes,
      statusLabels[day.status],
      day.entry?.note ?? "",
    ]);
  }
  daily.addRow([
    "TOTAL",
    { formula: `SUM(B2:B${daily.rowCount})` },
    "",
    "",
    { formula: `SUM(E2:E${daily.rowCount})` },
    { formula: `SUM(F2:F${daily.rowCount})` },
    { formula: `SUM(G2:G${daily.rowCount})` },
    { formula: `SUM(H2:H${daily.rowCount})` },
    "",
    "",
  ]);
  styleSheet(daily, [14, 14, 12, 12, 12, 14, 14, 14, 18, 42]);
  daily.getColumn(1).numFmt = "dd/mm/yyyy";

  const permissions = workbook.addWorksheet("Permisos y ausencias");
  permissions.addRow(["Fecha", "Tipo", "Duración", "Día completo", "Motivo"]);
  for (const permission of report.permissions) {
    permissions.addRow([
      new Date(`${permission.date}T00:00:00.000Z`),
      permissionLabels[permission.kind] ?? permission.kind,
      permission.durationMinutes,
      permission.fullDay ? "Sí" : "No",
      permission.reason ?? "",
    ]);
  }
  styleSheet(permissions, [14, 22, 16, 16, 50]);
  permissions.getColumn(1).numFmt = "dd/mm/yyyy";

  return workbook.xlsx.writeBuffer();
}
