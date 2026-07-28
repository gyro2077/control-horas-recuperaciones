/**
 * Feriados nacionales de Ecuador para 2026 y 2027.
 * Se incluyen las fechas trasladadas según la Ley de Feriados cuando caen en fin de semana.
 */
export const ECUADOR_HOLIDAYS = new Set([
  // --- 2026 ---
  "2026-01-01", // Año Nuevo (Jueves)
  "2026-02-16", // Carnaval (Lunes)
  "2026-02-17", // Carnaval (Martes)
  "2026-04-03", // Viernes Santo
  "2026-05-01", // Día del Trabajo (Viernes)
  "2026-05-25", // Batalla de Pichincha (Cae domingo 24, se traslada al Lunes 25)
  "2026-08-10", // Primer Grito de Independencia (Lunes)
  "2026-10-09", // Independencia de Guayaquil (Viernes)
  "2026-11-02", // Día de los Difuntos (Lunes)
  "2026-11-03", // Independencia de Cuenca (Martes)
  "2026-12-25", // Navidad (Viernes)

  // --- 2027 ---
  "2027-01-01", // Año Nuevo (Viernes)
  "2027-02-08", // Carnaval (Lunes)
  "2027-02-09", // Carnaval (Martes)
  "2027-03-26", // Viernes Santo
  "2027-04-30", // Día del Trabajo (Cae Sábado 1, se traslada al Viernes 30 de abril)
  "2027-05-24", // Batalla de Pichincha (Lunes)
  "2027-08-09", // Primer Grito de Independencia (Cae Martes 10, se traslada al Lunes 9)
  "2027-10-08", // Independencia de Guayaquil (Cae Sábado 9, se traslada al Viernes 8)
  "2027-11-02", // Día de los Difuntos (Martes)
  "2027-11-03", // Independencia de Cuenca (Miércoles)
  "2027-12-24", // Navidad (Cae Sábado 25, se traslada al Viernes 24)
]);

export function isEcuadorHoliday(dateIso: string): boolean {
  return ECUADOR_HOLIDAYS.has(dateIso);
}
