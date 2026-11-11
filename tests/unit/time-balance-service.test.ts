import { describe, expect, it } from "vitest";

import {
  TimeBalanceError,
  TimeBalanceService,
} from "@/domain/time-balance-service";

describe("TimeBalanceService", () => {
  describe("movimiento de saldo", () => {
    it.each([
      {
        name: "recupera deuda antes de generar adelanto",
        previous: -60,
        daily: 120,
        expected: {
          extraMinutes: 120,
          recoveredMinutes: 60,
          creditGeneratedMinutes: 60,
          creditUsedMinutes: 0,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 60,
          creditMinutes: 60,
          debtMinutes: 0,
        },
      },
      {
        name: "genera adelanto cuando no existe deuda",
        previous: 0,
        daily: 120,
        expected: {
          extraMinutes: 120,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 120,
          creditUsedMinutes: 0,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 120,
          creditMinutes: 120,
          debtMinutes: 0,
        },
      },
      {
        name: "compensa un faltante con crédito previo",
        previous: 120,
        daily: -60,
        expected: {
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 60,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 60,
          creditMinutes: 60,
          debtMinutes: 0,
        },
      },
      {
        name: "crea deuda únicamente por el faltante descubierto",
        previous: 30,
        daily: -90,
        expected: {
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 30,
          uncoveredMinutes: 60,
          accumulatedBalanceMinutes: -60,
          creditMinutes: 0,
          debtMinutes: 60,
        },
      },
      {
        name: "distingue deuda anterior del faltante diario descubierto",
        previous: -60,
        daily: -30,
        expected: {
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 0,
          uncoveredMinutes: 30,
          accumulatedBalanceMinutes: -90,
          creditMinutes: 0,
          debtMinutes: 90,
        },
      },
      {
        name: "conserva crédito de minutos que no son medias horas",
        previous: 17,
        daily: -2,
        expected: {
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 2,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 15,
          creditMinutes: 15,
          debtMinutes: 0,
        },
      },
      {
        name: "conserva el estado de saldo cero",
        previous: 0,
        daily: 0,
        expected: {
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 0,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 0,
          creditMinutes: 0,
          debtMinutes: 0,
        },
      },
    ])("$name", ({ previous, daily, expected }) => {
      const movement = TimeBalanceService.calculateBalanceMovement(
        previous,
        daily,
      );

      expect(movement).toEqual(expected);
      expect(Object.values(movement).every(Number.isSafeInteger)).toBe(true);
    });

    it.each([
      [0.5, 60],
      [0, Number.NaN],
      [Number.POSITIVE_INFINITY, 0],
      [Number.MAX_SAFE_INTEGER, 1],
    ])(
      "rechaza minutos inválidos o un cierre inseguro (%s, %s)",
      (previous, daily) => {
        expect(() =>
          TimeBalanceService.calculateBalanceMovement(previous, daily),
        ).toThrowError(
          expect.objectContaining<Partial<TimeBalanceError>>({
            code: "INVALID_MINUTES",
          }),
        );
      },
    );

    it("expone el movimiento de cada día sin cambiar los totales existentes", () => {
      const days = [
        { day: "primero", balanceMinutes: 120 },
        { day: "segundo", balanceMinutes: -30 },
        { day: "tercero", balanceMinutes: -90 },
      ] as const;
      const result = TimeBalanceService.accumulate(days, -60);

      expect(result.days).toEqual([
        {
          ...days[0],
          extraMinutes: 120,
          recoveredMinutes: 60,
          creditGeneratedMinutes: 60,
          creditUsedMinutes: 0,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 60,
          creditMinutes: 60,
          debtMinutes: 0,
        },
        {
          ...days[1],
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 30,
          uncoveredMinutes: 0,
          accumulatedBalanceMinutes: 30,
          creditMinutes: 30,
          debtMinutes: 0,
        },
        {
          ...days[2],
          extraMinutes: 0,
          recoveredMinutes: 0,
          creditGeneratedMinutes: 0,
          creditUsedMinutes: 30,
          uncoveredMinutes: 60,
          accumulatedBalanceMinutes: -60,
          creditMinutes: 0,
          debtMinutes: 60,
        },
      ]);
      expect(result).toMatchObject({
        balanceMinutes: -60,
        creditMinutes: 0,
        debtMinutes: 60,
        recoveredMinutes: 60,
      });
      expect(days).toEqual([
        { day: "primero", balanceMinutes: 120 },
        { day: "segundo", balanceMinutes: -30 },
        { day: "tercero", balanceMinutes: -90 },
      ]);
    });

    it("conserva el saldo inicial cuando no hay jornadas", () => {
      expect(TimeBalanceService.accumulate([], 17)).toEqual({
        days: [],
        balanceMinutes: 17,
        creditMinutes: 17,
        debtMinutes: 0,
        recoveredMinutes: 0,
      });
    });

    it("rechaza una recuperación acumulada que deja de ser un entero seguro", () => {
      const minutes = Number.MAX_SAFE_INTEGER;

      expect(() =>
        TimeBalanceService.accumulate([
          { day: 1, balanceMinutes: -minutes },
          { day: 2, balanceMinutes: minutes },
          { day: 3, balanceMinutes: -minutes },
          { day: 4, balanceMinutes: minutes },
        ]),
      ).toThrowError(
        expect.objectContaining<Partial<TimeBalanceError>>({
          code: "INVALID_MINUTES",
        }),
      );
    });
  });

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

  it.each([0, 30, 60])(
    "usa descanso efectivo de %s minutos sin imponer una pausa adicional",
    (effectiveBreakMinutes) => {
      const worked = TimeBalanceService.calculateWorkedMinutesWithBreak(
        new Date("2026-07-20T08:30:00Z"),
        new Date("2026-07-20T17:00:00Z"),
        effectiveBreakMinutes,
      );

      expect(worked).toBe(510 - effectiveBreakMinutes);
    },
  );

  it("calcula una franja usando descanso programado y descanso realmente tomado", () => {
    expect(
      TimeBalanceService.calculateEffectiveInterval(
        "08:30",
        "17:00",
        480,
        60,
        30,
      ),
    ).toEqual({
      startTime: "08:30",
      endTime: "17:00",
      expectedMinutes: 480,
      scheduledBreakMinutes: 60,
      effectiveBreakMinutes: 30,
      workedMinutes: 480,
      balanceMinutes: 0,
    });
  });

  it("rechaza descanso efectivo que cubre todo el intervalo", () => {
    expect(() =>
      TimeBalanceService.calculateEffectiveInterval(
        "08:30",
        "09:00",
        480,
        0,
        30,
      ),
    ).toThrowError(expect.objectContaining({ code: "INVALID_INTERVAL" }));
  });

  it("propone y calcula una recuperación sencilla hasta las 17:30", () => {
    const suggestions = TimeBalanceService.recoverySuggestions("08:30", 360, 0);
    const recovery = TimeBalanceService.calculateRecovery(
      "08:30",
      "17:30",
      360,
      0,
    );

    expect(suggestions).toContainEqual({
      endTime: "15:30",
      balanceMinutes: 30,
    });
    expect(suggestions).toContainEqual({
      endTime: "16:00",
      balanceMinutes: 60,
    });
    expect(suggestions).toContainEqual({
      endTime: "17:00",
      balanceMinutes: 120,
    });
    expect(suggestions).toContainEqual({
      endTime: "17:30",
      balanceMinutes: 150,
    });
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
