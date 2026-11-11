# Tareas de 005-C — Administración, evaluación y continuidad

Estado de las tareas — borrador

Referencias — [spec.md](spec.md), [plan.md](plan.md) y [tareas de 005](../../tasks.md).
La división documental fue aprobada el 11 de noviembre de 2026.
La implementación de 005 conserva su aprobación pendiente.

## Dependencias y condiciones comunes

- Antes de aplicar apariencia debe existir el compromiso visual explícito de 004
  y `ROUND-2-CONTEXT.md`. Una preselección no satisface esta dependencia.
- La aplicación aislada, sus cuentas USER y ADMIN y datos de prueba deben estar
  disponibles para las comprobaciones de interacción. Los recorridos de B consumen
  los contratos terminados de 001–003 y C conserva sus controles administrativos.
- La base remota sigue en lectura. Login, logout, registro, contraseña y gestión
  administrativa se prueban exclusivamente en la base aislada autorizada.
- Cada área registra referencia previa y comprobación posterior en
  `specs/005-redisenio-interfaz-integral/validation.md`, con versión, URL, estado,
  viewport y resultado. Se conservan únicamente datos de prueba sin credenciales.
- El baseline usa una copia o árbol aislado. La comparación no requiere stashear
  ni cambiar la rama del directorio de trabajo actual del usuario.
- Las comprobaciones visuales usan 375 y 1280 px y reflow a 320 px efectivos.
  Cada tarea comprueba teclado, foco y errores de la porción que modifica.
- `web-design-guidelines` se aplica al código intervenido con sus reglas vigentes.
  `accessibility-scan` detecta violaciones y `accessibility-inspect` cubre interacción
  sin duplicar criterios. `accessibility-fix` se usa para hallazgos de alcance aprobado.
  `accessibility-diff` compara referencias compatibles y declara la deriva de selectores.
- Los resultados automáticos, manuales y que requieren lector de pantalla o juicio
  humano se registran por separado. Un punto pendiente no se marca como conforme.
- Las tareas visuales se verifican en navegador. Las comprobaciones de lint y tipos
  se ejecutan sobre los cambios pertinentes, manteniendo visible la línea base previa.
  Las pruebas de lógica de 001–003 siguen en Vitest y no se duplican para clases CSS.

Requiere A y contratos funcionales integrados para administración. C/T8 requiere evidencias de A, B y C/T1–T7. C/T9 requiere aceptación humana explícita de las pantallas.

## Secuencia

- [ ] **T1. Página administrativa y alta de persona.** RF-1, RF-5, RF-6, RF-7
  - Origen — bloque C1 de la división aprobada.
  - Alcance — `administracion/page.tsx`, `create-user-form.tsx`.
  - Dependencias — subentrega A, contratos funcionales integrados.
  - Hecho cuando alta, vacío, validación y éxito funcionan con rol ADMIN de prueba.
  - Comprobación — Crear una persona de prueba, provocar validación y comprobar restricción USER/ADMIN. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T2. Alta de horario.** RF-5, RF-6, RF-7
  - Origen — bloque C2 de la división aprobada.
  - Alcance — `create-schedule-form.tsx`.
  - Dependencias — T1.
  - Hecho cuando entrada del horario, errores y resultado conservan los datos y sus etiquetas.
  - Comprobación — Completar un horario, provocar errores y confirmar que los datos persisten en el formulario. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T3. Edición de persona.** RF-5, RF-6, RF-7
  - Origen — bloque C3 de la división aprobada.
  - Alcance — Sección de datos en `user-admin-row.tsx`.
  - Dependencias — T1.
  - Hecho cuando cambios de datos, rol y estado identifican persona y consecuencia y permiten reintentar.
  - Comprobación — Editar datos y rol de una persona de prueba y comprobar cancelación y error. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T4. Restablecimiento de contraseña.** RF-5, RF-6, RF-7
  - Origen — bloque C4 de la división aprobada.
  - Alcance — Sección correspondiente de `user-admin-row.tsx`.
  - Dependencias — T3.
  - Hecho cuando confirmación, error y resultado mantienen foco y persona afectada identificable.
  - Comprobación — Cancelar y confirmar un restablecimiento de cuenta de prueba, comprobando foco y mensajes. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T5. Eliminación de persona.** RF-5, RF-6, RF-7
  - Origen — bloque C5 de la división aprobada.
  - Alcance — Sección correspondiente de `user-admin-row.tsx`.
  - Dependencias — T3.
  - Hecho cuando cancelación y eliminación explican consecuencia y restauran foco al destino disponible.
  - Comprobación — Cancelar y eliminar una persona descartable de prueba y comprobar el foco posterior. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T6. Corrección de jornada.** RF-5, RF-6, RF-7
  - Origen — bloque C6 de la división aprobada.
  - Alcance — `admin-entry-row.tsx`.
  - Dependencias — T1, contratos 001–002.
  - Hecho cuando motivo, minutos, validación y saldo resultante se comprueban en base aislada.
  - Comprobación — Rechazar motivo o minutos inválidos y confirmar una corrección de jornada de prueba. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T7. Regresiones administrativas.** RF-1, RF-5, RF-6, RF-7
  - Origen — bloque C7 de la división aprobada.
  - Alcance — Evidencia de T1–T6.
  - Dependencias — T1–T6.
  - Hecho cuando se consolidan permisos, estados y comprobaciones focalizadas sin una auditoría nueva de toda la app.
  - Comprobación — Comparar referencias de T1–T6 y repetir solo los estados administrativos afectados. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T8. Informe consolidado.** RF-1 a RF-7
  - Origen — bloque C8 de la división aprobada.
  - Alcance — `validation.md` y evidencias A–C.
  - Dependencias — subentregas A y B, T1–T7.
  - Hecho cuando informe de auditoría agrega muestra, criterios, resultados, hallazgos y pendientes humanos ya evaluados.
  - Comprobación — Agregar el ledger por criterio, comprobar deduplicación y vincular evidencias de cada RF. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T9. Estructura y reglas de guía.** RF-8
  - Origen — bloque C9 de la división aprobada.
  - Alcance — `STYLEGUIDE.html`.
  - Dependencias — T8 y aceptación humana de pantallas.
  - Hecho cuando guía incorpora contexto comprometido, tipografía, color, composición, espacio y licencias aprobadas.
  - Comprobación — Contrastar cada regla y licencia de la guía con ROUND-2-CONTEXT.md y las pantallas aceptadas. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T10. Estados y continuidad de guía.** RF-8
  - Origen — bloque C10 de la división aprobada.
  - Alcance — `STYLEGUIDE.html`.
  - Dependencias — T9.
  - Hecho cuando incluye componentes y estados aprobados, variaciones, límites, prueba disponible y ejemplos de continuación.
  - Comprobación — Abrir guía a los anchos previstos y comprobar estados, límites y ejemplos de continuidad. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

## Checkpoints humanos

La dirección de 004 debe estar comprometida y `ROUND-2-CONTEXT.md` disponible
antes de aplicar apariencia de producción. Una preselección no satisface ese punto.
La aceptación de las pantallas tras C/T8 habilita C/T9. La guía y el cierre se
presentan después para aceptación. Estas decisiones no son tareas de duración
estimada ni se aprueban en nombre del usuario.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                                         |
| ---------------------------------- | ------------------------------ | ---------- | -------------------------------------------------------- |
| División documental A/B/C          | Aprobada                       | 2026-11-11 | Alcance derivado y materialización de la división de 005 |
| Tareas e inicio de implementación  | Pendiente                      | —          | —                                                        |
| Implementación y paso a validación | Pendiente                      | —          | —                                                        |

## Entrega

Las 10 tareas están pendientes de ejecución. Sus RF mantienen el estado
de implementación y validación pendiente hasta disponer de evidencia y las
aprobaciones correspondientes. La finalización de esta subentrega no acredita
por sí sola la finalización de 005.
