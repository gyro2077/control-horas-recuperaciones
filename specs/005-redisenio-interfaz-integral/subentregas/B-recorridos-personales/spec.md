# Subentrega 005-B — Recorridos personales

Estado del documento — desglose derivado del alcance aprobado de 005
Fase actual — tareas, con implementación pendiente

## Contexto y objetivo

Resumen, gráfico y equivalente textual, registro y simulación, historial, reportes y perfil, usando los contratos funcionales de 001–003.
La división en A, B y C fue aprobada por el usuario el 11 de noviembre de 2026.
Este documento delimita una parte de la [spec 005](../../spec.md) y conserva sus
requisitos originales. La terminación de una parte no completa por sí sola 005.

## Usuarios y actores

Personas usuarias que consultan sus datos y administradores que consultan datos autorizados de compañeros.

## Historias de usuario heredadas

- HU-1. Como persona usuaria, quiero reconocer mi saldo y la siguiente acción útil para organizar mi jornada.
- HU-2. Como persona usuaria, quiero registrar y corregir mis tiempos desde móvil o escritorio con información consistente.
- HU-4. Como persona que usa teclado, zoom o tecnología de asistencia, quiero poder completar los recorridos principales.

## Requisitos heredados y cobertura

Los identificadores RF conservan la numeración de 005. Su texto procede de la
spec aprobada y se aplica aquí al área delimitada por la tabla de cobertura.
Los restantes aspectos de cada RF se completan en las otras subentregas.

- RF-1. CUANDO una persona navegue por acceso, recuperación de acceso, resumen, registro, historial, reportes, perfil, administración o estado sin conexión, EL SISTEMA aplicará la dirección visual comprometida y mantendrá una jerarquía consistente de acciones y contenido.
- RF-2. CUANDO una persona consulte su resumen, EL SISTEMA distinguirá horas pendientes, recuperación de deuda y horas adelantadas disponibles y dará acceso a registrar jornada y consultar la salida anticipada.
- RF-3. CUANDO una persona registre o edite su jornada, EL SISTEMA mostrará los datos introducidos, su efecto sobre el saldo y el resultado de confirmación o error junto a la acción correspondiente.
- RF-4. CUANDO una persona consulte historial o reportes, EL SISTEMA presentará período, persona consultada, unidades y sentido del saldo con los mismos términos usados en el resumen.
- RF-6. CUANDO el contenido esté cargando, vacío, en error, confirmado o sin conexión, EL SISTEMA mostrará el estado y las acciones disponibles sin perder los valores del formulario por un error de validación o de red.
- RF-7. CUANDO una persona utilice móvil, escritorio, teclado o ampliación del contenido, EL SISTEMA permitirá completar los recorridos principales y reconocer foco, campos, errores y estados sin depender exclusivamente del color.

| RF original | Porción cubierta en esta subentrega                      |
| ----------- | -------------------------------------------------------- |
| RF-1        | Resumen, registro, historial, reportes y perfil          |
| RF-2        | Saldos y acceso a registro y simulación                  |
| RF-3        | Registro, edición, compensación y descanso               |
| RF-4        | Historial, selección, resultados y descargas de reportes |
| RF-6        | Errores y confirmaciones de recorridos personales        |
| RF-7        | Accesibilidad y reflow de recorridos personales          |

## Dependencias

Requiere la base visual de A y el compromiso de 004. El registro, la simulación y la integración final requieren los contratos de 001–003 operativos.
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

- Las 10 tareas de esta subentrega tienen evidencia satisfactoria del área definida.
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
