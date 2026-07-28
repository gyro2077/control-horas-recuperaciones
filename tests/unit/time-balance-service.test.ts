import { describe, expect, it } from "vitest";

import {
  TimeBalanceError,
  TimeBalanceService,
} from "@/domain/time-balance-service";

describe("TimeBalanceService", () => {
  it("una semana completa de pasante suma 30 horas sin deuda", () => {
    const days = Array.from({ length: 5 }, (_, index) => ({
      day: index,
      balanceMinutes: TimeBalanceService.calculateDay(360, 360).balanceMinutes,
    }));
    const summary = TimeBalanceService.accumulate(days);

    expect(5 * 360).toBe(1_800);
    expect(summary.debtMinutes).toBe(0);
    expect(summary.creditMinutes).toBe(0);
  });

  it("trabajar 4 horas frente a 6 genera 2 horas de deuda", () => {
    const result = TimeBalanceService.calculateDay(360, 240);

    expect(result.balanceMinutes).toBe(-120);
  });

  it("un permiso documenta la ausencia pero no acredita horas", () => {
    const workedMinutes = 360 - 120;
    const result = TimeBalanceService.calculateDay(360, workedMinutes);

    expect(result.balanceMinutes).toBe(-120);
  });

  it("recupera completamente una deuda de dos horas", () => {
    const result = TimeBalanceService.accumulate(
      [{ day: "hoy", balanceMinutes: 120 }],
      -120,
    );

    expect(result.recoveredMinutes).toBe(120);
    expect(result.debtMinutes).toBe(0);
    expect(result.balanceMinutes).toBe(0);
  });

  it("recupera parcialmente dos de cinco horas", () => {
    const result = TimeBalanceService.accumulate(
      [{ day: "hoy", balanceMinutes: 120 }],
      -300,
    );

    expect(result.recoveredMinutes).toBe(120);
    expect(result.debtMinutes).toBe(180);
  });

  it("calcula el tiempo neto con entrada, salida y descanso", () => {
    const worked = TimeBalanceService.calculateWorkedMinutes(
      new Date("2026-07-20T13:30:00Z"),
      new Date("2026-07-20T22:30:00Z"),
      60,
    );

    expect(worked).toBe(480);
  });

  it("propone y calcula una recuperación sencilla hasta las 17:30", () => {
    const suggestions = TimeBalanceService.recoverySuggestions("08:30", 360, 0);
    const recovery = TimeBalanceService.calculateRecovery(
      "08:30",
      "17:30",
      360,
      0,
    );

    expect(suggestions).toContainEqual({ endTime: "15:30", balanceMinutes: 30 });
    expect(suggestions).toContainEqual({ endTime: "16:00", balanceMinutes: 60 });
    expect(suggestions).toContainEqual({ endTime: "17:00", balanceMinutes: 120 });
    expect(suggestions).toContainEqual({ endTime: "17:30", balanceMinutes: 150 });
    expect(recovery.breakMinutes).toBe(30);
    expect(recovery.workedMinutes).toBe(510);
    expect(recovery.balanceMinutes).toBe(150);
  });

  it("rechaza una recuperación que no genera horas adicionales", () => {
    expect(() =>
      TimeBalanceService.calculateRecovery("08:30", "14:30", 360, 0),
    ).toThrowError(
      expect.objectContaining<Partial<TimeBalanceError>>({
        code: "INVALID_INTERVAL",
      }),
    );
  });

  it("clasifica automáticamente un horario diferente", () => {
    const partial = TimeBalanceService.calculateDifferentSchedule(
      "08:30",
      "11:30",
      360,
      0,
    );
    const recovery = TimeBalanceService.calculateDifferentSchedule(
      "08:30",
      "17:00",
      360,
      0,
    );

    expect(partial.workedMinutes).toBe(180);
    expect(partial.balanceMinutes).toBe(-180);
    expect(partial.breakMinutes).toBe(0);
    expect(recovery.workedMinutes).toBe(480);
    expect(recovery.balanceMinutes).toBe(120);
    expect(recovery.breakMinutes).toBe(30);
  });

  it("acepta únicamente franjas de treinta minutos", () => {
    expect(() =>
      TimeBalanceService.calculateDifferentSchedule("08:30", "17:15", 360, 0),
    ).toThrowError(
      expect.objectContaining<Partial<TimeBalanceError>>({
        code: "INVALID_INTERVAL",
      }),
    );
  });

  it("rechaza una salida anterior y descansos inválidos", () => {
    expect(() =>
      TimeBalanceService.calculateWorkedMinutes(
        new Date("2026-07-20T20:00:00Z"),
        new Date("2026-07-20T19:00:00Z"),
        0,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<TimeBalanceError>>({
        code: "INVALID_INTERVAL",
      }),
    );
  });

  it("conserva precisión de minutos enteros", () => {
    const result = TimeBalanceService.calculateDay(361, 359);

    expect(result.balanceMinutes).toBe(-2);
    for (const value of Object.values(result)) {
      expect(Number.isSafeInteger(value)).toBe(true);
    }
  });
});
