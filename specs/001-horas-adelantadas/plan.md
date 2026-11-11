# Plan de Spec 001 — Horas adelantadas y saldo a favor

Estado del plan — aprobado
Referencia — [spec.md](spec.md), especificación y clarificación aprobadas el 11 de noviembre de 2026.

## Alcance y secuencia

Implementar primero el saldo común que consumen las specs 002 y 003.
Mantener una sola cuenta derivada de jornadas y conservar el estilo actual hasta la spec 005.
Este plan prepara contratos aditivos para compensación sin persistir movimientos nuevos.

## Archivos y responsabilidades

| Archivo                                                                                          | Cambio y responsabilidad                                                             | RF cubiertos |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------ |
| `src/domain/time-balance-service.ts`                                                             | Añadir `calculateBalanceMovement` y reutilizarlo en `accumulate`                     | 1, 3–5, 7    |
| `src/domain/balance-range-service.ts` — nuevo                                                    | Resolver días y acumulación desde datos normalizados y un instante explícito         | 3–8          |
| `src/server/services/balance-query-service.ts`                                                   | Cargar el historial necesario, adaptar resultados y exponer saldo previo a fecha     | 2, 4–8       |
| `src/server/services/daily-entry-service.ts`                                                     | Añadir saldo previo y referencia al contexto de lectura usado por el registro        | 1, 3         |
| `src/server/export/report-data.ts`                                                               | Consumir arrastre y cierre comunes y conservar el significado de totales del período | 1, 6–7       |
| `src/app/(protected)/dashboard/page.tsx`                                                         | Mostrar adelanto, deuda y saldo cero sin ocultarlos tras la meta semanal             | 2            |
| `src/app/(protected)/historial/page.tsx`                                                         | Mostrar cierre acumulado con arrastre y movimientos diarios identificables           | 1, 6         |
| `src/components/registration/daily-entry-form.tsx`                                               | Desglosar el positivo estimado entre recuperación y adelanto                         | 1, 3         |
| `src/components/forms/report-form.tsx`, `src/server/export/excel.ts`, `src/server/export/pdf.ts` | Etiquetas y detalle coherentes de adicionales, recuperados y adelanto al cierre      | 1, 6         |
| `tests/unit/time-balance-service.test.ts`                                                        | Movimientos de deuda, crédito, consumo y conservación de minutos                     | 3–5          |
| `tests/unit/balance-range-service.test.ts` — nuevo                                               | Arrastre, reloj, ventanas y corrección sin persistencia                              | 4, 6–8       |
| `tests/integration/application-flows.test.ts`                                                    | Consistencia de consultas y reportes sobre datos aislados y reloj controlado         | 1–8          |

## Contratos comunes

`calculateBalanceMovement(previousBalanceMinutes, balanceMinutes)` será una función pura.
Devuelve `extraMinutes`, `recoveredMinutes`, `creditGeneratedMinutes`, `creditUsedMinutes`,
`uncoveredMinutes`, `accumulatedBalanceMinutes`, `creditMinutes` y `debtMinutes`.
Todos los campos son minutos enteros. `uncoveredMinutes` describe el faltante diario
no cubierto por crédito previo y se distingue de la deuda acumulada final.
`accumulate(days, initialBalanceMinutes = 0)` conserva firma y campos actuales y añade
el desglose a cada día, calculándolo con esa misma función.

`calculateBalanceRangeFromData({ createdAt, timezone, scheduleDays, entries, from, to, now })`
vivirá en el módulo puro nuevo, con datos estructurales sin dependencias de persistencia.
Devuelve días visibles, saldo de apertura, saldo de cierre y desglose por día.
Las entradas incluyen fechas civiles, minutos guardados, horas, descanso y permiso explicativo.
`now` es obligatorio en este cálculo y se mantiene idéntico para todos los días evaluados.

`calculateBalanceRange(userId, timezone, from, to, options?)` conserva los cuatro argumentos
actuales. `options` permite `now` y un cliente de lectura compatible con una transacción.
Conserva `user`, `days`, `balanceMinutes`, `creditMinutes`, `debtMinutes` y `recoveredMinutes`.
Añade `initialBalanceMinutes`, `asOfDate`, `calculatedAt` y el desglose diario.
Los totales de trabajado, esperado, adicional y recuperado de una ventana siguen siendo
del período visible. El saldo de cierre incluye el arrastre de fechas anteriores.

`getBalanceBeforeDate(userId, date, { now, client? })` obtiene el saldo firmado hasta
el día civil inmediatamente anterior y excluye todos los registros de la fecha evaluada.
La zona se toma de la persona consultada. Se reutilizará en confirmación y simulación.
`getDashboard(userId, timezone, now = new Date())` y
`buildReportData(actor, userId, from, to, now = new Date())` conservan sus llamadas actuales.
Los valores predeterminados se capturan en el límite servidor, nunca dentro del cálculo puro.

## Lógica y algoritmo

```text
extra = max(0, saldoDiario)
recuperado = min(max(0, -saldoPrevio), extra)
adelantoGenerado = extra - recuperado
faltante = max(0, -saldoDiario)
creditoUsado = min(max(0, saldoPrevio), faltante)
faltanteDescubierto = faltante - creditoUsado
saldoFinal = saldoPrevio + saldoDiario
creditoFinal = max(0, saldoFinal)
deudaFinal = max(0, -saldoFinal)
```

La carga obtiene la persona, su horario y todas sus jornadas hasta `to`, sin
limitarse al comienzo de la ventana. El cálculo comienza en el menor valor entre
fecha de alta local, primera jornada registrada y `from`, y recorre fechas civiles.
Un mapa por fecha evita búsquedas repetidas de registros dentro del recorrido.

```text
para cada fecha, en orden:
  esperado = fotografía del registro si existe
             o regla actual para días sin registro, alta, horario y feriado
  finalizado = regla vigente evaluada con now
  saldoDiario = trabajado - esperado si finalizado; en otro caso, 0
  movimiento = calculateBalanceMovement(saldoPrevio, saldoDiario)
  guardar apertura antes de from y días de la ventana
  saldoPrevio = movimiento.saldoFinal
devolver apertura, días visibles y cierre con sus movimientos
```

Los días futuros nunca consolidan saldo. Un registro confirmado actual participa
según la regla vigente. El día actual sin registro sigue en curso hasta el cierre
de su horario. Los registros anteriores al alta se conservan si existen. Una jornada heredada con
esperado cero y trabajado positivo conserva su aporte al saldo, aunque el consejo
de salida de 003 la trate como un día sin jornada esperada.
Para días sin registro se conserva el criterio actual de horario y feriados,
sin introducir historial de asignaciones de horarios dentro de este cambio.

## Interfaz

Mostrar “Horas adelantadas disponibles”, deuda y fecha de corte en el resumen.
Mantener la meta semanal como métrica de trabajo de esa semana, sin confundirla
con el crédito acumulado de períodos anteriores.
En el registro, usar `balanceBeforeDateMinutes` del contexto de lectura para presentar
adicionales estimados, recuperación estimada y adelanto estimado antes de confirmar.
Si se edita el día, su aporte confirmado no se suma a ese saldo previo.
Los reportes y el historial muestran el mismo cierre para una fecha común.
Los mensajes distinguen texto, signo y unidad, y no dependen solo del color.
Los componentes reutilizan clases y navegación actuales. La identidad visual pertenece a 004–005.

## Decisiones técnicas

- Un saldo firmado y movimientos derivados preservan los datos existentes y evitan una segunda bolsa persistida.
  Se descarta guardar crédito y consumos en tablas nuevas por riesgo de desincronización.
- Una función pura de rango concentra la regla hoy repetida en consultas y permite fijar `now` en pruebas.
  Se descarta calcular saldos desde cada ventana sin apertura porque pierde crédito y deuda anteriores.
- El contexto de lectura añade saldo previo, zona y referencia a `getScheduleForDate.view`
  sin retirar campos actuales. Las reglas de registro se unifican en la spec 002.
- La consulta cargará una fotografía coherente de datos con un solo lector transaccional cuando
  necesite varias lecturas. El servicio podrá recibir el cliente de la transacción de la spec 002.
- El ledger se recalcula al leer, sin actualizar saldos históricos al corregir una jornada.

## Datos y compatibilidad

Se conservan `scheduledMinutes` y `balanceMinutes` almacenados y los contratos HTTP existentes.
La corrección administrativa existente sigue modificando únicamente la jornada indicada.
Su efecto posterior se deriva en la siguiente lectura. La consistencia de escritura y reintentos
se implementa en el plan 002, sin ejecutar migraciones ni crear nuevas columnas.
Los permisos siguen siendo explicación del evento, sin un descuento adicional de saldo.
Los consumidores de exportación conservan sus campos actuales y reciben campos aditivos.
Los adaptadores públicos seleccionan solo los campos necesarios del resultado interno.
El objeto `user` completo de un helper nunca se serializa ni se pasa a props cliente.
`pendingMinutes` seguirá significando minutos diarios no trabajados, mientras la deuda al cierre
seguirá siendo el valor neto acumulado. No se renombrará esa deuda como suma de faltantes.

## Estrategia de verificación

| RF  | Prueba o revisión                                                                 | Comprobación prevista                               | Entorno                            |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| 1   | Positivo con deuda, sin deuda y cruzando cero; texto estimado frente a confirmado | Vitest y formulario con los mismos datos            | Unitario y navegador local aislado |
| 2   | Crédito, deuda y cero visibles con unidades y corte                               | Resumen a 375 px, escritorio y teclado              | Navegador local aislado            |
| 3   | −60 +120 produce 60 recuperados y 60 de crédito                                   | `npm run test:unit`                                 | Sin BD                             |
| 4   | Crédito conserva valor entre semana, mes y año                                    | Rango puro con `now` fijo                           | Sin BD                             |
| 5   | +120 −60 y +30 −90 producen crédito 60 y deuda 60 respectivamente                 | Casos de movimiento y acumulación                   | Sin BD                             |
| 6   | Mismo cierre consultado con ventanas distintas y en reportes                      | Pruebas puras y flujo integrado con apertura previa | BD de prueba aislada autorizada    |
| 7   | Corregir +120 a +60 cambia el cierre una sola vez                                 | Rango puro y corrección integrada de una jornada    | Sin BD y BD aislada                |
| 8   | Futuro, actual en curso, finalizado y zonas alrededor de medianoche               | `now` fijo y fechas civiles explícitas              | Sin BD                             |

Los comandos de cierre previstos son `npm run lint`, `npm run typecheck`,
`npm run test:unit`, `npm run build` y `npm run security:secrets`.
La integración usa `npm run test:integration` únicamente con `TEST_DATABASE_URL`
de una base aislada autorizada y migrada. La base remota mantiene solo lectura.
Antes de modificar tests se conserva la línea base de 15 unitarios y tres fallos integrados.
El caso integrado del dashboard pasará un instante fijo al servicio, evitando que los
días transcurridos desde julio alteren su deuda. Las expectativas de descanso se revisan
en 002 según la regla aprobada y los datos de cada fixture, sin ocultar fallos ajenos.
Esta fase solo redacta el plan. Ninguna de estas comprobaciones se ha ejecutado por este plan.

## Aprobación

Aprobado por el usuario el 11 de noviembre de 2026 mediante «apruebo»,
con alcance a los cinco planes presentados y su desglose en tareas.
La elección visual y la implementación conservan sus aprobaciones correspondientes.
