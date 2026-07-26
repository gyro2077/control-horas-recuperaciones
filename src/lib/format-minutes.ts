export function formatMinutes(totalMinutes: number): string {
  if (!Number.isSafeInteger(totalMinutes)) {
    throw new TypeError("La duración debe ser un número entero de minutos.");
  }

  const sign = totalMinutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  if (hours === 0) return `${sign}${minutes} min`;
  if (minutes === 0) return `${sign}${hours} h`;
  return `${sign}${hours} h ${minutes} min`;
}

export function balanceMessage(balanceMinutes: number): string {
  if (balanceMinutes === 0) return "Vas al día";
  if (balanceMinutes < 0) {
    return `Tienes una deuda acumulada de ${formatMinutes(-balanceMinutes)}`;
  }
  return `Tienes ${formatMinutes(balanceMinutes)} a favor`;
}
