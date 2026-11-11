# Memoria de Control de Horas

## Estado actual

- El proyecto existente usa Next.js, React, Prisma y PostgreSQL.
- El entorno local conecta a la base remota. Conserva la restricción de solo lectura.
- El 10 de noviembre de 2026 el usuario aprobó los seis principios de `docs/constitution.md`.
- Se configuró SDD según los apuntes de Big School de los días 1, 2 y 3.
- La carga de perfiles y comandos en OpenCode queda pendiente, ese cliente no está instalado.
- Petición activa de horas adelantadas, salida anticipada y renovación integral de interfaz.
- El 11 de noviembre de 2026 aprobó especificación, clarificación y planes de 001–005, implementación de tareas 001–004 y la división propuesta de 005.

## Specs de la petición activa

- `001-horas-adelantadas` distingue extras, recuperación y crédito y exige coherencia entre consultas.
- `002-compensacion-salida-temprana` registra compensación conservando el tiempo realmente trabajado.
- `003-recomendacion-de-salida` simula la jornada actual y orienta sobre cuándo salir.
- `004-direccion-visual` define exploración y elección humana de una identidad propia.
- `005-redisenio-interfaz-integral` aplica la dirección elegida a los recorridos existentes.
- La siguiente numeración libre es `006`. El índice y las dependencias están en `specs/README.md`.

## Decisiones

- Modalidad spec-anchored, con requisitos vivos y aprobación explícita entre fases.
- Se conservan el stack y Vitest. Los ejemplos del curso usan un proyecto distinto.
- Las tareas se implementan individualmente y se revisan con trazabilidad a sus RF.
- Los roles de OpenCode se reutilizan como instrucciones de delegación desde Codex.
- El usuario confirmó crédito continuo sin caducidad, consumo automático y compensación de una jornada completa.
- El usuario eligió franjas de media hora y confirmó el 11 de noviembre de 2026 un máximo de salida de 20:00, inclusive, el mismo día.
- El 11 de noviembre de 2026 confirmó descanso del horario por defecto, editable al realmente tomado, compartido por registro y recomendación.
- QA concluyó sin hallazgos pendientes. El usuario aprobó las aclaraciones de días sin jornada y compatibilidad de horarios históricos.

## Verificación previa a SDD

- Build, TypeScript, escaneo de secretos y 15 pruebas unitarias pasaron.
- ESLint informó una variable `today` sin uso en `daily-entry-service.ts`.
- En una base local aislada pasaron 7 de 10 pruebas de integración.
- Dos casos esperan 60 minutos de descanso, mientras la regla actual aplica 30.
- Un caso de dashboard depende del reloj real con datos fijos de julio de 2026.

## Aprendizajes

- Cambiar `.env` requiere reiniciar Next para reemplazar el cliente Prisma global.
- 001:T1–T5 y 002:T1–T6 completas; 002:T7 en curso. Formulario ofrece descanso real y salidas hasta 20:00; 3 recorridos integrados, 54 unitarias y TypeScript pasan en aislada. Una colisión inicial de fixtures se resolvió con fechas independientes. Base remota sin escrituras; móvil/teclado pendientes.
- La interfaz 005 tiene aprobada su división en A8 base/acceso, B10 personales y C10 administración/evaluación/guía, conservando su alcance integral.

## Próximos pasos

- Terminar 002:T7 (móvil/teclado y crédito suficiente), luego continuar el resto de 001–004 dentro de implementación aprobada. Base remota solo lectura. 005 implementación no aprobada; dirección visual 004 exige que el usuario elija una de diez propuestas antes de aplicarla. Validación formal y cierres pendientes de aprobación.
- Las habilidades de diseño y accesibilidad previstas están asignadas en el índice de specs.
