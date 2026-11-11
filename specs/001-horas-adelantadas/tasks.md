# Tareas de Spec 001 — Horas adelantadas y saldo a favor

Estado de las tareas — aprobadas
Referencias — [spec.md](spec.md) y [plan.md](plan.md), con especificación, clarificación y plan aprobados el 11 de noviembre de 2026.

## Condiciones de ejecución

Cada tarea comprende aproximadamente 20–30 minutos y devuelve el control al coordinador.
En cambios de lógica se escribe primero una prueba del comportamiento, se comprueba su
fallo y se implementa dentro de esa misma tarea hasta verificarla. Cada tarea registra
sus resultados ejecutados o pendientes. Los comandos previstos se ejecutan durante su implementación.
La base remota permanece en lectura. Toda escritura de preparación o integración usa
exclusivamente una base aislada autorizada, migrada y señalada por `TEST_DATABASE_URL`.

## Secuencia

- [x] **T1. Calcular el movimiento común de saldo y reutilizarlo al acumular.** RF-1, RF-3, RF-4, RF-5, RF-7.
  - Dependencias — ninguna.
  - Archivos — `src/domain/time-balance-service.ts`, `tests/unit/time-balance-service.test.ts`.
  - Hecho cuando `calculateBalanceMovement` distingue adicional, recuperado, adelanto generado, crédito usado, faltante descubierto y cierre, y `accumulate` conserva su firma y resultados previos usando ese cálculo.
  - Comprobación prevista — `pnpm exec vitest run tests/unit/time-balance-service.test.ts`, incluidos −60/+120, +120/−60, +30/−90, cero y minutos enteros. Entorno unitario sin BD. Esperado — casos nuevos y existentes aplicables en verde.
  - Evidencia — 11 de noviembre de 2026. Primero fallaron 12 casos nuevos por ausencia del movimiento y del desglose diario; después se verificó en rojo un caso adicional de recuperación acumulada insegura. Implementado `TimeBalanceService.calculateBalanceMovement` y reutilizado en `accumulate`, con campos aditivos y rechazo de enteros inseguros. `pnpm exec vitest run tests/unit` pasó 29/29 pruebas, incluidas 26 del archivo de saldo. ESLint focalizado, `pnpm exec tsc --noEmit`, Prettier y `git diff --check` pasaron. Entorno sin BD. La presentación de estos RF permanece en sus tareas posteriores.

- [x] **T2. Extraer el cálculo puro de días y apertura con referencia explícita.** RF-3, RF-4, RF-5, RF-6, RF-7, RF-8.
  - Dependencias — T1.
  - Archivos — nuevo `src/domain/balance-range-service.ts` y nuevo `tests/unit/balance-range-service.test.ts`.
  - Hecho cuando un mismo origen y `now` producen apertura, días visibles y cierre coherentes entre ventanas, conservando fotografías, aportes heredados y la regla de días finalizados.
  - Comprobación prevista — `pnpm exec vitest run tests/unit/balance-range-service.test.ts`, con cruce de mes/año, corrección histórica, esperado cero con trabajo real, futuro y medianoche local. Entorno unitario sin BD. Esperado — todos los casos nuevos en verde.
  - Evidencia — 11 de noviembre de 2026. La primera ejecución falló al importar el módulo aún inexistente. Tras implementarlo pasaron sus 18 pruebas y `pnpm exec vitest run tests/unit` pasó 47/47. El caso de ventana reducida obtiene apertura +120 y cierre +60, igual al cierre de la ventana completa; corregir la jornada previa reduce ese cierre a cero. Cubiertos cambio de año, feriados, fotografías, esperado cero con trabajo real, permiso explicativo, alta, futuro, límites de cierre, medianoche local y horario de verano. ESLint focalizado, `pnpm exec tsc --noEmit`, Prettier y `git diff --check` pasaron. Entorno sin BD. La conexión a las consultas del servidor corresponde a T3.

- [x] **T3. Conectar las consultas de saldo con arrastre y saldo anterior a fecha.** RF-2, RF-4, RF-5, RF-6, RF-7, RF-8.
  - Dependencias — T2.
  - Archivos — `src/server/services/balance-query-service.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando las llamadas actuales conservan contrato, las lecturas cargan el historial hasta el corte y `getBalanceBeforeDate` excluye íntegramente la fecha evaluada y las posteriores, aceptando `now` y cliente transaccional.
  - Comprobación prevista — añadir primero casos integrados focalizados y ejecutar `pnpm exec vitest run tests/integration/application-flows.test.ts -t "saldo con apertura"`. Entorno BD aislada autorizada. Esperado — consultas de ventanas diferentes con idéntico cierre y sin depender del reloj real.
  - Evidencia — 11 de noviembre de 2026. Los cinco casos nuevos fallaron primero por apertura y helper ausentes, lector ignorado e instante real. Tras conectar el rango puro, los cinco pasaron con `-t "saldo con apertura"` en `control_horas_test`, PostgreSQL local aislado; los diez casos previos quedaron omitidos por ese filtro. Apertura +120 y cierre +60 coinciden entre ventanas; saldo anterior a fechas sucesivas produce 0, +120 y +60; el lector recibido funciona con pool de una conexión sin modificar filas. Pasaron 47/47 unitarias, ESLint focalizado, TypeScript, Prettier y `git diff --check`. La ejecución integrada completa dio 12 aprobadas y los mismos tres fallos previos de descanso y reloj, pendientes de 002:T9 y 001:T9 respectivamente, sin regresiones adicionales. Las credenciales de prueba se obtuvieron del contenedor sin imprimirlas y el entorno de prueba sustituyó ambas URL solo en el proceso hijo; no se usó la base remota.

- [x] **T4. Exponer el contexto público de saldo previo para el registro.** RF-1, RF-3, RF-7.
  - Dependencias — T3.
  - Archivos — `src/server/services/daily-entry-service.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando el contexto de lectura añade saldo previo, zona y referencia sin retirar campos, excluye el aporte del día editado y limita lo entregado al cliente a campos públicos necesarios.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "contexto de adelanto"`. Entorno BD aislada autorizada. Esperado — ayer +30 y hoy +60 entregan saldo previo +30, sin hashes ni contexto interno en el contrato público.
  - Evidencia — 11 de noviembre de 2026. Los tres casos de contexto fallaron primero por falta de metadata/saldo y por ignorar el lector recibido. Tras añadir `balanceBeforeDateMinutes`, `calculatedAt` y `timezone` a `view`, conservando sus campos y `existingEntry`, pasaron 3/3 con el filtro `contexto de adelanto` en la base local aislada. El fixture devuelve +30 previos y conserva +60 del día editado sin sumarlo al saldo anterior. La proyección pública excluye hashes, sesiones y el usuario interno, y el lector recibido conserva usuario y jornadas sin escritura. Pasaron 47 unitarias, TypeScript, Prettier y `git diff --check`. ESLint focalizado terminó sin errores y mantuvo el aviso previo de `today` sin uso. La integración completa terminó con 15 aprobadas y los tres fallos previos de descanso/reloj, sin regresiones nuevas. Las URL de prueba se fijaron solo en el proceso hijo contra `control_horas_test`; no se contactó la base remota.

- [x] **T5. Mostrar crédito disponible y cierre con apertura en resumen e historial.** RF-1, RF-2, RF-6.
  - Dependencias — T3.
  - Archivos — `src/app/(protected)/dashboard/page.tsx`, `src/app/(protected)/historial/page.tsx`.
  - Hecho cuando deuda, adelanto y cero son distinguibles con horas/minutos y corte, y la meta semanal permanece diferenciada del saldo histórico sin cambiar la identidad visual existente.
  - Comprobación prevista — `npm run typecheck` y revisión de resumen/historial con fixtures de crédito, deuda y cero. Entorno navegador local aislado y terminal sin BD de escritura remota. Esperado — cierre coincidente, lectura a 375 px y navegación por teclado.
  - Evidencia — 11 de noviembre de 2026. Se sustituyó la tarjeta ambigua “Deuda acumulada” por un estado que diferencia “Horas adelantadas”, “Horas por recuperar” y saldo al día, preservando “Meta semanal” por separado. El historial ahora presenta saldo acumulado al cierre, adelanto y deuda junto al calendario y mantiene celdas diarias. En `control_horas_test` se validó usuario demo con saldo de −20 h; el navegador a 375 px mostró dashboard e historial con −20 h y desglose deuda 20 h/adelanto 0. La sesión se creó solo en entorno aislado. `pnpm exec vitest run tests/integration/application-flows.test.ts -t "saldo con apertura|contexto de adelanto"` pasó 8/8 aplicables, 10 omitidas; `pnpm exec vitest run tests/unit` pasó 47/47; TypeScript y Prettier pasaron. La vista del navegador pudo mostrar estados de deuda; fixtures de cero y crédito no se probaron visualmente.

- [ ] **T6. Desglosar recuperación y adelanto en la propuesta de registro.** RF-1, RF-3, RF-7.
  - Dependencias — T1 y T4.
  - Archivos — `src/components/registration/daily-entry-form.tsx`.
  - Hecho cuando el formulario usa el movimiento común con el saldo anterior a la fecha y distingue adicional estimado, recuperación estimada y adelanto estimado sin duplicar la jornada editada.
  - Comprobación prevista — `npm run typecheck` y cambiar la salida de fixtures con deuda, saldo cero y crédito. Entorno navegador local aislado. Esperado — el positivo sin deuda muestra adelanto y la propuesta se identifica como estimación antes de confirmar.
  - Evidencia — pendiente de valores y mensajes comprobados.

- [ ] **T7. Unificar los datos y la vista previa de reportes con el saldo común.** RF-1, RF-4, RF-6, RF-7.
  - Dependencias — T3.
  - Archivos — `src/server/export/report-data.ts`, `src/components/forms/report-form.tsx`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando apertura y cierre coinciden con las consultas del mismo corte, los totales visibles siguen siendo del período y el reporte conserva `pendingMinutes` como faltante diario, separado de la deuda final.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "reporte con apertura"` y vista previa local. Entorno BD aislada autorizada. Esperado — un crédito de otro mes permanece en el cierre sin inflar trabajado del período.
  - Evidencia — pendiente de campos comparados y resultado de prueba.

- [ ] **T8. Reflejar el desglose de adicionales en Excel y PDF.** RF-1, RF-6.
  - Dependencias — T7.
  - Archivos — `src/server/export/excel.ts`, `src/server/export/pdf.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando los archivos exportados muestran adicionales, recuperación y adelanto al cierre con los mismos valores del reporte normalizado, manteniendo los datos ya exportados.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "exportaciones de adelanto"` y abrir los dos resultados de prueba. Entorno BD aislada autorizada y archivos de fixture sin datos reales. Esperado — cifras coincidentes y contenido legible.
  - Evidencia — pendiente de prueba y comprobación de contenido de cada formato.

- [ ] **T9. Fijar el instante de referencia de los flujos integrados de saldo.** RF-4, RF-6, RF-7, RF-8.
  - Dependencias — T3 y T7.
  - Archivos — `tests/integration/application-flows.test.ts` y ajustes mínimos de propagación de `now` en los servicios ya previstos, si la prueba detecta una omisión.
  - Hecho cuando el caso del dashboard con datos de julio evalúa una referencia explícita, y se verifica la coincidencia de saldo tras una corrección sin depender de la fecha de ejecución.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "dashboard|saldo con apertura|reporte con apertura"`. Entorno BD aislada autorizada. Esperado — saldo determinista; los fallos previos de descanso se documentan y se resuelven en 002, sin presentarlos como éxitos.
  - Evidencia — pendiente de referencia utilizada, línea base conservada y resultados.

- [ ] **T10. Comprobar el recorrido funcional de adelanto y sus contratos de entrega.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8.
  - Dependencias — T5, T6, T8 y T9.
  - Archivos — los archivos funcionales y de prueba de T1–T9, solo para corregir incumplimientos de esta spec que revele la comprobación.
  - Hecho cuando todos los RF tienen evidencia de tarea y las comprobaciones del alcance pasan. Un fallo o una limitación que afecte a esos RF mantiene la tarea pendiente. La validación formal y el cierre conservan sus aprobaciones correspondientes.
  - Comprobación prevista — `npm run test:unit`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run security:secrets` y recorrido local de resumen, registro e historial a 375 px y escritorio. Entorno unitario y navegador local aislado. Esperado — contratos compatibles, foco y mensajes comprensibles, sin secretos en salidas.
  - Evidencia — pendiente de comandos, resultados y observaciones de UI por RF.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                        |
| ---------------------------------- | ------------------------------ | ---------- | --------------------------------------- |
| Tareas e inicio de implementación  | Aprobada por el usuario        | 2026-11-11 | Implementación de las tareas de 001–004 |
| Implementación y paso a validación | Pendiente                      | —          | —                                       |

## Entrega

Cinco tareas completadas y cinco pendientes. Las pruebas de lógica forman parte de su tarea de implementación.
El resultado de T10 se presenta para aprobar el paso a validación formal.
Registrar por tarea archivos, RF, comandos, entorno, resultados y limitaciones.
