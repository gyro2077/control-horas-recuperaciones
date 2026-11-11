export type IsoDate = `${number}-${number}-${number}`;

export type AccumulatedDay<T = unknown> = Readonly<{
  day: T;
  balanceMinutes: number;
}>;

export type BalanceMovement = Readonly<{
  extraMinutes: number;
  recoveredMinutes: number;
  creditGeneratedMinutes: number;
  creditUsedMinutes: number;
  uncoveredMinutes: number;
  accumulatedBalanceMinutes: number;
  debtMinutes: number;
  creditMinutes: number;
}>;

export type AccumulatedBalanceDay<T = unknown> = BalanceMovement &
  Readonly<{
    day: T;
    balanceMinutes: number;
  }>;

export type BalanceSummary<T = unknown> = Readonly<{
  days: readonly AccumulatedBalanceDay<T>[];
  balanceMinutes: number;
  debtMinutes: number;
  creditMinutes: number;
  recoveredMinutes: number;
}>;

export type EffectiveInterval = Readonly<{
  startTime: string;
  endTime: string;
  expectedMinutes: number;
  scheduledBreakMinutes: number;
  effectiveBreakMinutes: number;
  workedMinutes: number;
  balanceMinutes: number;
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
const DEFAULT_RECOVERY_BREAK_MINUTES = 30;

function assertMinutes(value: number, field: string, allowNegative = false) {
  if (!Number.isSafeInteger(value) || (!allowNegative && value < 0)) {
    throw new TimeBalanceError(
      "INVALID_MINUTES",
      `${field} debe expresarse en minutos enteros válidos.`,
    );
  }
}

function calculateBalanceMovement(
  previousBalanceMinutes: number,
  balanceMinutes: number,
): BalanceMovement {
  assertMinutes(previousBalanceMinutes, "El saldo previo", true);
  assertMinutes(balanceMinutes, "El saldo diario", true);

  const accumulatedBalanceMinutes = previousBalanceMinutes + balanceMinutes;
  assertMinutes(accumulatedBalanceMinutes, "El saldo acumulado", true);

  const extraMinutes = Math.max(0, balanceMinutes);
  const recoveredMinutes = Math.min(
    Math.max(0, -previousBalanceMinutes),
    extraMinutes,
  );
  const missingMinutes = Math.max(0, -balanceMinutes);
  const creditUsedMinutes = Math.min(
    Math.max(0, previousBalanceMinutes),
    missingMinutes,
  );

  return {
    extraMinutes,
    recoveredMinutes,
    creditGeneratedMinutes: extraMinutes - recoveredMinutes,
    creditUsedMinutes,
    uncoveredMinutes: missingMinutes - creditUsedMinutes,
    accumulatedBalanceMinutes,
    creditMinutes: Math.max(0, accumulatedBalanceMinutes),
    debtMinutes: Math.max(0, -accumulatedBalanceMinutes),
  };
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
  calculateBalanceMovement,

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

  calculateWorkedMinutesWithBreak(
    start: Date,
    end: Date,
    effectiveBreakMinutes: number,
  ): number {
    return this.calculateWorkedMinutes(start, end, effectiveBreakMinutes);
  },

  calculateEffectiveInterval(
    startTime: string,
    endTime: string,
    expectedMinutes: number,
    scheduledBreakMinutes: number,
    effectiveBreakMinutes: number,
  ): EffectiveInterval {
    assertMinutes(expectedMinutes, "Los minutos esperados");
    assertMinutes(scheduledBreakMinutes, "El descanso programado");
    assertMinutes(effectiveBreakMinutes, "El descanso efectivo");
    const start = assertHalfHour(startTime);
    const end = assertHalfHour(endTime);
    const grossMinutes = end - start;
    if (grossMinutes <= 0 || effectiveBreakMinutes >= grossMinutes) {
      throw new TimeBalanceError(
        "INVALID_INTERVAL",
        "La salida debe ser posterior a la entrada y el descanso menor que la jornada.",
      );
    }
    const workedMinutes = grossMinutes - effectiveBreakMinutes;
    return {
      startTime,
      endTime,
      expectedMinutes,
      scheduledBreakMinutes,
      effectiveBreakMinutes,
      workedMinutes,
      balanceMinutes: workedMinutes - expectedMinutes,
    };
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

    const suggestions = [];
    for (let balanceMinutes = 30; balanceMinutes <= 300; balanceMinutes += 30) {
      const endMinutes =
        startMinutes + scheduledMinutes + breakMinutes + balanceMinutes;
      if (endMinutes >= 24 * 60) break;
      suggestions.push({
        endTime: minutesToClock(endMinutes),
        balanceMinutes,
      });
    }
    return suggestions;
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
      const movement = calculateBalanceMovement(
        accumulatedBalanceMinutes,
        current.balanceMinutes,
      );

      accumulatedBalanceMinutes = movement.accumulatedBalanceMinutes;
      recoveredMinutes += movement.recoveredMinutes;
      assertMinutes(recoveredMinutes, "La recuperación acumulada");
      accumulatedDays.push({
        day: current.day,
        balanceMinutes: current.balanceMinutes,
        ...movement,
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
