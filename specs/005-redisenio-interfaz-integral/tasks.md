# Tareas de Spec 005 — Índice de subentregas

Estado de las tareas — desglose documental materializado, con implementación pendiente

Referencias — [spec.md](spec.md) y [plan.md](plan.md), cuyas fases previas están aprobadas.
El usuario aprobó la división A/B/C y su materialización documental el 11 de noviembre de 2026.

## Partición aprobada y fuente de cada checklist

La división conserva las 28 tareas propuestas, en grupos de 8, 10 y 10 tareas
estimadas de 20–30 minutos. El tiempo de decisión humana queda fuera del conteo.
Cada subentrega contiene su especificación y plan derivados y su único checklist
operativo. El progreso se actualiza en esos checklists, evitando listas duplicadas.
Esta partición no reserva nuevos números de specs ni cambia los requisitos de 005.

| Subentrega                                   | Especificación derivada                                     | Plan derivado                                               | Checklist                                                     | Tareas | RF originales                      |
| -------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- | ------ | ---------------------------------- |
| A — Base visual, acceso y estados generales  | [spec.md](subentregas/A-base-visual/spec.md)                | [plan.md](subentregas/A-base-visual/plan.md)                | [tasks.md](subentregas/A-base-visual/tasks.md)                | 8      | RF-1, RF-3, RF-5, RF-6, RF-7       |
| B — Recorridos personales                    | [spec.md](subentregas/B-recorridos-personales/spec.md)      | [plan.md](subentregas/B-recorridos-personales/plan.md)      | [tasks.md](subentregas/B-recorridos-personales/tasks.md)      | 10     | RF-1, RF-2, RF-3, RF-4, RF-6, RF-7 |
| C — Administración, evaluación y continuidad | [spec.md](subentregas/C-administracion-continuidad/spec.md) | [plan.md](subentregas/C-administracion-continuidad/plan.md) | [tasks.md](subentregas/C-administracion-continuidad/tasks.md) | 10     | RF-1, RF-5, RF-6, RF-7, RF-8       |

## Trazabilidad de identificadores

- La secuencia T1–T8 de la propuesta original pasa a A/T1–A/T8.
- Los bloques B1–B10 pasan a B/T1–B/T10, manteniendo su orden y alcance.
- Los bloques C1–C10 pasan a C/T1–C/T10, manteniendo su orden y alcance.
- Los RF conservan su numeración original de 005. Los cierres parciales no completan los RF globales por sí solos.

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

## Cobertura global y cierre

| RF original | Área que aporta la evidencia                                                                  |
| ----------- | --------------------------------------------------------------------------------------------- |
| RF-1        | A para acceso y shell, B para pantallas personales y C para administración y coherencia final |
| RF-2        | B/T1–T2 y los contratos de 001–003                                                            |
| RF-3        | A/T3 como presentación compartida y B/T3–T4 para el registro real                             |
| RF-4        | B/T5–T7, con datos de 001                                                                     |
| RF-5        | A/T4 para navegación por rol y C/T1–T7 para operaciones administrativas                       |
| RF-6        | A, B y C en sus estados de carga, error, confirmación y conexión aplicables                   |
| RF-7        | Evaluación incremental de A, B y C, consolidada en C/T8                                       |
| RF-8        | C/T9–T10 después de la aceptación humana de las pantallas                                     |

C/T8 agrega los resultados ya obtenidos, conserva hallazgos y puntos humanos
pendientes y presenta las pantallas para aceptación. Tras esa aceptación se
crea la guía en C/T9–T10. La aceptación de la guía y el cierre de 005 se registran
como decisiones posteriores. Todos los RF permanecen pendientes de ejecución.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                                              |
| ---------------------------------- | ------------------------------ | ---------- | ------------------------------------------------------------- |
| División de 005 en A/B/C           | Aprobada                       | 2026-11-11 | División en 8, 10 y 10 tareas y su materialización documental |
| Tareas e inicio de implementación  | Pendiente                      | —          | —                                                             |
| Implementación y paso a validación | Pendiente                      | —          | —                                                             |

## Entrega

La división documental está materializada. Las 28 tareas están desmarcadas.
La implementación visual requiere la dirección 004 comprometida y conserva
su aprobación pendiente. No se ha creado una dirección visual ni acreditado
funcionamiento, auditoría o aceptación de las pantallas mediante este desglose.
