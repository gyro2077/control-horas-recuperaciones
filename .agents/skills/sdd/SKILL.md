---
name: sdd
description: Guiar Spec-Driven Development en Control de Horas al crear o revisar la constitución, specs, planes y tareas, implementar tareas aprobadas o validar requisitos. Usar también para cambios de requisitos y consultas de estado SDD.
---

# SDD en Control de Horas

Lee `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` y la carpeta de la spec activa.
Consulta `docs/SDD.md` para comandos, roles y habilidades complementarias.
Los originales del curso y la correspondencia de páginas están en `docs/references/sdd/`.

## Autoridad y aprobaciones

La modalidad es spec-anchored. Los requisitos permanecen actualizados durante la evolución.
La constitución inicial ya fue aprobada. Sus cambios necesitan una nueva aprobación.
Registra cada aprobación con la fase, fecha y alcance en el documento correspondiente.
Una aprobación vale para el contenido mostrado. Un cambio material requiere presentar su diff.
Conserva las autorizaciones explícitas ya concedidas, incluida una aprobación que enumere varias fases.
La aprobación técnica de un revisor y una lista de tareas marcadas no sustituyen la del usuario.
Mantén separados el estado del documento y la fase actual del trabajo.
Cada documento comienza como borrador y pasa a aprobado cuando el usuario aprueba ese contenido.
Si cambian requisitos o decisiones materiales, el documento afectado vuelve a borrador y
sus aprobaciones anteriores quedan como historial. Señala qué documentos posteriores deben
revisarse y conserva pendientes sus nuevas aprobaciones. Actualiza la fase actual al avanzar.
La spec pasa a implementada únicamente con validación satisfactoria y cierre aprobado.

## Fases

1. **Constitución.** Propón seis principios verificables, en un máximo de 15 líneas.
   Presenta cambios al usuario y espera su aprobación antes de escribirlos.
2. **Spec.** Investiga el código existente. Si falta una decisión de producto, pregunta de una en una,
   hasta cinco preguntas por ronda. Marca dudas restantes con `[NECESITA ACLARACIÓN]`.
   Usa el próximo `NNN` libre y `specs/NNN-nombre/spec.md` con estado borrador.
   Describe objetivo, actores, historias, RF, RNF, límites y criterios de aceptación.
   Usa [assets/spec.md](assets/spec.md). Mantén las decisiones técnicas para el plan.
   Presenta la spec y espera aprobación para avanzar a clarificación.
3. **Clarificación.** El reviewer detecta ambigüedades, contradicciones, límites omitidos y
   conflictos constitucionales y devuelve hallazgos sin editar archivos.
   El planner registra los hallazgos en la spec e incorpora las decisiones del usuario.
   Presenta el resultado para su aprobación.
4. **Plan.** Con spec y clarificación aprobadas, usa [assets/plan.md](assets/plan.md).
   Relaciona RF con archivos, responsabilidades, funciones, algoritmos, interfaz y comprobaciones.
   Justifica decisiones y alternativas. Define datos de prueba aislados y riesgos de compatibilidad.
   Presenta el plan y espera aprobación antes de desglosar tareas.
5. **Tareas.** Usa [assets/tasks.md](assets/tasks.md). Ordena por dependencias y limita cada tarea
   a unos 20–30 minutos, con RF y una condición verificable de terminación.
   Si excede diez tareas, propone dividir la spec. Solicita aprobación para implementar.
6. **Implementación.** Ejecuta una tarea por invocación. Para lógica, escribe o ajusta primero
   una prueba que falle por el comportamiento solicitado y luego implementa hasta que pase.
   Ejecuta las comprobaciones acordadas en el plan. Si fallan, informa y detén el avance.
   Marca la tarea solo con evidencia. Una llamada directa termina aquí. En flujo completo,
   el coordinador puede asignar la siguiente tarea dentro de la fase de implementación autorizada.
   Al terminar la implementación, solicita aprobación para pasar a validación.
7. **Validación.** El reviewer recorre todos los RF, compara cambios y adjunta evidencia de prueba
   o revisión manual. Comprueba los criterios de finalización y la constitución.
   Separa sugerencias de incumplimientos. Ante fallos, devuelve cambios necesarios.
   En el flujo completo, admite hasta dos ciclos de corrección del alcance aprobado, cada uno
   con una tarea concreta y nueva revisión. Tras dos intentos fallidos, informa al usuario.
   Presenta el resultado para aprobación del cierre. Solo entonces marca la spec implementada.
8. **Mantenimiento.** Cambia primero la spec y muestra su diff para aprobación.
   Repite clarificación, plan, tareas, implementación y validación para el alcance nuevo.

Actualiza `MEMORY.md` al terminar cada fase o tarea, con estado y siguiente paso.
Una consulta de estado lee los documentos y devuelve la fase real, aprobaciones y pendientes.
Elige la spec por petición y memoria. Si hay varias candidatas, pide identificar la activa.

## Requisitos y trazabilidad

Asigna identificadores `RF-1`, `RF-2`, etc. Un requisito expresa un comportamiento verificable.
Redacta con EARS en español, por ejemplo mediante un evento CUANDO y su resultado,
una condición SI y su respuesta ENTONCES, un estado MIENTRAS o una regla permanente.
Relaciona cada tarea y comprobación con los RF correspondientes. La validación debe indicar
por RF la evidencia, resultado y cualquier parte pendiente. Nunca marques como verificado
un RF que solo se haya deducido leyendo el código.

## Adaptación al repositorio

- Usa Vitest existente mediante `npm run test:unit` y pruebas focalizadas. El comando
  `node --test` de los ejemplos del curso corresponde al proyecto didáctico original.
- Las pruebas de integración requieren una base aislada migrada y `TEST_DATABASE_URL`.
  Nunca uses la base remota para seed, migraciones, login de prueba o tests que escriban
  sin autorización específica. Consulta la constitución antes de cualquier operación con datos.
- Conserva evidencia de fallos preexistentes. Su presencia no permite marcar una ejecución en verde
  ni modificar requisitos para acomodar el fallo. Propón su corrección con alcance explícito.
- Para lógica temporal usa `.agents/skills/local-dates/SKILL.md` y las utilidades actuales.
- Para interfaz usa las habilidades pertinentes de `.agents/skills/` según `docs/SDD.md`.
- En flujo completo usa coordinator, planner, implementer y reviewer. Transmite petición,
  decisiones, permisos, aprobaciones, archivos y resultado anterior a cada subagente.
- Los roles están en `.opencode/agents/`. En Codex usa las herramientas de delegación disponibles.
  Sus permisos YAML solo se aplican automáticamente cuando OpenCode los carga.
- Un cambio pequeño puede usar `feature` si el usuario elige ese recorrido. Documenta el alcance
  y la verificación y conserva la revisión de requisitos de una spec afectada.
