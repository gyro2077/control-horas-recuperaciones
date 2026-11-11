# Tareas de Spec 003 — Recomendación y simulación de salida

Estado de las tareas — aprobadas
Referencias — [spec.md](spec.md) y [plan.md](plan.md), con especificación, clarificación y plan aprobados el 11 de noviembre de 2026.

## Condiciones de ejecución

Las tareas se estiman en 20–30 minutos y se implementan de una en una.
Cada cambio de lógica incluye su prueba primero y su implementación en esa misma tarea.
Los comandos son previstos y sus resultados permanecen pendientes. El servicio de
simulación es de lectura, pero preparar datos o sesiones de prueba escribe, por lo
que toda preparación e integración utiliza únicamente una base aislada autorizada.
La base remota sigue en lectura. Las referencias `001:Tn` y `002:Tn` remiten a
[001](../001-horas-adelantadas/tasks.md) y [002](../002-compensacion-salida-temprana/tasks.md).

## Secuencia

- [ ] **T1. Calcular la simulación pura con saldo firmado, descanso y originales.** RF-1, RF-3, RF-4, RF-5, RF-6, RF-9, RF-10, RF-12.
  - Dependencias — 001:T1 y 002:T1.
  - Archivos — nuevo `src/domain/departure-service.ts` y nuevo `tests/unit/departure-service.test.ts`.
  - Hecho cuando una propuesta usa el mismo intervalo y movimiento de las specs previas, distingue saldo previo y registro original y devuelve resultados con fecha, referencia y orígenes sin mutar sus datos de entrada.
  - Comprobación prevista — `pnpm exec vitest run tests/unit/departure-service.test.ts`, con deuda previa, descansos 0/30/60, originales 08:15–20:15 y cambio parcial a 20:00. Entorno sin BD. Esperado — cifras iguales al cálculo compartido y errores precisos para nuevas horas inválidas.
  - Evidencia — pendiente de casos, fallo inicial y ejecución final.

- [ ] **T2. Recomendar la primera salida válida y separar la simulación opcional.** RF-2, RF-3, RF-7, RF-9, RF-10, RF-11, RF-12.
  - Dependencias — T1.
  - Archivos — `src/domain/departure-service.ts`, `tests/unit/departure-service.test.ts`.
  - Hecho cuando se buscan medias horas hasta 20:00, el esperado cero produce estado sin jornada conservando aportes reales y FULL_DAY_COVERED no impide simular una propuesta parcial explícita con su crédito restante.
  - Comprobación prevista — `pnpm exec vitest run tests/unit/departure-service.test.ts`, con salida 12:30 para crédito 120/esperado 360, crédito histórico de 15 min, entrada ausente por rama y ninguna salida admisible. Entorno sin BD. Esperado — recomendación y simulación separadas, sin redondeo que cree deuda nueva ni horas inventadas.
  - Evidencia — pendiente de recomendaciones, estados y resultados de prueba.

- [ ] **T3. Leer el contexto autorizado del día actual en una fotografía consistente.** RF-1, RF-4, RF-5, RF-6, RF-7, RF-8, RF-11, RF-12.
  - Dependencias — T2, 001:T3 y 002:T2.
  - Archivos — nuevo `src/server/services/departure-query-service.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando `getDeparturePreview` fija `now`, obtiene la zona del objetivo, aplica RBAC y lee esperado efectivo, originales y saldo hasta ayer con el mismo cliente RepeatableRead, sin DML ni operaciones mutantes de sesión.
  - Comprobación prevista — `pnpm exec vitest run tests/integration/application-flows.test.ts -t "lectura de orientación"`. Entorno BD aislada autorizada. Esperado — exclusión de hoy y crédito posterior, fotografía preservada y acceso ajeno rechazado.
  - Evidencia — pendiente de entradas, instantánea y permisos comprobados.

- [ ] **T4. Exponer GET de preview con un DTO público explícito.** RF-1, RF-3, RF-4, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12.
  - Dependencias — T3.
  - Archivos — nuevo `src/app/api/daily-entries/preview/route.ts`, `tests/integration/application-flows.test.ts`.
  - Hecho cuando los parámetros previstos se validan sin rechazar prematuramente legado, la fecha distinta de hoy devuelve el error acordado y la respuesta selecciona únicamente el DTO público, con `no-store` y errores de campo utilizables.
  - Comprobación prevista — añadir primero casos de ruta y ejecutar `pnpm exec vitest run tests/integration/application-flows.test.ts -t "GET de orientación"`. Entorno local con BD aislada autorizada. Esperado — contrato público, 422 para fecha no soportada, RBAC vigente y ausencia de hashes, sesiones y contexto interno.
  - Evidencia — pendiente de respuestas, claves comprobadas y resultados.

- [ ] **T5. Presentar los estados y datos de la recomendación en un bloque funcional.** RF-1, RF-2, RF-3, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12.
  - Dependencias — T4.
  - Archivos — nuevo `src/components/registration/departure-preview.tsx`.
  - Hecho cuando los estados diferenciados muestran datos usados, origen, instante, crédito/deuda y carácter informativo, preservan originales y explican los errores sin presentar un resultado inválido como salida recomendada.
  - Comprobación prevista — `npm run typecheck` y revisar los estados del DTO con fixtures locales a 375 px y escritorio. Entorno navegador local aislado. Esperado — etiquetas, foco, carga, error y resultado accesibles con el estilo existente.
  - Evidencia — pendiente de estados representados, navegación y observaciones.

- [ ] **T6. Conectar formulario y acceso de hoy evitando respuestas desactualizadas.** RF-1, RF-2, RF-3, RF-5, RF-8, RF-9, RF-10, RF-12.
  - Dependencias — T5, 002:T7 y 001:T5.
  - Archivos — `src/components/registration/daily-entry-form.tsx`, `src/app/(protected)/registro/page.tsx`, `src/app/(protected)/dashboard/page.tsx`.
  - Hecho cuando cambios de entrada, salida o descanso de hoy solicitan preview, el acceso desde resumen conduce al bloque correcto y cancelar o identificar peticiones impide que una respuesta antigua reemplace los valores actuales.
  - Comprobación prevista — `npm run typecheck` y alternar rápidamente valores con respuestas demoradas, cambiar a fecha histórica y volver a hoy. Entorno navegador local aislado, a 375 px y escritorio. Esperado — solo la respuesta vigente se muestra y el registro histórico habitual permanece disponible sin orientación de otra fecha.
  - Evidencia — pendiente de orden de respuestas y estados observados.

- [ ] **T7. Verificar que consultar no escribe y que coincide con la confirmación.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-8, RF-9, RF-11, RF-12.
  - Dependencias — T4 y 002:T10.
  - Archivos — `tests/integration/application-flows.test.ts` y correcciones mínimas del servicio de T3 si se detecta un incumplimiento del alcance.
  - Hecho cuando variar propuestas conserva filas y marcas de actualización de jornadas, permisos y sesiones; confirmar los mismos tiempos reales con 002 produce el efecto previsto o comunica un cambio concurrente de saldo sin aplicar una estimación obsoleta.
  - Comprobación prevista — escribir primero los casos integrados y ejecutar `pnpm exec vitest run tests/integration/application-flows.test.ts -t "orientación sin escrituras|orientación y confirmación"`. Entorno BD aislada autorizada con `now` fijo. Esperado — comparación exacta de los campos financieros, incluido full-day cubierto con propuesta parcial y aporte heredado de esperado cero.
  - Evidencia — pendiente de conteos, marcas, payloads y resultados de confirmación.

- [ ] **T8. Comprobar el recorrido de orientación y sus límites de entrega.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12.
  - Dependencias — T6 y T7.
  - Archivos — archivos de UI y pruebas de T1–T7, solo para corregir incumplimientos de esta spec revelados por la comprobación.
  - Hecho cuando cada RF tiene evidencia, los cálculos de zona y medianoche son deterministas y el recorrido por teclado y móvil distingue estimación, original y registro confirmado, sin dar por aprobada la validación formal.
  - Comprobación prevista — `npm run test:unit`, `npm run test:integration`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run security:secrets` y recorrido móvil de 375 px. Entorno unitario, BD aislada autorizada y navegador local. Esperado — pruebas del alcance en verde, errores comprensibles y ausencia de escrituras por consultas de preview.
  - Evidencia — pendiente de comandos, resultados y observaciones por RF.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                        |
| ---------------------------------- | ------------------------------ | ---------- | --------------------------------------- |
| Tareas e inicio de implementación  | Aprobada por el usuario        | 2026-11-11 | Implementación de las tareas de 001–004 |
| Implementación y paso a validación | Pendiente                      | —          | —                                       |

## Entrega

Ocho tareas pendientes. Registrar por tarea sus RF, archivos, comandos, entorno,
prueba inicial y final y cualquier limitación. La elección visual permanece en
004 y la aplicación integral del diseño en 005. Presentar después el resultado
para aprobar la validación formal de esta spec.
