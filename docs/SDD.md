# Desarrollo guiado por especificaciones

Este proyecto adopta SDD en modalidad spec-anchored según los tres apuntes de
Big School. Cada requisito se conserva y se actualiza durante la evolución.
Los originales, páginas relevantes y adaptaciones están en [las fuentes](references/sdd/SOURCES.md).

## Punto de entrada

Lee [AGENTS.md](../AGENTS.md), [MEMORY.md](../MEMORY.md),
[la constitución](constitution.md) y [la habilidad SDD](../.agents/skills/sdd/SKILL.md).
El usuario aprobó la constitución inicial el 10 de noviembre de 2026.
La siguiente spec disponible es `001`. Una funcionalidad comienza por su objetivo
y sus criterios de aceptación. El código actual y la documentación permiten
identificar comportamientos existentes y diferencias que deben aclararse.

## Flujo y aprobaciones

| Fase           | Resultado                                                | Condición para avanzar                           |
| -------------- | -------------------------------------------------------- | ------------------------------------------------ |
| Constitución   | Seis principios del proyecto                             | Aprobación del usuario antes de escribir cambios |
| Spec           | `specs/NNN-nombre/spec.md` con requisitos EARS           | Aprobación del borrador presentado               |
| Clarificación  | Hallazgos QA y decisiones incorporadas en la spec        | Aprobación de la spec aclarada                   |
| Plan           | `plan.md` con decisiones, archivos y verificación por RF | Aprobación del plan                              |
| Tareas         | `tasks.md` con dependencias y condiciones de terminación | Aprobación de tareas e implementación            |
| Implementación | Una tarea por invocación y evidencia de verificación     | Aprobación para pasar a validación               |
| Validación     | Evidencia y resultado para cada RF                       | Aprobación del cierre por el usuario             |
| Mantenimiento  | Diff de requisitos y fases afectadas                     | Nueva aprobación del contenido modificado        |

Registra decisión, fecha y alcance en los documentos de cada fase.
Una autorización explícita que incluya varias fases se conserva para ese alcance.
La recomendación técnica del reviewer se presenta al usuario para su decisión.
Las dudas abiertas de producto se identifican con `[NECESITA ACLARACIÓN]`.

Las tareas duran aproximadamente 20–30 minutos. Si son más de diez, se propone
dividir la spec. Para lógica se prueba primero el comportamiento solicitado,
se implementa y se verifica. Un fallo impide marcar la tarea como completada.
En el flujo completo el coordinador asigna tareas sucesivas dentro de la fase
autorizada. La ejecución directa de una tarea devuelve el control al usuario.
El ciclo de corrección y revisión admite dos intentos antes de informar el bloqueo.

## Uso desde este chat

`AGENTS.md` dirige al agente a la habilidad SDD. Puedes pedir, por ejemplo,
“Sigue SDD para corregir la coherencia del saldo entre historial y dashboard”.
El agente investigará y redactará la spec antes de implementar.

También puedes pedir “Ejecuta las instrucciones de
`.opencode/commands/sdd-status.md` para `001-nombre`”. Los archivos de comandos
son prompts reutilizables. Su registro como comandos con `/` corresponde a OpenCode.
Las rutas `.opencode/agents/` sirven como instrucciones para los subagentes de Codex.
Codex aplica sus propios controles de herramientas y permisos.

## Uso desde OpenCode

Se incluyen `opencode.json`, cuatro perfiles y los comandos del curso.
El coordinador es el agente predeterminado para sesiones nuevas.
Reinicia OpenCode para que descubra estos archivos y las habilidades.
La configuración usa el formato de permisos de la documentación actual.
[Agentes](https://opencode.ai/docs/agents/), [comandos](https://opencode.ai/docs/commands/).

| Comando                                  | Propósito                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `/sdd-constitution`                      | Proponer o revisar los seis principios                                 |
| `/sdd-spec 001-nombre idea inicial`      | Entrevistar y redactar una especificación                              |
| `/sdd-clarify 001-nombre`                | Detectar dudas y contradicciones como QA                               |
| `/sdd-plan 001-nombre`                   | Diseñar la solución de la spec aclarada                                |
| `/sdd-tasks 001-nombre`                  | Dividir el plan aprobado en tareas verificables                        |
| `/sdd-implement 001-nombre T1`           | Ejecutar una tarea aprobada                                            |
| `/sdd-validate 001-nombre`               | Revisar implementación RF por RF                                       |
| `/sdd-change 001-nombre nuevo requisito` | Actualizar primero los requisitos                                      |
| `/sdd-status 001-nombre`                 | Consultar fase, aprobaciones y próximo paso                            |
| `/feature descripción`                   | Preparar un plan acotado para un cambio pequeño elegido por el usuario |

## Responsabilidades

| Rol         | Trabajo                                                      | Alcance de edición autorizado del encargo              |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| coordinator | Encargar fases, transmitir decisiones y presentar resultados | Ninguno                                                |
| planner     | Redactar y actualizar documentos de SDD                      | `specs/**`, `MEMORY.md` y constitución tras aprobación |
| implementer | Ejecutar una tarea aprobada y sus comprobaciones             | Archivos previstos en el plan y registro de la tarea   |
| reviewer    | Clarificar requisitos o verificar evidencia por RF           | Ninguno                                                |

El planner registra la memoria de cada fase documental. El implementer registra
la memoria de cada tarea. El coordinador incluye en cada encargo la petición,
las decisiones, las aprobaciones, el entorno permitido, las rutas y el resultado anterior.
Esta precisión permite mantener la memoria sin habilitar edición al coordinador.
Los perfiles de coordinator y reviewer deniegan edición mediante herramientas.
El implementer tiene capacidad de edición general y limita su trabajo al plan
mediante instrucciones. Estos perfiles no constituyen un aislamiento de procesos
ni impiden por sí solos que un comando de shell escriba en otros archivos.

## Habilidades añadidas

Selecciona y lee las habilidades según el trabajo real, conservando el alcance aprobado.

| Necesidad                                                    | Habilidad                        |
| ------------------------------------------------------------ | -------------------------------- |
| Fases, requisitos y trazabilidad                             | `sdd`                            |
| Fechas civiles, zonas, horarios y saldos                     | `local-dates`                    |
| Diseño de componentes o páginas con decisiones del usuario   | `bencium-controlled-ux-designer` |
| Nueva dirección visual que requiere exploración de conceptos | `bencium-innovative-ux-designer` |
| Implementación visual dentro de una dirección acordada       | `frontend-design`                |
| Revisión de interfaz y buenas prácticas                      | `web-design-guidelines`          |
| Evaluación automática de una página                          | `accessibility-scan`             |
| Teclado, foco, reflow y comprobaciones manuales              | `accessibility-inspect`          |
| Auditoría de varias páginas                                  | `accessibility-audit`            |
| Reparación de hallazgos de accesibilidad                     | `accessibility-fix`              |
| Regresiones de accesibilidad entre versiones                 | `accessibility-diff`             |

Las habilidades viven en `.agents/skills/`. Evita aplicar varios procesos de
diseño alternativos al mismo encargo sin una decisión del usuario.
Los ejemplos de shadcn, Phosphor, Sonner o Framer Motion de una habilidad
se evalúan contra el stack real, que actualmente usa Lucide y componentes propios.
Una habilidad no autoriza por sí misma nuevas dependencias o cambios de alcance.

Las habilidades AccessLint usan herramientas externas. El archivo compartido
`shared/methodology.md` se recuperó del origen porque faltaba en la instalación.
Su uso efectivo requiere las herramientas indicadas en cada `SKILL.md`.
Los MCP mencionados en el curso dependen del cliente. GitHub y navegador se usan
cuando estén disponibles. Context7 requiere conexión y credenciales propias.
Las verificaciones sin herramienta disponible se registran como pendientes.

## Verificación y datos

Se conservan los comandos de calidad del README. Vitest es el ejecutor del proyecto.
Una spec relaciona cada RF con una prueba o revisión manual concreta.
La verificación visual incluye la consola y móvil de 375 px cuando aplica.
Para accesibilidad se distingue evidencia automática, manual y validación humana.

La base remota permanece en solo lectura por instrucción del usuario.
El login y logout escriben sesiones y contadores. Los seeds, migraciones y tests
de integración también escriben. Las pruebas de escritura se realizan en una
base aislada autorizada con `TEST_DATABASE_URL`, según el plan.
Las comprobaciones previas están resumidas en `MEMORY.md` y sus fallos requieren
un alcance de corrección definido. Un test omitido se registra como omitido.
