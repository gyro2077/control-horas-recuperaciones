# Plan de Spec 004 — Dirección visual

Estado del plan — aprobado
Referencia — [spec.md](spec.md), especificación y clarificación aprobadas el 11 de noviembre de 2026.

## Alcance y dependencias

Este plan prepara la exploración y la elección de la dirección que consumirá la
spec 005. La aprobación del plan autoriza su posterior desglose en tareas.
El trabajo creativo comenzará cuando se aprueben las tareas y su implementación.
El contexto funcional de 001–003 es suficiente para explorar sin esperar su código.
La elección visual y las verificaciones del producto real se registran por separado.

Se aplican `bencium-innovative-ux-designer` y sus referencias de aislamiento,
rondas y verificación. Una sola autoría crea las diez propuestas. Los agentes
de planificación y revisión comprueban el alcance documental y los archivos,
sin producir alternativas creativas ni votar sobre su calidad visual.

## Archivos y responsabilidades

Las rutas siguientes son entregables planificados, que se crearán en las fases correspondientes.

| Archivo                                                      | Responsabilidad                                                                                                     | RF cubiertos     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `design/004-direccion-visual/evidence.md`                    | Registrar propósito, evidencia del producto, límites de fuentes, necesidades tipográficas y procedencia de recursos | RF-2, RF-3, RF-7 |
| `design/004-direccion-visual/copy.txt`                       | Conservar un único texto de trabajo en español para comparar las diez propuestas                                    | RF-2             |
| `design/004-direccion-visual/round-1/A.html` a `J.html`      | Diez documentos autónomos, cada uno desarrollado desde una premisa propia                                           | RF-1, RF-2, RF-3 |
| `design/004-direccion-visual/round-1/index.html`             | Enlaces neutrales A–J, sin jerarquizar ni modificar las propuestas                                                  | RF-1, RF-4       |
| `design/004-direccion-visual/round-1/capsules/A.md` a `J.md` | Registrar decisiones y contexto de cada propuesta, reservados hasta la primera reacción del usuario                 | RF-3, RF-4, RF-7 |
| `design/004-direccion-visual/round-1/fonts/`                 | Fuentes locales con licencia y procedencia verificadas cuando su uso y redistribución lo permitan                   | RF-3, RF-7       |
| `ROUND-2-CONTEXT.md`                                         | Tras el compromiso explícito, conservar la cápsula elegida, correcciones humanas, reglas y límites para 005         | RF-6, RF-7       |
| `specs/004-direccion-visual/spec.md`                         | Registrar reacciones, selección, compromiso y evidencia de cada RF                                                  | RF-1 a RF-7      |
| `MEMORY.md`                                                  | Mantener la decisión vigente y el siguiente paso sin reproducir las diez cápsulas                                   | RF-5, RF-6       |

La guía final `STYLEGUIDE.html` pertenece al plan 005 y se produce tras la aceptación
de las pantallas. La cápsula comprometida de 004 aporta sus reglas de entrada.

## Lógica y procedimiento

Esta spec produce documentos visuales y decisiones humanas. Su lógica consiste
en estados del trabajo, sin cálculos de saldo ni acceso a datos de personas.

```text
Registrar evidencia del problema y un único texto de trabajo.
Derivar requisitos tipográficos de idioma, números, lectura y uso.
Investigar únicamente fuentes compatibles y sus licencias.
Para cada letra A–J, comenzar un documento nuevo desde su propia premisa.
Guardar al mismo tiempo su cápsula de decisiones, fuera de la presentación inicial.
Comprobar únicamente el código fuente y los enlaces del conjunto.
Entregar los diez HTML con acceso neutral para la primera valoración humana.
Registrar la reacción sin convertir una preselección en compromiso.
Si se descartan todas, registrar motivos y esperar la petición de otro conjunto.
Si se compromete una dirección, conservar su HTML y cápsula originales.
Crear ROUND-2-CONTEXT.md con la elección y las correcciones explícitas.
Entregar las reglas y los puntos de comprobación pendientes a la spec 005.
```

El texto común usará el nombre del producto, los términos aprobados de saldo y
ejemplos ficticios identificables como tales. Las frases facilitadas expresamente
por el usuario se conservan. Las cifras ilustrativas no se presentan como sus datos.

## Presentación e interacción

- La primera entrega ofrece documentos HTML A–J con igual importancia. El índice tiene enlaces de texto neutrales.
- Cada propuesta utiliza solo tipografía, un fondo plano, colores de texto y espacio. Los elementos de control reales se construyen en 005.
- Las propuestas comparten el contenido, con composiciones independientes. El conjunto cubre sistemas de uno, dos, tres y cuatro colores de texto con funciones legibles.
- La primera reacción visual corresponde al usuario que abre los archivos. El agente verifica únicamente su fuente durante esta ronda, conforme a la habilidad.
- Las cápsulas se revelan para las propuestas que el usuario quiera considerar después de esa primera reacción.
- La pregunta de decisión distingue preselección, petición de ajustes, rechazo del conjunto y compromiso explícito.
- Las reglas comprometidas describen jerarquía de números y texto, espacios, adaptación a móvil y tratamiento previsto de estados. Su comportamiento real se comprueba en 005.

## Decisiones técnicas

| Decisión                                     | Justificación y alternativa considerada                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML y CSS autónomos para A–J                | Permiten valoración directa sin acoplar la exploración a componentes existentes. Reutilizar la pantalla actual como plantilla sesgaría la comparación               |
| Un solo texto común                          | Hace comparables jerarquía y composición. Textos distintos impedirían atribuir diferencias a la propuesta visual                                                    |
| Cápsulas escritas junto a los HTML           | Conservan reglas para traducir la dirección elegida. Reconstruirlas después dependería de interpretaciones nuevas                                                   |
| Investigar fuentes por requisitos y licencia | La habilidad exige una búsqueda independiente con procedencia verificable. La disponibilidad en el sistema se reserva como respaldo técnico                         |
| Recursos locales cuando estén permitidos     | Evitan dependencias de ejecución y permiten servir las propuestas localmente. La descarga o compra de fuentes restringidas requiere la autorización correspondiente |
| `ROUND-2-CONTEXT.md` como contrato con 005   | Centraliza una dirección comprometida. Los tokens y componentes se derivan después de esa elección                                                                  |

Las restricciones de fuentes de la habilidad se respetan durante la exploración,
incluida la exclusión de catálogos visuales contemporáneos y Google Fonts como
entradas creativas. La búsqueda de licencias y compatibilidad se limita a fuentes
primarias. Las paletas, familias y tamaños concretos se decidirán en la exploración.

## Datos y compatibilidad

- El conjunto usa contenido de trabajo y ejemplos ficticios. No requiere leer la base, crear sesiones ni ejecutar operaciones de registro.
- Una repetición solicitada conserva la ronda anterior y registra un conjunto nuevo con su propia evidencia. La nueva numeración de ronda se asigna en ese momento.
- La actualización del compromiso se apoya en una decisión explícita del usuario y conserva las correcciones previas en su historial.
- La ronda exploratoria no genera ni modifica SVG ni exportaciones de imagen. Las dependencias y recursos de la interfaz existente se evalúan en 005 después de la elección.
- La revisión de fuentes no acredita legibilidad o independencia visual. Esas valoraciones quedan registradas como decisiones humanas.
- Una incompatibilidad de licencia o accesibilidad detectada se presenta con su evidencia antes de adoptar el recurso afectado.

## Estrategia de verificación

| RF   | Comprobación y evidencia                                    | Procedimiento y entorno                                                                                                   |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| RF-1 | Diez archivos completos y acceso neutral                    | Inspección de fuente de A–J e índice local, seguida de apertura por el usuario                                            |
| RF-2 | Mismo contenido y términos de tiempo en las diez propuestas | Comparar texto extraído de los HTML con `copy.txt`, conservando orden variable y repeticiones intencionales               |
| RF-3 | Decisiones independientes documentadas y valoración humana  | Revisar que existan las diez cápsulas. Registrar la reacción visual del usuario sin atribuirle resultados de herramientas |
| RF-4 | Ausencia de explicaciones o favoritas en la primera entrega | Revisar fuente, índice y mensaje de entrega. Las cápsulas permanecen fuera de esos enlaces iniciales                      |
| RF-5 | Rechazo o solicitud de nueva ronda registrado               | Comprobar la respuesta real del usuario y el alcance de su siguiente petición                                             |
| RF-6 | Compromiso explícito y cápsula original preservados         | Revisar decisión, fecha, dirección y contenido de `ROUND-2-CONTEXT.md`                                                    |
| RF-7 | Reglas y límites entregados a 005                           | Cotejar la cápsula comprometida con el documento de contexto y sus condiciones pendientes                                 |

En la ronda exploratoria se comprueban además tipos de archivo, rutas de fuentes,
licencias, ausencia de recursos o efectos excluidos y cobertura de colores de texto
desde el código. El agente no abrirá ni renderizará A–J para juzgarlos. No se usarán
capturas, navegador automatizado, auditorías de pantallas ni pruebas de interfaz
como sustitución de la primera valoración humana.

Las comprobaciones de archivos y formato se realizan con herramientas disponibles,
sin añadir un ejecutor de pruebas ni un script permanente para este entregable.
No hay fallos de lógica preexistente que impidan comprobar estos documentos.
La guía de estilo y la validación visual de pantallas reales continúan en 005.

## Aprobación

Aprobado por el usuario el 11 de noviembre de 2026 mediante «apruebo»,
con alcance a los cinco planes presentados y su desglose en tareas.
La elección visual y la implementación conservan sus aprobaciones correspondientes.
