# Control de Horas

PWA para registrar jornadas, permisos, deuda y recuperación de horas.

## Contexto

- Lee `MEMORY.md`, `docs/constitution.md` y la spec activa antes de cambiar código.
- Usa `.agents/skills/sdd/SKILL.md` y `docs/SDD.md` para fases, aprobaciones y habilidades.

## Stack y estructura

- Next.js 16, React 19, TypeScript estricto, Prisma 7 y PostgreSQL.
- `src/domain/` contiene cálculos y RBAC. `src/server/` contiene persistencia y servicios.
- Consulta `docs/ARCHITECTURE.md`, `docs/CALCULATION.md` y `docs/API.md` según el cambio.

## Comandos

- Desarrollo `npm run dev`. Tras editar `.env`, reinicia el proceso para renovar el pool.
- Calidad `npm run lint`, `npm run typecheck`, `npm run security:secrets`.
- Lógica `npm run test:unit`. Compilación `npm run build`. Integración `npm run test:integration`, solo con `TEST_DATABASE_URL` aislada.

## Forma de trabajar

- Sigue Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación, con aprobación explícita por fase y conservando la ya concedida.
- Mantén requisitos RF en EARS. Actualiza spec, plan y tareas antes del código si cambian requisitos.
- Para el flujo completo, delega con los roles de `.opencode/agents/` y transmite el contexto necesario.
- Implementa una tarea por invocación. Prueba primero la lógica, verifica y registra evidencia.
- Actualiza `MEMORY.md` al terminar cada fase o tarea. Mantén un máximo aproximado de 50 líneas.

## Datos y dominio

- La base remota está autorizada únicamente para lectura hasta una autorización concreta de escritura.
- Migraciones, seed, login, logout y pruebas de integración escriben en la base.
- Trabaja con minutos enteros y fechas civiles en la zona del usuario. Usa la habilidad `local-dates`.
- Conserva unicidad de usuario y fecha, fotografía diaria y RBAC. Excluye secretos y datos personales de documentos y resultados.

## Verificación

- Comprueba RF por RF con pruebas o evidencia manual. Documenta fallos previos y comprobaciones pendientes.
- Para UI, comprueba navegador, consola, teclado y móvil según la spec y las habilidades aplicables.
