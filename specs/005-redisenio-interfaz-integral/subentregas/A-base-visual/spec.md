# Subentrega 005-A — Base visual, acceso y estados generales

Estado del documento — desglose derivado del alcance aprobado de 005
Fase actual — tareas, con implementación pendiente

## Contexto y objetivo

Reglas de la dirección comprometida, componentes de presentación compartidos, navegación, acceso, recuperación y estados de carga, error y conexión.
La división en A, B y C fue aprobada por el usuario el 11 de noviembre de 2026.
Este documento delimita una parte de la [spec 005](../../spec.md) y conserva sus
requisitos originales. La terminación de una parte no completa por sí sola 005.

## Usuarios y actores

Personas que acceden a la aplicación y navegan con rol USER o ADMIN y persona responsable que evalúa la aplicación del lenguaje visual.

## Historias de usuario heredadas

- HU-4. Como persona que usa teclado, zoom o tecnología de asistencia, quiero poder completar los recorridos principales.

## Requisitos heredados y cobertura

Los identificadores RF conservan la numeración de 005. Su texto procede de la
spec aprobada y se aplica aquí al área delimitada por la tabla de cobertura.
Los restantes aspectos de cada RF se completan en las otras subentregas.

- RF-1. CUANDO una persona navegue por acceso, recuperación de acceso, resumen, registro, historial, reportes, perfil, administración o estado sin conexión, EL SISTEMA aplicará la dirección visual comprometida y mantendrá una jerarquía consistente de acciones y contenido.
- RF-3. CUANDO una persona registre o edite su jornada, EL SISTEMA mostrará los datos introducidos, su efecto sobre el saldo y el resultado de confirmación o error junto a la acción correspondiente.
- RF-5. CUANDO un administrador gestione personas, horarios o correcciones, EL SISTEMA mantendrá accesibles las acciones autorizadas y mostrará confirmaciones, errores y consecuencias pertinentes a cada operación.
- RF-6. CUANDO el contenido esté cargando, vacío, en error, confirmado o sin conexión, EL SISTEMA mostrará el estado y las acciones disponibles sin perder los valores del formulario por un error de validación o de red.
- RF-7. CUANDO una persona utilice móvil, escritorio, teclado o ampliación del contenido, EL SISTEMA permitirá completar los recorridos principales y reconocer foco, campos, errores y estados sin depender exclusivamente del color.

| RF original | Porción cubierta en esta subentrega                   |
| ----------- | ----------------------------------------------------- |
| RF-1        | Acceso, recuperación, navegación y estados generales  |
| RF-3        | Presentación compartida de mensajes que reutilizará B |
| RF-5        | Navegación y acciones de cuenta por rol               |
| RF-6        | Estados generales y formulario de login               |
| RF-7        | Teclado, foco, reflow y evaluación del área A         |

## Dependencias

La aplicación de apariencia requiere el compromiso de 004 y ROUND-2-CONTEXT.md. La referencia previa de A/T1 puede capturarse antes de aplicar esa apariencia.
Las reglas comunes de datos, compatibilidad, accesibilidad y verificación de
[005](../../spec.md) y su [plan](../../plan.md) se heredan para todos los trabajos.

## Casos límite y requisitos no funcionales

Se comprueban los casos de 005 que afectan a esta área, incluidos datos vacíos,
texto largo, deuda, cero y crédito cuando se presentan saldos, cuentas de roles
diferentes, errores, reintentos, teclado, reflow y movimiento reducido.
Los estados aplicables y su evidencia se concretan en [tasks.md](tasks.md).
La fecha de corte y las cuentas de cálculo proceden de 001–003 cuando corresponda.
La base remota conserva su restricción de lectura.

## Fuera de alcance

Las otras áreas de 005 se entregan en A, B o C según el índice de división.
Se conserva el fuera de alcance de la spec padre y no se añaden módulos o políticas.

## Criterios de finalización

- Las 8 tareas de esta subentrega tienen evidencia satisfactoria del área definida.
- Los hallazgos y comprobaciones humanas pendientes permanecen identificados.
- La evidencia está vinculada al RF original en el informe común de 005.
- Los checkpoints humanos y la aprobación de validación conservan su alcance propio.

## Dudas abiertas

La dirección de 004 y sus checkpoints humanos se mantienen como dependencias
conocidas. Esta extracción documental no introduce decisiones de producto nuevas.

## Aprobaciones y trazabilidad

Especificación, clarificación y plan de 005 fueron aprobados previamente.
La materialización documental de esta división fue aprobada el 11 de noviembre de 2026.
Estas aprobaciones se conservan en los documentos padre y no acreditan ejecución
ni sustituyen la aprobación pendiente de implementación de 005.

## Validación y cierre

Todos los RF y tareas de esta subentrega están pendientes de implementación y verificación.
