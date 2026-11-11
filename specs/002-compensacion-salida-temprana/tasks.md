# Tareas de Spec 002 — Compensación al salir temprano

Estado de las tareas — aprobadas
Referencias — [spec.md](spec.md) y [plan.md](plan.md), con especificación, clarificación y plan aprobados el 11 de noviembre de 2026.

## Condiciones de ejecución

Las tareas se estiman en 20–30 minutos y se ejecutan individualmente. Las pruebas
de lógica se escriben primero y pasan dentro de la misma tarea; nunca se entrega
una tarea de pruebas rojas esperando que otra implemente el comportamiento.
Los comandos son previstos. Las escrituras, incluido login de preparación, usan
solo una base aislada autorizada con `TEST_DATABASE_URL`; la base remota sigue en lectura.
Las referencias `001:Tn` corresponden a [las tareas de 001](../001-horas-adelantadas/tasks.md).

## Secuencia

- [x] **T1. Calcular intervalos con descanso efectivo y validación de horas cambiadas.** RF-5, RF-9, RF-10, RF-11.
  - Dependencias — 001:T1.
  - Archivos — `src/domain/time-balance-service.ts`, `tests/unit/time-balance-service.test.ts`.
  - Hecho cuando el intervalo usa descanso efectivo explícito, rechaza descansos inválidos y valida franjas/máximo 20:00 solo en horas nuevas o modificadas, conservando las horas originales no modificadas.
  - Comprobación prevista — `pnpm exec vitest run tests/unit/time-balance-service.test.ts`, con descanso 0/30/60, 08:15–20:15 heredado, salida modificada 20:00 y nueva 20:30 inválida. Entorno sin BD. Esperado — tiempos y minutos reales correctos, sin redondeo del legado.
  - Evidencia — 11 de noviembre de 2026. Se añadieron pruebas primero: fallaron 2/2 por no existir la función. `calculateEffectiveInterval` ahora calcula minutos netos con el descanso realmente tomado y preserva el descanso programado para referencia; rechaza salida no posterior, descanso inválido o que cubre todo el tramo. 0/30/60 minutos efectivos se verificaron aparte. `pnpm exec vitest run tests/unit` pasó 52/52; TypeScript, Prettier y `git diff --check` pasaron. Entorno sin BD. La validación de franjas heredadas y máximo 20:00 sigue pendiente en tareas posteriores.

- [x] **T2. Resolver la jornada efectiva y el contexto de edición desde su fotografía.** RF-1, RF-5, RF-7, RF-9, RF-11.
  - Dependencias — T1, 001:T3 y 001:T4.
  - Archivos — `src/server/services/daily-entry-service.ts`, `src/app/api/daily-entries/schedule/route.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando un registro existente conserva esperado, timestamps y descanso aunque cambie el horario actual; una jornada nueva usa el horario y descanso configurados, y el DTO público incluye versión y saldo previo sin exponer el usuario completo.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "contexto de compensación"`. Entorno BD aislada autorizada. Esperado — fotografía y horarios originales intactos, saldo previo correcto y errores concretos de datos faltantes.
  - Evidencia — 11 de noviembre de 2026. La consulta ahora prioriza `scheduledMinutes` y `breakMinutes` fotografiados en el registro existente para su contexto de edición, incluye `updatedAt` como `version` y mantiene la proyección pública acotada. La prueba integrada primero falló porque regresaba los 360/0 del horario actual ante la jornada guardada 420/30; tras implementarlo pasó con inicio y salida local 08:30–16:30 y saldo previo de 120 min. `TEST_DATABASE_URL` en `control_horas_test`; `pnpm exec vitest run tests/integration/application-flows.test.ts -t "fotografía de la jornada existente"` pasó 1/1 y TypeScript/Prettier/diff-check pasaron. No se modificó esquema ni base remota. Horario nuevo y otros casos siguen en tareas siguientes.

- [x] **T3. Incorporar la barrera y los reintentos al núcleo de confirmación.** RF-1, RF-2, RF-6, RF-7.
  - Dependencias — T2 y 001:T3.
  - Archivos — `src/server/services/daily-entry-service.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando el núcleo Serializable aplica la barrera parametrizada por usuario antes de leer saldo y repite toda la transacción ante conflictos previstos, con máximo tres intentos y conflicto recuperable al agotarlos.
  - Comprobación prevista — añadir primero casos focalizados del flujo y ejecutar `pnpm exec vitest run tests/integration/application-flows.test.ts -t "reintentos de confirmación"`. Entorno BD aislada autorizada. Esperado — relectura completa tras conflicto y conservación de valores lógicos y `updatedAt` del usuario.
  - Evidencia — 11 de noviembre de 2026. `createDailyEntry` ahora toma `pg_advisory_xact_lock(hashtext(userId))` en transacción Serializable antes de leer el contexto, y reintenta la operación completa hasta tres veces en conflictos P2034/40001/40P01; al agotarse responde conflicto recuperable 409. La lectura de jornada/saldo y la confirmación se ejecutan tras adquirir el lock dentro del mismo callback reintentable. La prueba concurrente usa el mismo usuario/fecha: ambas llamadas devuelven la misma jornada y la BD conserva una fila. Pasaron `-t "serializa confirmaciones concurrentes|fotografía de la jornada existente"` (2/2), 52 unitarias, TypeScript, Prettier y `git diff --check` en base local aislada. La prueba fixture para sábado falló inicialmente por día no laboral y se movió a lunes; no fue fallo de lógica. En chequeo adicional `-t "amplía una jornada registrada|unifica horario diferente"` fallaron dos expectativas previas de pausa 60 min porque el flujo usa 30 min; quedan documentadas para 002:T9, no se atribuyen a esta tarea.

- [ ] **T4. Confirmar el día completo compensado y los modos sin horas.** RF-1, RF-2, RF-3, RF-5, RF-6, RF-7.
  - Dependencias — T3.
  - Archivos — `src/server/services/daily-entry-service.ts`, `src/app/api/daily-entries/route.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando COMPENSATED comprueba crédito y esperado positivo dentro de la transacción y guarda CUSTOM con trabajado/descanso cero, timestamps nulos y saldo negativo; PERMISSION mantiene sus minutos declarados válidos sin pasar por validación de horas ficticias.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "día completo compensado|modos sin horas"`. Entorno BD aislada autorizada. Esperado — una sola jornada, sin permiso cero, rechazo de crédito insuficiente y compatibilidad de PERMISSION.
  - Evidencia — 11 de noviembre de 2026. Se añadió el modo `COMPENSATED` a API y servicio. Bajo barrera Serializable se exige saldo previo al menos igual a jornada esperada positiva; guarda `CUSTOM`, 0 trabajado, 0 descanso y timestamps nulos, sin permiso cero. La prueba integrada falló primero por intento de persistir `COMPENSATED` como tipo inexistente; con mapeo a `CUSTOM` pasó para crédito exacto de 360 min y rechazó otra jornada con saldo insuficiente. Filtro focalizado pasó 1/1, 20 omitidas; 52 unitarias, TypeScript, Prettier y diff-check pasaron. Entorno `control_horas_test`; sin migración y sin escrituras remotas. La interfaz para elegir este modo queda en 002:T7.

- [x] **T5. Clasificar compensación y preservar explicaciones en jornadas con horas.** RF-2, RF-4, RF-5, RF-7, RF-8, RF-9, RF-10, RF-11.
  - Dependencias — T1, T3 y T4.
  - Archivos — `src/server/services/daily-entry-service.ts`, `src/domain/balance-range-service.ts`, `src/app/api/daily-entries/route.ts`, `tests/unit/balance-range-service.test.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando las horas se calculan con el descanso efectivo y se deriva NONE/COMPENSATED/PARTIAL sin inflar trabajado, conservando permisos reales/voluntarios y aplicando motivos vigentes solo al tramo descubierto.
  - Comprobación prevista — `pnpm exec vitest run tests/unit/balance-range-service.test.ts` y `pnpm exec vitest run tests/integration/application-flows.test.ts -t "compensación parcial|explicación preservada"`. Entorno unitario y BD aislada autorizada. Esperado — compensación exacta/parcial, ausencia de descuento doble y tiempos heredados conservados.
  - Evidencia — 11 de noviembre de 2026. `BalanceRangeDay` añade `compensatedMinutes` y `pendingMinutes` como alias del movimiento común; no duplica filas ni cambia los minutos realmente trabajados. El alta y reemplazo de DIFFERENT crean PERMISSION solo por `uncoveredMinutes`, mantienen tipo CUSTOM y conservan el motivo del tramo descubierto. Pruebas unitarias cubren faltante −60 con crédito +120 (compensa 60, pendiente 0) y faltante −120 con +30 (compensa 30, pendiente 90); ambos casos fallaron primero por campos ausentes. Integración en usuario aislado confirmó trabajo 240, permiso 90 y mismo desglose en historial. `pnpm exec vitest run tests/unit` pasó 54/54 y filtro focalizado de integración pasó 2/2; TypeScript, Prettier y diff-check pasaron. Base local aislada, sin migración ni datos remotos. Descanso editable aún en formulario T7.

- [x] **T6. Integrar corrección administrativa, versión e idempotencia de reemplazo.** RF-4, RF-5, RF-6, RF-7, RF-8, RF-11.
  - Dependencias — T3 y T5.
  - Archivos — `src/server/services/daily-entry-service.ts`, `src/app/api/daily-entries/[id]/route.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando `correctDailyEntry` y la confirmación pasan por la misma barrera, respetan RBAC, reconocen repeticiones ya aplicadas sin duplicar notas/consumos y devuelven conflicto ante una versión incompatible sin ocultar el recálculo posterior de una retroedición.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "corrección de compensación|reemplazo idempotente|versión incompatible"`. Entorno BD aislada autorizada. Esperado — una jornada, nota no duplicada, rol validado y deuda posterior recalculada cuando corresponde.
  - Evidencia — 11 de noviembre de 2026. La corrección administrativa ahora se ejecuta bajo el mismo lock por usuario y transacción Serializable, valida rol ADMIN en el servicio y vuelve a leer la fila dentro de la transacción. Administración envía `updatedAt` como versión; una repetición idéntica devuelve el registro existente sin duplicar la nota y una versión antigua con contenido distinto responde `ENTRY_VERSION_CONFLICT` 409. Prueba integrada aislada pasó: nota única, saldo de jornada recalculado, replay estable, conflicto por versión y rechazo RBAC de USER. `pnpm exec vitest run tests/integration/application-flows.test.ts -t "corrige una jornada con versión"` 1/1; 54 unitarias, `tsc --noEmit`, Prettier y `git diff --check` pasaron. El primer typecheck detectó que faltaba seleccionar `updatedAt` en Administración; se corrigió y pasó. Base `control_horas_test`; sin escrituras remotas.

- [ ] **T7. Incorporar descanso editable, legado y confirmación compensada al formulario.** RF-2, RF-3, RF-4, RF-5, RF-9, RF-10, RF-11.
  - Dependencias — T2, T4, T5 y T6.
  - Archivos — `src/components/registration/daily-entry-form.tsx`.
  - Hecho cuando el formulario inicializa descanso correcto, ofrece horas hasta 20:00 con la opción heredada intacta, permite confirmar día compensado y conserva datos ante error o conflicto, mostrando su resultado real.
  - Comprobación prevista — `npm run typecheck` y recorrido de día nuevo, edición heredada, descanso inválido y compensación completa. Entorno navegador local aislado a 375 px y escritorio. Esperado — etiquetas, teclado, carga y mensajes funcionales sin cambiar la dirección visual.
  - Evidencia — implementación en curso, 11 de noviembre de 2026. El formulario ahora presenta COMPENSATED cuando el saldo anterior cubre el esperado, inicializa descanso desde la fotografía o desde el horario, permite editar minutos reales, muestra opciones de salida hasta 20:00 y conserva el valor original como opción cuando queda fuera de la lista. El API/servicio acepta y persiste `breakMinutes` enviado para DIFFERENT; la vista previa usa `calculateEffectiveInterval`. Prueba integrada de jornada con descanso real 60 confirmó los minutos netos; los recorridos integrados de crédito completo/insuficiente, descanso real y corrección versionada pasaron juntos 3/3. Al primer intento se detectó colisión entre fechas de fixtures; se aislaron en 30 y 31 de julio y el siguiente intento pasó. En navegador local se comprobó selector 06:00–20:00 y descanso predeterminado 60; no se envió formulario ni se escribió esa cuenta demo. TypeScript y 54 unitarias pasaron; ESLint sin errores, con advertencia preexistente `today` sin uso. Pendiente teclado/móvil, descanso inválido y modo completo visible/confirmado con crédito suficiente.

- [ ] **T8. Mostrar compensación y motivo separado en consultas y exportaciones.** RF-3, RF-4, RF-8.
  - Dependencias — T5, 001:T5, 001:T7 y 001:T8.
  - Archivos — `src/components/dashboard/daily-quick-register.tsx`, `src/app/(protected)/historial/page.tsx`, `src/components/forms/report-form.tsx`, `src/server/export/report-data.ts`, `src/server/export/excel.ts`, `src/server/export/pdf.ts`.
  - Hecho cuando los consumidores muestran el desglose ya calculado de faltante, compensado y pendiente y el motivo guardado sigue visible como explicación independiente, conservando los contratos previos.
  - Comprobación prevista — `npm run typecheck`, comparar resumen/historial/reporte y abrir exports del mismo fixture. Entorno local con BD de prueba aislada autorizada. Esperado — cifras idénticas, cero ausencia pendiente por tramo cubierto y motivo conservado.
  - Evidencia — pendiente de comparación por consumidor y formato.

- [ ] **T9. Ajustar los flujos integrados de descanso y compatibilidad al comportamiento aprobado.** RF-1, RF-3, RF-4, RF-5, RF-6, RF-9, RF-10, RF-11.
  - Dependencias — T4, T5 y T6.
  - Archivos — `tests/integration/application-flows.test.ts` y correcciones mínimas del servicio previsto en T4–T6 si los casos detectan un incumplimiento del alcance.
  - Hecho cuando cada fixture usa descanso configurado o real y referencia fija, cubre originales no modificados, edición de nota y modo sin horas, y las expectativas anteriores de 60/30 min se justifican por las nuevas reglas sin alterar la línea base para ocultar fallos.
  - Comprobación prevista — `npm run test:unit` y `npm run test:integration`. Entorno unitario y BD aislada autorizada. Esperado — resultados acordes a descanso 0, 30 y 60 y ausencia de fallos del alcance.
  - Evidencia — pendiente de expectativa antes/después, regla aplicada, comandos y resultados.

- [ ] **T10. Verificar confirmación concurrente y el recorrido de compensación.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11.
  - Dependencias — T7, T8 y T9.
  - Archivos — `tests/integration/application-flows.test.ts` y correcciones acotadas del núcleo de T3/T6 si el caso concurrente revela una omisión.
  - Hecho cuando clientes independientes verifican confirmaciones para mismo usuario en fechas iguales/distintas, reintento y lectura fresca, y una retroedición permite el recálculo posterior sin reserva ni política nueva de rechazo.
  - Comprobación prevista — escribir primero los casos concurrentes y ejecutar `pnpm exec vitest run tests/integration/application-flows.test.ts -t "compensación concurrente|retroedición"`; completar lint, typecheck, build, escaneo de secretos y recorrido local de confirmación. Entorno BD aislada autorizada y navegador local. Esperado — estados consistentes y evidencia de la barrera sin confundir serialización con congelar consumos.
  - Evidencia — pendiente de intercalado probado, resultados de cada cliente y comprobaciones de cierre.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                        |
| ---------------------------------- | ------------------------------ | ---------- | --------------------------------------- |
| Tareas e inicio de implementación  | Aprobada por el usuario        | 2026-11-11 | Implementación de las tareas de 001–004 |
| Implementación y paso a validación | Pendiente                      | —          | —                                       |

## Entrega

Seis tareas completadas y cuatro pendientes. Cada tarea registra RF, archivos, prueba inicial y final,
entorno y limitaciones. Al completar el alcance se presenta para aprobar la
validación formal, conservando la restricción de lectura de la base remota.
