# Tareas de 005-B — Recorridos personales

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

Requiere la base visual de A y el compromiso de 004. El registro, la simulación y la integración final requieren los contratos de 001–003 operativos.

## Secuencia

- [ ] **T1. Resumen y acciones.** RF-1, RF-2, RF-7
  - Origen — bloque B1 de la división aprobada.
  - Alcance — `dashboard/page.tsx`, `metric-card.tsx`, `daily-quick-register.tsx`.
  - Dependencias — subentrega A, contratos 001–003.
  - Hecho cuando deuda, recuperación y crédito tienen unidades y acciones coherentes y son accesibles.
  - Comprobación — Consultar fixtures con deuda, cero y crédito y recorrer acciones con teclado. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T2. Gráfico y alternativa textual.** RF-2, RF-7
  - Origen — bloque B2 de la división aprobada.
  - Alcance — `balance-chart.tsx` y su contexto en dashboard.
  - Dependencias — T1, decisión sobre recurso existente.
  - Hecho cuando fechas y saldos del gráfico están disponibles por texto y teclado.
  - Comprobación — Comparar fechas y saldos de gráfico y texto y recorrer su equivalente accesible. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T3. Presentación del registro y simulación.** RF-1, RF-3, RF-7
  - Origen — bloque B3 de la división aprobada.
  - Alcance — `registro/page.tsx`, `daily-entry-form.tsx` y componente de 003.
  - Dependencias — subentrega A, contratos 002–003.
  - Hecho cuando entrada, descanso, compensación y propuesta de salida conservan sus contratos.
  - Comprobación — Introducir entrada, descanso y propuesta válida y contrastar con resultados de 002–003. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T4. Errores y recuperación del registro.** RF-3, RF-6, RF-7
  - Origen — bloque B4 de la división aprobada.
  - Alcance — Mismos componentes de T3.
  - Dependencias — T3.
  - Hecho cuando validación y fallo de red permiten corregir y reintentar con datos conservados.
  - Comprobación — Provocar error de validación y fallo de red, corregir y reintentar sin perder valores. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T5. Historial.** RF-1, RF-4, RF-7
  - Origen — bloque B5 de la división aprobada.
  - Alcance — `historial/page.tsx`.
  - Dependencias — subentrega A, contrato 001.
  - Hecho cuando período, persona y saldos se leen con tablas y filtros operables.
  - Comprobación — Consultar un período con saldo anterior y cambiar persona autorizada usando teclado. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T6. Selección y estados de reportes.** RF-1, RF-4, RF-6
  - Origen — bloque B6 de la división aprobada.
  - Alcance — `reportes/page.tsx`, `report-form.tsx`.
  - Dependencias — subentrega A, contrato 001.
  - Hecho cuando selección, carga y errores conservan persona y rango válidos.
  - Comprobación — Cambiar filtros, retardar una lectura y provocar un error conservando la selección. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T7. Resultados y descargas de reportes.** RF-4, RF-7
  - Origen — bloque B7 de la división aprobada.
  - Alcance — `report-form.tsx`.
  - Dependencias — T6, coherencia 001.
  - Hecho cuando tabla, unidades y descargas se corresponden al reporte seleccionado.
  - Comprobación — Contrastar la vista con el reporte de servidor y abrir ambas descargas del período. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T8. Datos del perfil.** RF-1, RF-6, RF-7
  - Origen — bloque B8 de la división aprobada.
  - Alcance — `perfil/page.tsx`, sección de datos en `profile-form.tsx`.
  - Dependencias — A.
  - Hecho cuando datos editables muestran validación, confirmación y foco correcto.
  - Comprobación — Enviar datos inválidos y válidos y revisar error asociado, foco y confirmación. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T9. Contraseña del perfil.** RF-6, RF-7
  - Origen — bloque B9 de la división aprobada.
  - Alcance — Sección de contraseña en `profile-form.tsx`.
  - Dependencias — T8.
  - Hecho cuando envío y errores son independientes de datos de perfil y se verifican con cuenta aislada.
  - Comprobación — Probar validación, fallo y cambio de contraseña con cuenta de prueba aislada. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
  - Evidencia — pendiente de ejecución.

- [ ] **T10. Regresiones personales.** RF-1 a RF-4, RF-6, RF-7
  - Origen — bloque B10 de la división aprobada.
  - Alcance — Evidencia ya obtenida en T1–T9.
  - Dependencias — T1–T9.
  - Hecho cuando referencias comparables y comprobaciones focalizadas consolidan los recorridos personales.
  - Comprobación — Comparar snapshots compatibles y repetir únicamente los casos afectados por hallazgos. Entorno local aislado y cuentas de prueba para las operaciones que escriben.
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
