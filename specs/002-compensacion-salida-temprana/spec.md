# Spec 002 — Compensación al salir temprano

Estado de la spec — aprobada
Fase actual — tareas

## Contexto y objetivo

Una persona con horas adelantadas necesita que una salida temprana consuma ese
saldo y deje claro si conserva crédito o genera deuda. La jornada reducida debe
conservar las horas realmente trabajadas y distinguir el tiempo compensado del
faltante pendiente. El objetivo es que el registro confirmado explique esa
compensación sin presentar como ausencia pendiente los minutos cubiertos.

## Usuarios y actores

- Persona usuaria que confirma los tiempos reales de su jornada.
- Administrador que consulta o corrige una jornada y necesita entender su compensación.

## Historias de usuario

- HU-1. Como persona usuaria, quiero que salir antes utilice mis horas adelantadas para compensar el tiempo que ya trabajé.
- HU-2. Como persona usuaria, quiero saber qué saldo queda después de confirmar mi jornada para planificar los días siguientes.
- HU-3. Como administrador, quiero distinguir trabajo, compensación y faltantes pendientes al revisar una jornada.

## Definiciones

- **Faltante de la jornada** es la diferencia positiva entre minutos esperados y realmente trabajados.
- **Crédito previo** es el saldo a favor consolidado antes de la fecha de esa jornada.
- **Tiempo compensado** es la parte del faltante cubierta por el crédito previo.
- **Faltante pendiente** es la parte del faltante que excede el crédito previo disponible.
- **Registro confirmado** contiene tiempos reales comunicados por la persona, conservando su jornada única por fecha.

## Dependencias y decisiones confirmadas

Depende de las definiciones y la coherencia de saldos de
[Spec 001](../001-horas-adelantadas/spec.md). Su consumo automático continuo fue
confirmado por el usuario el 10 de noviembre de 2026. El conjunto de esta spec
se aprobó para revisión QA el 11 de noviembre de 2026.

El usuario confirmó permitir una jornada completa compensada, sin asistencia,
si el crédito previo cubre todos sus minutos esperados. También confirmó
mantener horas completas y medias horas al elegir entrada y salida y ampliar
el límite de salida. El 11 de noviembre de 2026 fijó ese máximo en las 20:00
del mismo día, inclusive.

El 11 de noviembre de 2026 el usuario confirmó usar el descanso del horario como
valor inicial y permitir indicar el descanso realmente tomado. Ese valor efectivo
se utiliza tanto al registrar como al simular los tiempos de una jornada.

La consulta orientativa previa a confirmar pertenece a
[Spec 003](../003-recomendacion-de-salida/spec.md).

## Requisitos funcionales

- RF-1. CUANDO la persona confirme una jornada con menos minutos trabajados que los esperados, EL SISTEMA determinará el faltante diario y el crédito consolidado anterior a esa fecha.
- RF-2. SI existe crédito previo, ENTONCES EL SISTEMA compensará automáticamente el menor valor entre ese crédito y el faltante de la jornada y mostrará el crédito restante.
- RF-3. SI la jornada efectiva tiene minutos esperados mayores que cero y el crédito previo cubre todo el faltante, ENTONCES EL SISTEMA permitirá confirmar la jornada compensada sin deuda, incluso con cero minutos trabajados cuando el crédito cubra la jornada completa.
- RF-4. CUANDO una jornada use crédito, EL SISTEMA distinguirá tiempo compensado y faltante pendiente, aplicará las reglas vigentes de motivos al faltante pendiente y conservará los motivos reales o voluntarios ya registrados como explicación independiente del saldo.
- RF-5. CUANDO se registre una compensación, EL SISTEMA conservará los minutos realmente trabajados y los minutos esperados de la jornada y evitará sumar el tiempo compensado como trabajo adicional de ese día.
- RF-6. CUANDO se corrija una jornada ya registrada, EL SISTEMA reemplazará su contribución anterior, recalculará la compensación cronológica y mantendrá una sola jornada para esa persona y fecha.
- RF-7. SI existe tiempo adelantado generado después de la fecha de la jornada evaluada, ENTONCES EL SISTEMA lo excluirá del crédito previo utilizado para clasificar la compensación de esa jornada.
- RF-8. CUANDO se consulte la jornada confirmada en resumen, historial o reportes, EL SISTEMA distinguirá faltante diario, tiempo compensado y deuda pendiente con valores coherentes con el saldo acumulado.
- RF-9. CUANDO se prepare una jornada con entrada y salida, EL SISTEMA propondrá el descanso configurado en su horario y permitirá sustituirlo por los minutos realmente tomados, usando ese valor al calcular el trabajo efectivo y la compensación.
- RF-10. SI el descanso informado es negativo, fraccionario o igual o superior al intervalo entre entrada y salida, ENTONCES EL SISTEMA mostrará el error e impedirá confirmar esos tiempos hasta corregirlos.
- RF-11. CUANDO se consulte o edite una jornada existente con entrada o salida fuera de las nuevas franjas o del máximo horario, EL SISTEMA mostrará sus valores reales sin redondearlos ni recortarlos, conservará los campos horarios que la persona no modifique y aplicará las nuevas reglas únicamente a los valores de entrada o salida que introduzca o cambie.

## Requisitos no funcionales

- Los cálculos conservarán minutos enteros, orden cronológico y fecha civil de la persona.
- Las entradas y salidas nuevas o modificadas se elegirán en horas completas y medias horas. El máximo para una salida nueva o modificada será las 20:00 del mismo día, inclusive. Los tiempos ya registrados que se conserven sin cambios mantendrán su precisión y valor originales.
- Los minutos cubiertos por crédito no exigirán un motivo de permiso adicional.
- Los registros existentes y la información de permisos conservarán su significado salvo los ajustes de clasificación definidos y aprobados en esta spec.
- La confirmación y sus reintentos mantendrán un estado consistente y una sola jornada por persona y fecha.
- Las operaciones conservarán los permisos actuales para datos propios y correcciones administrativas.
- Los mensajes en español distinguirán trabajo efectivo, tiempo compensado y deuda.
- Al editar una jornada existente, el valor inicial de descanso será el ya registrado. El cambio se aplicará al confirmar la edición.
- Una jornada completa compensada, sin trabajo efectivo, tendrá cero minutos de descanso y no exigirá entrada ni salida.
- La consulta o una edición que conserve tiempos, descanso y trabajo efectivo mantendrá sus cálculos reales y su contribución al saldo. Si la persona modifica datos que afectan al trabajo efectivo, el recálculo utilizará los tiempos originales de los campos no modificados y los nuevos valores válidos de los modificados.
- La jornada efectiva se determina conservando los minutos esperados guardados en registros existentes. Una fecha que ahora figure como feriado o día no laborable no elimina esa información ni su contribución confirmada al saldo.

## Ejemplos verificables

| Esperado | Trabajado | Crédito previo | Compensado | Crédito restante | Faltante pendiente |
| -------- | --------- | -------------- | ---------- | ---------------- | ------------------ |
| 6 h      | 5 h       | 2 h            | 1 h        | 1 h              | 0 min              |
| 6 h      | 5 h       | 1 h            | 1 h        | 0 min            | 0 min              |
| 6 h      | 4 h       | 30 min         | 30 min     | 0 min            | 1 h 30 min         |
| 6 h      | 5 h       | 0 min          | 0 min      | 0 min            | 1 h                |
| 6 h      | 0 min     | 6 h            | 6 h        | 0 min            | 0 min              |

En la primera fila se conservan 5 h trabajadas y un saldo diario de −1 h. El
crédito anterior absorbe esa diferencia, por lo que la jornada no añade deuda.
Si después se corrige el trabajo de 5 h a 5 h 30 min, el consumo pasa de 1 h a
30 min y el crédito restante pasa a 1 h 30 min, sin una segunda jornada.

La jornada completa compensada conserva 0 min trabajados y saldo diario de −6 h.
Consume 6 h de crédito anterior sin inventar trabajo ni borrar motivos existentes.

Con una jornada esperada de 8 h, entrada a las 08:30, salida a las 16:30 y descanso
de 60 min, el trabajo efectivo es 7 h. Un crédito previo de 1 h cubre el faltante.
Si la persona indica 30 min de descanso real para ese mismo intervalo, se registran
7 h 30 min trabajadas y se consumen 30 min de crédito.

Una jornada existente de 08:15 a 20:15, con cero minutos de descanso, conserva
sus 12 h trabajadas al consultarla o cambiar únicamente su nota. Sus horas no se
convierten en 08:30 o 20:00. Si se cambia solo la salida a 20:00, se conserva
la entrada de 08:15 y se calculan 11 h 45 min de trabajo. Una nueva salida de
20:30 se rechaza por superar el máximo. La hora original de 20:15 puede
permanecer cuando la persona no la modifica.

## Casos límite

- Crédito previo cero, exacto, insuficiente o mayor al faltante.
- Faltante de jornada cero y día con tiempo adicional.
- Crédito que proviene de un período anterior y cruza mes o año.
- Corrección de una jornada que ya consumió crédito o tenía un permiso.
- Jornada histórica con crédito generado después de su fecha.
- Corrección de una jornada anterior que modifica compensaciones posteriores.
- Reintentos de confirmación y cambios simultáneos desde dos dispositivos.
- Crédito suficiente para cubrir una jornada completa sin asistencia.
- Jornada con motivo real o permiso voluntario que queda cubierta por crédito.
- Descanso predeterminado, descanso real de cero minutos, edición de descanso e intervalo que no admite el descanso indicado.
- Horario ausente, día no laborable y fecha futura según las reglas vigentes.
- Registros existentes con minutos distintos de 00 o 30, salida posterior a las 20:00 y edición de un solo campo horario.
- Consulta o cambio de nota sin alteración de los tiempos guardados, y cambio de descanso que conserva las horas originales.
- Fecha que hoy figura como feriado o no laborable pero tiene una jornada confirmada con minutos esperados guardados.

## Fuera de alcance

- Autorización laboral para salir temprano o faltar una jornada completa.
- Elección manual de una política alternativa de caducidad del crédito.
- Consumo duplicado de saldo mediante una cuenta independiente.
- Recomendación o reserva de una hora de salida, cubierta por la spec 003.
- Modificaciones de nómina y pago de horas extra.

## Criterios de finalización

- Todos los RF tienen evidencia satisfactoria para compensación completa, parcial, nula y correcciones.
- Un faltante cubierto no se presenta como deuda o ausencia pendiente.
- La clasificación de permisos y los saldos coinciden en las consultas de la jornada.
- Las comprobaciones acordadas en el plan están ejecutadas y sus resultados registrados.
- El usuario ha revisado el resultado y aprobado el cierre.

## Dudas abiertas

Las decisiones de continuidad del crédito, jornada completa compensada, franjas,
límite de salida y descanso fueron respondidas. La revisión QA puede identificar
otras dudas antes de aprobar las fases posteriores.

## Clarificación

Revisión QA realizada el 11 de noviembre de 2026. Se detectó un hallazgo P2
de compatibilidad entre las nuevas franjas de 30 minutos y el máximo de las
20:00 y los registros existentes que contienen otros minutos o salidas posteriores.

La aclaración incorporada en RF-11, requisitos no funcionales y ejemplos conserva
la visualización y los campos horarios originales no modificados, valida los
tiempos nuevos o modificados y evita ajustes silenciosos de datos previos.
La precisión del saldo y la fotografía de minutos esperados se conservan.

Aclaración incorporada y aprobada por el usuario el 11 de noviembre de 2026. La aprobación
original de especificación se mantiene en su historial con el alcance presentado
entonces. Esta incorporación documental no acredita implementación ni verificación
de los RF.

La segunda revisión QA confirmó resueltos los hallazgos y emitió un veredicto
documental aprobado. El usuario aprobó esta clarificación el 11 de noviembre de 2026.

## Aprobaciones

| Fase           | Decisión explícita del usuario             | Fecha      | Alcance aprobado                                                          |
| -------------- | ------------------------------------------ | ---------- | ------------------------------------------------------------------------- |
| Especificación | Aprobada por el usuario mediante «apruebo» | 2026-11-11 | Contenido presentado de las specs 001–005 y paso a revisión QA            |
| Clarificación  | Aprobada por el usuario mediante «apruebo» | 2026-11-11 | Aclaraciones QA incorporadas de las specs 001–005 y preparación de planes |

Aprobación del plan registrada el 11 de noviembre de 2026 mediante «apruebo».
El alcance aprobado permite su desglose en tareas.

## Validación y cierre

| RF           | Evidencia y comprobación      | Resultado |
| ------------ | ----------------------------- | --------- |
| RF-1 a RF-11 | Pendiente de plan y ejecución | Pendiente |

Veredicto y aprobación de cierre pendientes.
