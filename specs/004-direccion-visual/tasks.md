# Tareas de Spec 004 — Dirección visual

Estado de las tareas — aprobadas
Referencia — [spec.md](spec.md) y [plan.md](plan.md), aprobados el 11 de noviembre de 2026.

## Dependencias y límites

La especificación, la clarificación y el plan están aprobados. Estas tareas
corresponden al primer conjunto de propuestas y a la entrega de una dirección
comprometida. Su ejecución requiere la aprobación de tareas e implementación.

Las cinco parejas de propuestas tienen una única autoría creativa. Se crean
secuencialmente, comenzando cada propuesta desde su propia premisa y un archivo
nuevo. El agrupamiento por parejas organiza trabajo de aproximadamente 20–30
minutos y no define un patrón común de diseño. Cada pareja investiga y verifica
las fuentes apropiadas a sus propias necesidades antes de incorporarlas.

La referencia funcional son los requisitos aprobados de 001–003. El código de
esas specs no es una dependencia para elaborar estas propuestas. La aplicación
a pantallas reales pertenece a 005, después del compromiso visual explícito.

## Secuencia

- [ ] **T1. Preparar evidencia y contenido común.** RF-2, RF-3, RF-7
  - Dependencias — ninguna tarea de implementación de otras specs.
  - Alcance — `design/004-direccion-visual/evidence.md` y `copy.txt`.
  - Hecho cuando exista un propósito derivado de la petición, una lista de evidencia permitida, fuentes excluidas y un único texto en español con horas pendientes, recuperadas, adelantadas y salida anticipada. Los números ilustrativos estarán identificados como ejemplos.
  - Comprobación — lectura de ambos archivos y cotejo con los requisitos aprobados. Registrar necesidades de números, tildes, lectura, formato y licencias antes de investigar fuentes.
  - Entorno — archivos locales y documentación funcional, con la base de datos fuera del recorrido.
  - Evidencia — pendiente de ejecución.

- [ ] **T2. Crear A y B y sus cápsulas.** RF-1, RF-2, RF-3, RF-4, RF-7
  - Dependencias — T1.
  - Alcance — `round-1/A.html`, `B.html`, `capsules/A.md`, `capsules/B.md` y recursos tipográficos de esas propuestas, bajo el directorio definido en el plan.
  - Hecho cuando existan dos documentos completos independientes con el texto común, sus decisiones registradas y licencias comprobadas. Cada premisa se deriva de la evidencia del producto.
  - Comprobación — inspección de fuente, contenido, rutas y licencias. Usar las reglas de aislamiento y de ingredientes permitidos de la habilidad innovadora.
  - Entorno — archivos locales e investigación funcional de fuentes primarias. La primera valoración visual será humana.
  - Evidencia — pendiente de ejecución.

- [ ] **T3. Crear C y D y sus cápsulas.** RF-1, RF-2, RF-3, RF-4, RF-7
  - Dependencias — T2, por continuidad de la única autoría.
  - Alcance — `round-1/C.html`, `D.html`, `capsules/C.md`, `capsules/D.md` y sus recursos tipográficos.
  - Hecho cuando las dos propuestas estén completas, utilicen el texto común y tengan premisas y decisiones propias documentadas desde el inicio.
  - Comprobación — inspección de fuente, texto, licencias y trazabilidad de las decisiones. Conservar independencia de composición y de reglas respecto a la pareja anterior.
  - Entorno — archivos locales y fuentes primarias de licencias. Revisión de fuente por el agente y valoración visual posterior por el usuario.
  - Evidencia — pendiente de ejecución.

- [ ] **T4. Crear E y F y sus cápsulas.** RF-1, RF-2, RF-3, RF-4, RF-7
  - Dependencias — T3.
  - Alcance — `round-1/E.html`, `F.html`, `capsules/E.md`, `capsules/F.md` y sus recursos tipográficos.
  - Hecho cuando cada propuesta tenga documento completo, texto común y cápsula de decisiones y licencia, derivada de su propia premisa.
  - Comprobación — inspección de fuente y contenido. Confirmar desde la fuente que los colores de texto declarados tienen roles en contenido significativo y que el fondo es plano.
  - Entorno — archivos locales y fuentes primarias de licencias. La composición y legibilidad quedan para valoración humana.
  - Evidencia — pendiente de ejecución.

- [ ] **T5. Crear G y H y sus cápsulas.** RF-1, RF-2, RF-3, RF-4, RF-7
  - Dependencias — T4.
  - Alcance — `round-1/G.html`, `H.html`, `capsules/G.md`, `capsules/H.md` y sus recursos tipográficos.
  - Hecho cuando cada propuesta tenga una premisa propia desarrollada en un documento completo y conserve el texto común y su cápsula operativa.
  - Comprobación — inspección de fuente, contenido y licencias. Revisar la documentación de jerarquía, alineación, márgenes, espaciado y tratamiento de números sin emitir una valoración estética automática.
  - Entorno — archivos locales e investigación tipográfica funcional según la habilidad.
  - Evidencia — pendiente de ejecución.

- [ ] **T6. Crear I y J y sus cápsulas.** RF-1, RF-2, RF-3, RF-4, RF-7
  - Dependencias — T5.
  - Alcance — `round-1/I.html`, `J.html`, `capsules/I.md`, `capsules/J.md` y sus recursos tipográficos.
  - Hecho cuando las diez propuestas estén completas y las últimas dos tengan premisas independientes y decisiones registradas. El conjunto incluirá usos justificados de uno, dos, tres y cuatro colores de texto.
  - Comprobación — inspección de fuente y cápsulas, con inventario de fuentes y licencias. La cobertura de colores no se utiliza como plantilla para generar composiciones.
  - Entorno — archivos locales e investigación funcional de recursos.
  - Evidencia — pendiente de ejecución.

- [ ] **T7. Verificar la fuente del conjunto y entregar el acceso neutral.** RF-1, RF-2, RF-3, RF-4, RF-5
  - Dependencias — T2 a T6.
  - Alcance — `round-1/index.html`, fuente de A–J, recursos y registro de entrega en esta spec.
  - Hecho cuando los diez documentos estén enlazados como A–J con igual importancia, se haya comprobado el contenido común y se entregue el conjunto al usuario para su primera reacción, manteniendo las cápsulas fuera de la presentación inicial.
  - Comprobación — recorrer enlaces y rutas desde la fuente, comparar texto con `copy.txt` y revisar ausencia de ingredientes excluidos, SVG y exportaciones de imagen. Aplicar `references/VERIFICATION.md` de la habilidad innovadora. El agente se limita a la fuente y no abre ni renderiza las propuestas.
  - Entorno — archivos locales. El usuario abre los HTML. La entrega incluye la posibilidad de rechazar el conjunto y pedir otra ronda.
  - Evidencia — pendiente de ejecución y entrega.

- [ ] **T8. Registrar el compromiso y preparar el contexto para las pantallas.** RF-5, RF-6, RF-7
  - Dependencias — T7 y compromiso explícito de una dirección por el usuario.
  - Alcance — cápsula y HTML elegidos, `ROUND-2-CONTEXT.md` en la raíz, registro de decisiones de la spec y `MEMORY.md`.
  - Hecho cuando la dirección comprometida y sus correcciones humanas estén registradas, se conserve su original y el contexto detalle reglas tipográficas, color, espacio, adaptación móvil y estados, junto con sus límites de prueba para 005.
  - Comprobación — cotejar la decisión explícita, la cápsula original y el contexto. Verificar procedencia, licencias y distinción entre elección visual y comprobación del producto real.
  - Entorno — archivos locales después de la respuesta humana. La tarea documental tiene un alcance de aproximadamente 20–30 minutos desde que exista esa decisión.
  - Evidencia — pendiente del compromiso y de la preparación del contexto.

## Decisiones humanas y continuidad

La espera de una reacción o elección tiene duración humana y no se contabiliza
como tiempo de ejecución de una tarea. Una preselección no satisface T8. Después
de T7 se presentan las cápsulas de las propuestas que el usuario quiera considerar.
Los ajustes que solicite antes de comprometer una dirección conservan los límites
de la exploración y se registran con su alcance.

Si el usuario rechaza el conjunto, se registra la reacción y T8 permanece pendiente.
Una ronda adicional se prepara cuando la solicite, conservando la ronda anterior
y actualizando el desglose de esa iteración con su alcance y evidencia. Este listado
no cuenta una ronda todavía no solicitada como realizada ni elegida.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                        |
| ---------------------------------- | ------------------------------ | ---------- | --------------------------------------- |
| Tareas e inicio de implementación  | Aprobada por el usuario        | 2026-11-11 | Implementación de las tareas de 001–004 |
| Implementación y paso a validación | Pendiente                      | —          | —                                       |

## Entrega

Ocho tareas pendientes. El conjunto creativo, su valoración visual, el compromiso
y el contexto de traducción se registrarán con evidencia distinta. Las pantallas
reales y la guía posterior a su aceptación pertenecen a la spec 005.
