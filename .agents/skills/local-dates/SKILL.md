---
name: local-dates
description: Implementar o revisar fechas civiles, zonas horarias, horarios y saldos por día en Control de Horas, reutilizando Luxon y las conversiones de PostgreSQL DATE del proyecto.
---

# Fechas locales de Control de Horas

Lee `src/lib/time.ts`, `src/domain/time-balance-service.ts` y `docs/CALCULATION.md`.

- Distingue instantes UTC, fechas civiles `AAAA-MM-DD` y horas locales de horario.
- Obtén el día de una persona con `dateInTimezone(instant, user.timezone)`.
  El día UTC o el del navegador puede ser distinto del día del usuario.
- Conserva `civilDate` y `toIsoDate` como adaptadores de PostgreSQL DATE.
  Su representación UTC es intencional. No los uses para obtener el día local de un timestamp.
- Construye entrada y salida con `localDateTime` o `scheduleDateTime` y la zona de la persona.
  Las columnas TIME del horario se leen con sus partes UTC, según las utilidades existentes.
- Itera fechas con Luxon y operaciones de calendario. Un día civil puede durar 23 o 25 horas.
- En cálculos temporales nuevos, recibe un instante o fecha de referencia explícita.
  Fija esa referencia en pruebas y conserva las firmas que usan los llamadores existentes.
- Aplica las reglas aprobadas sobre futuro, jornada en curso, inicio del cómputo y feriados.
  Los feriados actuales están en `src/lib/holidays.ts` y cubren únicamente 2026 y 2027.
- Conserva los minutos esperados de registros históricos y comprueba cambios de horario.

Verifica los casos relevantes de la spec, incluyendo medianoche en la zona de la persona,
fin de mes o año, horario de verano si la zona lo usa, registros anteriores al alta,
fechas futuras, feriados y rangos con saldo anterior. Indica casos comprobados y pendientes.
