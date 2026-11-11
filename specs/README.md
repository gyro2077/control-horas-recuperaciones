# Especificaciones de Control de Horas

Cada cambio se mantiene en `NNN-nombre/`, con `spec.md`, `plan.md` y `tasks.md`,
según la fase aprobada. Las siguientes specs corresponden a la petición
de horas adelantadas y renovación visual del 10 de noviembre de 2026.

| Spec                                                                              | Requisito principal                                                             | Dependencias                              | Estado                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| [001 — Horas adelantadas](001-horas-adelantadas/spec.md)                          | Reconocer extras, recuperación y crédito disponible continuo                    | Comportamiento existente                  | Especificación, clarificación y plan aprobados; tareas en preparación |
| [002 — Compensación de salida temprana](002-compensacion-salida-temprana/spec.md) | Consumir crédito al registrar tiempo faltante o una jornada completa compensada | 001                                       | Especificación, clarificación y plan aprobados; tareas en preparación |
| [003 — Recomendación de salida](003-recomendacion-de-salida/spec.md)              | Estimar a qué hora salir y mostrar las consecuencias antes de confirmar         | 001 y 002                                 | Especificación, clarificación y plan aprobados; tareas en preparación |
| [004 — Dirección visual](004-direccion-visual/spec.md)                            | Explorar y comprometer una identidad propia                                     | Contexto del producto y conceptos 001–003 | Especificación, clarificación y plan aprobados; tareas en preparación |
| [005 — Renovación integral de interfaz](005-redisenio-interfaz-integral/spec.md)  | Aplicar la dirección elegida a los recorridos existentes                        | 001–004 para la integración final         | Especificación, clarificación y plan aprobados; tareas en preparación |

La siguiente numeración libre después de estas specs es `006`. Los planes y tareas
se redactan cuando se aprueben sus fases previas. La definición funcional y la
exploración de dirección pueden avanzar por sus fases con decisiones independientes.

## Planes técnicos

Los cinco planes fueron aprobados por el usuario el 11 de noviembre de 2026. Su revisión interna
documental concluyó sin hallazgos bloqueantes el 11 de noviembre de 2026. La especificación
y la clarificación están aprobadas. El desglose en tareas es la fase activa.

- [Plan 001 — Saldo a favor y coherencia entre consultas](001-horas-adelantadas/plan.md)
- [Plan 002 — Compensación, descanso real y compatibilidad histórica](002-compensacion-salida-temprana/plan.md)
- [Plan 003 — Simulación y recomendación de salida](003-recomendacion-de-salida/plan.md)
- [Plan 004 — Exploración y compromiso de dirección visual](004-direccion-visual/plan.md)
- [Plan 005 — Aplicación a pantallas y verificación de accesibilidad](005-redisenio-interfaz-integral/plan.md)

## Desglose de tareas

Las listas están en borrador para aprobación. La revisión interna documental del
11 de noviembre de 2026 confirmó cobertura de RF y dependencias sin ciclos.
Los resultados de implementación continúan pendientes.

| Spec | Documento                                                                     | Tareas                                | Estado                                                      |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| 001  | [Saldo a favor](001-horas-adelantadas/tasks.md)                               | 10                                    | Desglose listo para aprobación                              |
| 002  | [Compensación](002-compensacion-salida-temprana/tasks.md)                     | 10                                    | Desglose listo para aprobación                              |
| 003  | [Recomendación](003-recomendacion-de-salida/tasks.md)                         | 8                                     | Desglose listo para aprobación                              |
| 004  | [Dirección visual](004-direccion-visual/tasks.md)                             | 8                                     | Desglose listo para aprobación; compromiso visual posterior |
| 005  | [Propuesta de división de interfaz](005-redisenio-interfaz-integral/tasks.md) | 28 propuestas en grupos de 8, 10 y 10 | División pendiente de aprobación                            |

La propuesta de 005 conserva sus RF en tres subentregas. A cubre base visual,
acceso y estados generales. B cubre recorridos personales. C cubre administración,
evaluación consolidada y guía de continuidad. Las ocho tareas de A están enumeradas
y las veinte de B/C están detalladas como propuesta para preparar sus respectivos
documentos después de aprobar la división. La finalización de A no completa 005.

## Habilidades previstas por alcance

| Trabajo                                                | Habilidades                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Specs, aprobaciones y trazabilidad                     | `sdd`                                                                                             |
| Saldo cronológico y salida según zona y horario        | `local-dates`                                                                                     |
| Exploración visual de la spec 004                      | `bencium-innovative-ux-designer`, con una única autoría creativa                                  |
| Aplicación y ajustes acordados de la spec 005          | `bencium-controlled-ux-designer` y `frontend-design`, después de comprometer la dirección         |
| Revisión de implementación de interfaz                 | `web-design-guidelines`                                                                           |
| Evaluación de páginas y recorridos                     | `accessibility-audit`, apoyada por `accessibility-scan` y `accessibility-inspect`                 |
| Remediación de hallazgos y verificación de regresiones | `accessibility-fix` y `accessibility-diff`, cuando exista un hallazgo o una referencia comparable |

Esta asignación describe el trabajo previsto. Los resultados reales de aplicación,
auditoría y verificación se registrarán en los documentos de cada fase.

La constitución está en [docs/constitution.md](../docs/constitution.md).
El flujo y sus comandos están en [docs/SDD.md](../docs/SDD.md).
Las plantillas están en [.agents/skills/sdd/assets/](../.agents/skills/sdd/assets/).

El comportamiento existente se consulta en el código y en `docs/`.
Una spec nueva identifica el cambio solicitado y su relación con ese comportamiento.
Las aprobaciones se registran en los documentos de cada fase y la spec activa en `MEMORY.md`.
