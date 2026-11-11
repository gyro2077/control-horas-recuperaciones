import { describe, expect, it } from "vitest";

import {
  calculateBalanceRangeFromData,
  type BalanceRangeInput,
  type BalanceRangeEntry,
} from "@/domain/balance-range-service";
import type { IsoDate } from "@/domain/time-balance-service";
import { civilDate } from "@/lib/time";

function entry(
  date: IsoDate,
  workedMinutes: number,
  scheduledMinutes = 360,
): BalanceRangeEntry {
  return {
    id: date,
    date: civilDate(date),
    scheduledMinutes,
    workedMinutes,
    type: "CUSTOM",
    startDateTime: null,
    endDateTime: null,
    breakMinutes: 0,
    note: null,
    permission: null,
  };
}

function source(overrides: Partial<BalanceRangeInput> = {}): BalanceRangeInput {
  return {
    createdAt: new Date("2026-07-20T05:00:00Z"),
    timezone: "America/Guayaquil",
    scheduleDays: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
      weekday,
      isWorkingDay: weekday <= 5,
      expectedMinutes: weekday <= 5 ? 360 : 0,
      endTime: weekday <= 5 ? new Date("1970-01-01T14:30:00Z") : null,
    })),
    entries: [],
    from: "2026-07-20",
    to: "2026-07-21",
    now: new Date("2026-07-22T17:00:00Z"),
    ...overrides,
  };
}

describe("calculateBalanceRangeFromData", () => {
  it.each([
    {
      name: "cubre completamente el faltante corto",
      priorWorked: 480,
      todayWorked: 300,
      compensatedMinutes: 60,
      pendingMinutes: 0,
    },
    {
      name: "mantiene pendiente solo el tramo no cubierto",
      priorWorked: 390,
      todayWorked: 240,
      compensatedMinutes: 30,
      pendingMinutes: 90,
    },
  ])(
    "$name",
    ({ priorWorked, todayWorked, compensatedMinutes, pendingMinutes }) => {
      const result = calculateBalanceRangeFromData(
        source({
          from: "2026-07-21",
          to: "2026-07-21",
          entries: [
            entry("2026-07-20", priorWorked),
            entry("2026-07-21", todayWorked),
          ],
        }),
      );

      expect(result.days[0]).toMatchObject({
        compensatedMinutes,
        pendingMinutes,
      });
    },
  );

  it("arrastra el crédito previo aunque quede fuera de la ventana visible", () => {
    const input = source({
      entries: [entry("2026-07-20", 480), entry("2026-07-21", 300)],
    });
    const original = structuredClone(input);
    const full = calculateBalanceRangeFromData(input);
    const window = calculateBalanceRangeFromData({
      ...input,
      from: "2026-07-21",
    });

    expect(full.initialBalanceMinutes).toBe(0);
    expect(window.initialBalanceMinutes).toBe(120);
    expect(window.days).toHaveLength(1);
    expect(window.days[0]).toMatchObject({
      date: "2026-07-21",
      balanceMinutes: -60,
      creditUsedMinutes: 60,
      creditMinutes: 60,
      debtMinutes: 0,
    });
    expect(full.balanceMinutes).toBe(60);
    expect(window.balanceMinutes).toBe(full.balanceMinutes);
    expect(calculateBalanceRangeFromData(input)).toEqual(full);
    expect(input).toEqual(original);
  });

  it("recupera deuda anterior al comienzo de la ventana", () => {
    const result = calculateBalanceRangeFromData(
      source({
        from: "2026-07-21",
        entries: [entry("2026-07-20", 300), entry("2026-07-21", 480)],
      }),
    );

    expect(result).toMatchObject({
      initialBalanceMinutes: -60,
      balanceMinutes: 60,
      creditMinutes: 60,
      debtMinutes: 0,
      recoveredMinutes: 60,
    });
    expect(result.days[0]).toMatchObject({
      extraMinutes: 120,
      recoveredMinutes: 60,
      creditGeneratedMinutes: 60,
    });
  });

  it("suma la recuperación solo del período visible", () => {
    const result = calculateBalanceRangeFromData(
      source({
        from: "2026-07-22",
        to: "2026-07-22",
        entries: [
          entry("2026-07-20", 300),
          entry("2026-07-21", 480),
          entry("2026-07-22", 360),
        ],
      }),
    );

    expect(result.initialBalanceMinutes).toBe(60);
    expect(result.balanceMinutes).toBe(60);
    expect(result.recoveredMinutes).toBe(0);
  });

  it("recalcula el arrastre tras corregir una jornada anterior", () => {
    const input = source({
      from: "2026-07-21",
      entries: [entry("2026-07-20", 480), entry("2026-07-21", 300)],
    });
    const before = calculateBalanceRangeFromData(input);
    const after = calculateBalanceRangeFromData({
      ...input,
      entries: [entry("2026-07-20", 420), entry("2026-07-21", 300)],
    });

    expect(before.balanceMinutes).toBe(60);
    expect(after.balanceMinutes).toBe(0);
    expect(after.days).toHaveLength(1);
    expect(after.days[0]?.workedMinutes).toBe(300);
    expect(after.days[0]?.creditUsedMinutes).toBe(60);
  });

  it("conserva crédito al cruzar mes y año sin generar faltantes en feriados o fines de semana", () => {
    const result = calculateBalanceRangeFromData(
      source({
        createdAt: new Date("2026-12-31T05:00:00Z"),
        from: "2027-01-01",
        to: "2027-01-03",
        now: new Date("2027-01-04T17:00:00Z"),
        entries: [entry("2026-12-31", 450)],
      }),
    );

    expect(result.initialBalanceMinutes).toBe(90);
    expect(result.creditMinutes).toBe(90);
    expect(result.days.map((day) => day.balanceMinutes)).toEqual([0, 0, 0]);
    expect(result.days.map((day) => day.status)).toEqual([
      "NON_WORKING",
      "NON_WORKING",
      "NON_WORKING",
    ]);
  });

  it("conserva la fotografía de esperado de un registro aunque cambien horario y feriado", () => {
    const input = source({
      createdAt: new Date("2027-01-01T05:00:00Z"),
      from: "2027-01-01",
      to: "2027-01-01",
      now: new Date("2027-01-02T17:00:00Z"),
      entries: [entry("2027-01-01", 420, 360)],
    });
    const result = calculateBalanceRangeFromData({
      ...input,
      scheduleDays: input.scheduleDays.map((day) => ({
        ...day,
        expectedMinutes: 480,
      })),
    });

    expect(result.days[0]).toMatchObject({
      scheduledMinutes: 360,
      workedMinutes: 420,
      balanceMinutes: 60,
      status: "EXTRA",
    });
  });

  it("conserva un aporte real heredado con esperado cero en un día no laborable", () => {
    const result = calculateBalanceRangeFromData(
      source({
        createdAt: new Date("2026-07-25T05:00:00Z"),
        from: "2026-07-25",
        to: "2026-07-25",
        now: new Date("2026-07-26T17:00:00Z"),
        entries: [entry("2026-07-25", 45, 0)],
      }),
    );

    expect(result.balanceMinutes).toBe(45);
    expect(result.days[0]).toMatchObject({
      scheduledMinutes: 0,
      balanceMinutes: 45,
      status: "NON_WORKING",
    });
  });

  it("incluye registros anteriores al alta sin inventar jornadas faltantes anteriores", () => {
    const result = calculateBalanceRangeFromData(
      source({
        createdAt: new Date("2026-07-22T05:00:00Z"),
        from: "2026-07-21",
        entries: [entry("2026-07-17", 390)],
      }),
    );

    expect(result.initialBalanceMinutes).toBe(30);
    expect(result.balanceMinutes).toBe(30);
    expect(result.days[0]?.scheduledMinutes).toBe(0);
  });

  it("no descuenta nuevamente un permiso ni cambia su explicación guardada", () => {
    const permission = {
      kind: "PERSONAL",
      durationMinutes: 120,
      fullDay: false,
      reason: "Motivo de prueba",
    };
    const result = calculateBalanceRangeFromData(
      source({
        from: "2026-07-21",
        entries: [
          entry("2026-07-20", 480),
          { ...entry("2026-07-21", 300), type: "PERMISSION", permission },
        ],
      }),
    );

    expect(result.days[0]?.permission).toEqual(permission);
    expect(result.days[0]?.balanceMinutes).toBe(-60);
    expect(result.creditMinutes).toBe(60);
  });

  it.each([
    ["2026-07-20T19:29:00Z", "IN_PROGRESS", 0],
    ["2026-07-20T19:30:00Z", "INCOMPLETE", -360],
    ["2026-07-20T19:31:00Z", "INCOMPLETE", -360],
  ])(
    "evalúa la jornada actual con el instante explícito %s",
    (now, status, balance) => {
      const result = calculateBalanceRangeFromData(
        source({
          from: "2026-07-20",
          to: "2026-07-20",
          now: new Date(now),
        }),
      );

      expect(result.days[0]?.status).toBe(status);
      expect(result.balanceMinutes).toBe(balance);
    },
  );

  it("incluye el registro actual confirmado aunque no haya terminado el horario", () => {
    const now = new Date("2026-07-20T15:00:00Z");
    const result = calculateBalanceRangeFromData(
      source({
        to: "2026-07-20",
        now,
        entries: [entry("2026-07-20", 480)],
      }),
    );

    expect(result.creditMinutes).toBe(120);
    expect(result.calculatedAt).toEqual(now);
    expect(result.asOfDate).toBe("2026-07-20");
  });

  it("excluye del saldo una jornada futura aunque tenga un registro", () => {
    const result = calculateBalanceRangeFromData(
      source({
        from: "2026-07-21",
        to: "2026-07-22",
        createdAt: new Date("2026-07-21T05:00:00Z"),
        now: new Date("2026-07-21T17:00:00Z"),
        entries: [entry("2026-07-22", 600)],
      }),
    );

    expect(result.balanceMinutes).toBe(0);
    expect(result.days[1]).toMatchObject({
      status: "FUTURE",
      balanceMinutes: 0,
      creditGeneratedMinutes: 0,
    });
    expect(result.asOfDate).toBe("2026-07-21");
  });

  it("usa el día local cuando UTC ya corresponde al día siguiente", () => {
    const result = calculateBalanceRangeFromData(
      source({ now: new Date("2026-07-21T00:30:00Z") }),
    );

    expect(result.days[0]?.status).toBe("INCOMPLETE");
    expect(result.days[1]?.status).toBe("FUTURE");
    expect(result.balanceMinutes).toBe(-360);
    expect(result.asOfDate).toBe("2026-07-20");
  });

  it("recorre fechas civiles al cruzar el cambio de horario de verano", () => {
    const result = calculateBalanceRangeFromData(
      source({
        timezone: "America/New_York",
        createdAt: new Date("2026-03-06T05:00:00Z"),
        from: "2026-03-06",
        to: "2026-03-09",
        now: new Date("2026-03-10T17:00:00Z"),
      }),
    );

    expect(result.days.map((day) => day.date)).toEqual([
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
      "2026-03-09",
    ]);
    expect(result.debtMinutes).toBe(720);
  });

  it("mantiene saldo cero en una ventana anterior al alta y sin registros", () => {
    const result = calculateBalanceRangeFromData(
      source({ createdAt: new Date("2026-07-22T05:00:00Z") }),
    );

    expect(result).toMatchObject({
      initialBalanceMinutes: 0,
      balanceMinutes: 0,
      creditMinutes: 0,
      debtMinutes: 0,
      recoveredMinutes: 0,
    });
  });

  it("rechaza un rango invertido", () => {
    expect(() =>
      calculateBalanceRangeFromData(
        source({ from: "2026-07-22", to: "2026-07-20" }),
      ),
    ).toThrow(RangeError);
  });
});
