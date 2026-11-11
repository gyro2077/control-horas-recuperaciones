# Fuentes de la configuración SDD

Copias originales descargadas el 10 de noviembre de 2026 para consulta en este proyecto.
Los documentos pertenecen a Big School. Las instrucciones locales adaptan su método
al repositorio existente. Conserva los originales para revisar el contexto completo.

| Material                                                                                           | Copia local            | Secciones aplicadas                                                                     |
| -------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| [Día 1](https://thebigschool.com/wp-content/uploads/2026/09/Apuntes-Curso-Desarrollo-IA-Dia-1.pdf) | [dia-1.pdf](dia-1.pdf) | Páginas 15–19, contexto, AGENTS, memoria y planificación                                |
| [Día 2](https://thebigschool.com/wp-content/uploads/2026/10/Apuntes-Curso-Desarrollo-IA-Dia-2.pdf) | [dia-2.pdf](dia-2.pdf) | Páginas 3–8, comandos, habilidades y MCP. Páginas 9–19, SDD, EARS, fases y aprobaciones |
| [Día 3](https://thebigschool.com/wp-content/uploads/2026/10/Apuntes-Curso-Desarrollo-IA-Dia-3.pdf) | [dia-3.pdf](dia-3.pdf) | Páginas 3–9, coordinación, planificación, implementación y revisión                     |

## Integridad de las copias

SHA-256 de los archivos descargados.

```text
0a741c5cc102004a61c17b9f36bf263a1966a94f3e4642aee1fad359931612c0  dia-1.pdf
ab8b1da844506164cc1b594f67035b61ba22d47c5f2a9f7b54135195c9bfdde9  dia-2.pdf
3ca44b8043cfaf7aee4713e1c0ef4b2126afbef4ae259be285907d3268a83264  dia-3.pdf
```

## Adaptaciones explícitas al proyecto

- Se elige spec-anchored, la modalidad recomendada para comenzar en la página 10 del día 2.
- Se mantienen Next.js, TypeScript, Prisma, PostgreSQL y Vitest. El Diario de Estudio
  del curso utiliza HTML, JavaScript, localStorage y `node --test`.
- Las fechas usan Luxon, fechas civiles y adaptadores PostgreSQL DATE existentes.
  Las prohibiciones del ejemplo de localStorage no se trasladan a esos adaptadores.
- Se conserva la aprobación entre fases del día 2. El día 3 agrupa plan y tareas
  en su ejemplo de coordinador. Aquí se documentan como fases separadas.
- El planner puede actualizar `MEMORY.md` y, tras aprobación, `docs/constitution.md`,
  además de `specs/**`, para permitir el registro de fases sin dar edición al coordinador.
- Codex aplica `AGENTS.md` y la habilidad del proyecto. Los perfiles y comandos
  `.opencode/` se preparan para OpenCode. Sus permisos se definen con el formato
  publicado en su documentación oficial. OpenCode no está instalado en el entorno
  de esta configuración, por lo que queda pendiente una prueba dentro de ese cliente.
- El usuario mantiene autorización de solo lectura en la base remota. Las pruebas
  de escritura necesitan un entorno aislado y su autorización correspondiente.

## Recurso compartido de las habilidades de accesibilidad

Los cinco SKILL.md de AccessLint remiten a `../shared/methodology.md`.
La instalación inicial no incluía ese archivo. Se recuperó del origen el 10 de
noviembre de 2026, conservando su contenido, en `.agents/skills/shared/methodology.md`.
[Fuente de AccessLint](https://raw.githubusercontent.com/AccessLint/skills/main/plugins/accesslint/skills/shared/methodology.md).

```text
b233748dabc23fed4d7ff74235fd87408f395045894880ca6316fc36c45846a8  methodology.md
```

Los paquetes y MCP que mencionan las habilidades se comprueban al ejecutar
la capacidad correspondiente. La configuración SDD no acredita una auditoría
de accesibilidad ni una verificación visual de la aplicación.
