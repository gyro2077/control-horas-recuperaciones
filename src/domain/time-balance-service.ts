export type IsoDate = `${number}-${number}-${number}`;

export type AccumulatedDay<T = unknown> = Readonly<{
  day: T;
  balanceMinutes: number;
}>;

export type AccumulatedBalanceDay<T = unknown> = Readonly<{
  day: T;
  balanceMinutes: number;
  recoveredMinutes: number;
  accumulatedBalanceMinutes: number;
  debtMinutes: number;
  creditMinutes: number;
}>;

export type BalanceSummary<T = unknown> = Readonly<{
  days: readonly AccumulatedBalanceDay<T>[];
  balanceMinutes: number;
  debtMinutes: number;
  creditMinutes: number;
  recoveredMinutes: number;
}>;

export class TimeBalanceError extends Error {
  constructor(
    public readonly code: "INVALID_MINUTES" | "INVALID_INTERVAL",
    message: string,
  ) {
    super(message);
    this.name = "TimeBalanceError";
  }
}

const CLOCK_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DEFAULT_RECOVERY_BREAK_MINUTES = 60;

function assertMinutes(value: number, field: string, allowNegative = false) {
  if (!Number.isSafeInteger(value) || (!allowNegative && value < 0)) {
    throw new TimeBalanceError(
      "INVALID_MINUTES",
      `${field} debe expresarse en minutos enteros válidos.`,
    );
  }
}

function clockToMinutes(value: string): number {
  const match = CLOCK_PATTERN.exec(value);
  if (!match) {
    throw new TimeBalanceError(
      "INVALID_INTERVAL",
      "La hora seleccionada no es válida.",
    );
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToClock(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0 || value >= 24 * 60) {
    throw new TimeBalanceError(
      "INVALID_INTERVAL",
      "La recuperación debe finalizar el mismo día.",
    );
  }
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(
    value % 60,
  ).padStart(2, "0")}`;
}

function assertHalfHour(value: string): number {
  const minutes = clockToMinutes(value);
  if (minutes % 30 !== 0) {
    throw new TimeBalanceError(
      "INVALID_INTERVAL",
      "Selecciona horas completas o medias horas.",
    );
  }
  return minutes;
}

export const TimeBalanceService = {
  calculateWorkedMinutes(start: Date, end: Date, breakMinutes: number): number {
    assertMinutes(breakMinutes, "El descanso");
    const grossMinutes = Math.floor((end.getTime() - start.getTime()) / 60_000);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      grossMinutes <= 0 ||
      breakMinutes >= grossMinutes
    ) {
      throw new TimeBalanceError(
        "INVALID_INTERVAL",
        "La salida debe ser posterior a la entrada y el descanso menor que la jornada.",
      );
    }

    return grossMinutes - breakMinutes;
  },

  calculateDay(scheduledMinutes: number, workedMinutes: number) {
    assertMinutes(scheduledMinutes, "Los minutos esperados");
    assertMinutes(workedMinutes, "Los minutos trabajados");

    return {
      scheduledMinutes,
      workedMinutes,
      balanceMinutes: workedMinutes - scheduledMinutes,
    } as const;
  },

  calculateRecovery(
    startTime: string,
    endTime: string,
    scheduledMinutes: number,
    scheduleBreakMinutes: number,
  ) {
    assertMinutes(scheduledMinutes, "Los minutos esperados");
    assertMinutes(scheduleBreakMinutes, "El descanso configurado");
    const startMinutes = clockToMinutes(startTime);
    const endMinutes = clockToMinutes(endTime);
    const breakMinutes = Math.max(
      scheduleBreakMinutes,
      DEFAULT_RECOVERY_BREAK_MINUTES,
    );
    const workedMinutes = endMinutes - startMinutes - breakMinutes;
    const balanceMinutes = workedMinutes - scheduledMinutes;

    if (workedMinutes <= 0 || balanceMinutes <= 0) {
      throw new TimeBalanceError(
        "INVALID_INTERVAL",
        "Selecciona una salida posterior que genere tiempo adicional.",
      );
    }

    return {
      startTime,
      endTime,
      breakMinutes,
      scheduledMinutes,
      workedMinutes,
      balanceMinutes,
    } as const;
  },

  calculateDifferentSchedule(
    startTime: string,
    endTime: string,
    scheduledMinutes: number,
    scheduleBreakMinutes: number,
  ) {
    assertMinutes(scheduledMinutes, "Los minutos esperados");
    assertMinutes(scheduleBreakMinutes, "El descanso configurado");
    const startMinutes = assertHalfHour(startTime);
    const endMinutes = assertHalfHour(endTime);
    const grossMinutes = endMinutes - startMinutes;

    if (grossMinutes <= 0) {
      throw new TimeBalanceError(
        "INVALID_INTERVAL",
        "La salida debe ser posterior a la entrada.",
      );
    }

    const breakMinutes =
      grossMinutes > scheduledMinutes
        ? Math.max(scheduleBreakMinutes, DEFAULT_RECOVERY_BREAK_MINUTES)
        : grossMinutes === scheduledMinutes
          ? scheduleBreakMinutes
          : 0;
    const workedMinutes = grossMinutes - breakMinutes;
    if (workedMinutes < 0) {
      throw new TimeBalanceError(
        "INVALID_INTERVAL",
        "El horario seleccionado no permite calcular el tiempo trabajado.",
      );
    }

    return {
      startTime,
      endTime,
      breakMinutes,
      scheduledMinutes,
      workedMinutes,
      balanceMinutes: workedMinutes - scheduledMinutes,
    } as const;
  },

  recoverySuggestions(
    startTime: string,
    scheduledMinutes: number,
    scheduleBreakMinutes: number,
  ) {
    assertMinutes(scheduledMinutes, "Los minutos esperados");
    assertMinutes(scheduleBreakMinutes, "El descanso configurado");
    const startMinutes = clockToMinutes(startTime);
    const breakMinutes = Math.max(
      scheduleBreakMinutes,
      DEFAULT_RECOVERY_BREAK_MINUTES,
    );

    return [60, 120].flatMap((balanceMinutes) => {
      const endMinutes =
        startMinutes + scheduledMinutes + breakMinutes + balanceMinutes;
      if (endMinutes >= 24 * 60) return [];
      return [
        {
          endTime: minutesToClock(endMinutes),
          balanceMinutes,
        },
      ];
    });
  },

  accumulate<T>(
    days: readonly AccumulatedDay<T>[],
    initialBalanceMinutes = 0,
  ): BalanceSummary<T> {
    assertMinutes(initialBalanceMinutes, "El saldo inicial", true);

    let accumulatedBalanceMinutes = initialBalanceMinutes;
    let recoveredMinutes = 0;
    const accumulatedDays: AccumulatedBalanceDay<T>[] = [];

    for (const current of days) {
      assertMinutes(current.balanceMinutes, "El saldo diario", true);
      const debtBefore = Math.max(0, -accumulatedBalanceMinutes);
      const recoveredToday = Math.min(
        debtBefore,
        Math.max(0, current.balanceMinutes),
      );

      accumulatedBalanceMinutes += current.balanceMinutes;
      recoveredMinutes += recoveredToday;
      accumulatedDays.push({
        day: current.day,
        balanceMinutes: current.balanceMinutes,
        recoveredMinutes: recoveredToday,
        accumulatedBalanceMinutes,
        debtMinutes: Math.max(0, -accumulatedBalanceMinutes),
        creditMinutes: Math.max(0, accumulatedBalanceMinutes),
      });
    }

    return {
      days: accumulatedDays,
      balanceMinutes: accumulatedBalanceMinutes,
      debtMinutes: Math.max(0, -accumulatedBalanceMinutes),
      creditMinutes: Math.max(0, accumulatedBalanceMinutes),
      recoveredMinutes,
    };
  },
} as const;
