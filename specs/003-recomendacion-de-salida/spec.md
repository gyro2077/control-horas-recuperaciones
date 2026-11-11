# Spec 003 — Recomendación y simulación de salida

Estado de la spec — aprobada
Fase actual — tareas

## Contexto y objetivo

Una persona con tiempo adelantado necesita saber cuánto trabajo le falta hoy y
a qué hora podría salir para aprovechar ese saldo. Consultar una propuesta debe
permitir entender sus condiciones y el efecto sobre el crédito antes de confirmar
la jornada. El objetivo es ofrecer una estimación basada en datos explícitos,
separada del registro real y presentada como orientación informativa.

## Usuarios y actores

- Persona usuaria que consulta una salida orientativa para su jornada actual.
- Administrador que interpreta las condiciones de la recomendación al asistir a un compañero, dentro de los permisos existentes.

## Historias de usuario

- HU-1. Como persona usuaria, quiero conocer mi primera salida posible sin deuda para aprovechar el tiempo que ya tengo a favor.
- HU-2. Como persona usuaria, quiero probar una salida distinta y ver el crédito que conservaría antes de decidir.
- HU-3. Como persona usuaria, quiero entender qué entrada, descanso y saldo se usaron para poder corregir los datos de la estimación.

## Definiciones

- **Recomendación** es una estimación de salida que satisface la jornada esperada después de aplicar el crédito previo disponible.
- **Simulación** es una consulta que evalúa tiempos propuestos y muestra sus resultados sin confirmar una jornada ni reservar saldo.
- **Saldo previo** es el saldo acumulado firmado y consolidado antes de la fecha simulada. Su parte positiva constituye el crédito previo y la magnitud de su parte negativa constituye la deuda previa.
- **Crédito previo** es la parte positiva del saldo previo disponible para compensar la jornada actual.
- **Deuda resultante** es la magnitud de la parte negativa del saldo acumulado que resultaría tras reemplazar la contribución de la jornada por la propuesta.
- **Sin nueva deuda por la jornada** significa que el resultado diario queda cubierto por trabajo estimado y crédito previo. Puede seguir existiendo deuda procedente de jornadas anteriores.
- **Datos de cálculo** son fecha y zona de la persona, minutos esperados, saldo previo firmado, crédito y deuda derivados, entrada considerada, descanso aplicable y salida propuesta cuando exista.
- **Salida válida propuesta** es un nuevo valor de salida que cumple las reglas de intervalo, descanso y límites horarios aprobados y se expresa en horas completas o medias horas. Los valores reales guardados conservan su precisión al mostrarse y al mantenerse sin cambios en una edición.
- **Jornada efectiva sin horas esperadas** es la que tiene cero minutos esperados aplicables a esa fecha. Se conservan los minutos esperados ya guardados en una jornada existente, aunque el calendario o el horario actuales hayan cambiado.

## Dependencias

Depende del saldo coherente de [Spec 001](../001-horas-adelantadas/spec.md) y de
la compensación confirmada definida en
[Spec 002](../002-compensacion-salida-temprana/spec.md).

La recomendación describe la consecuencia contable de los datos elegidos y no
representa una autorización laboral para retirarse.

El usuario confirmó mantener la selección en horas completas y medias horas,
ampliando el límite de salida hasta las 20:00 del mismo día, inclusive, según
su respuesta del 11 de noviembre de 2026. También confirmó que el crédito suficiente permite
compensar una jornada completa sin asistencia. Estas decisiones de producto
quedaron incorporadas al conjunto de la spec aprobado el 11 de noviembre de 2026.

El 11 de noviembre de 2026 el usuario confirmó que se propondrá el descanso del
horario y se permitirá introducir el realmente tomado. La recomendación y el
registro utilizarán el mismo descanso efectivo.

La especificación aprobada establece recomendar la salida que cumpla la jornada sin generar
nueva deuda. Si hay deuda previa, se muestra por separado la que siga pendiente,
sin obligar a recuperarla toda ese día. Ese criterio forma parte del contenido
aprobado por el usuario para revisión QA.

## Requisitos funcionales

- RF-1. CUANDO la persona consulte la recomendación de su jornada actual, EL SISTEMA mostrará los datos de cálculo y distinguirá cualquier valor programado o supuesto de un tiempo real confirmado.
- RF-2. CUANDO la jornada efectiva tenga minutos esperados mayores que cero y existan datos suficientes, EL SISTEMA indicará que la jornada completa puede compensarse si el crédito previo la cubre o, en otro caso, la primera salida válida que evita nueva deuda por la jornada tras aplicar ese crédito, respetando horario y descanso y mostrando cualquier deuda previa que continúe pendiente.
- RF-3. CUANDO la persona introduzca una salida propuesta válida, EL SISTEMA mostrará minutos trabajados estimados, faltante diario, crédito utilizado, crédito restante y deuda acumulada resultante después de aplicar esa propuesta al saldo previo firmado.
- RF-4. MIENTRAS se consulte o modifique una simulación, EL SISTEMA conservará intactos los registros confirmados y el saldo consolidado, sin consumir ni reservar crédito.
- RF-5. SI la jornada ya está registrada, ENTONCES EL SISTEMA excluirá su contribución anterior al calcular el crédito previo y evaluará la propuesta una sola vez.
- RF-6. SI existe crédito generado después de la fecha simulada, ENTONCES EL SISTEMA lo excluirá del saldo utilizado para recomendar o simular esa salida.
- RF-7. SI faltan datos necesarios o no existe una salida válida bajo las reglas aprobadas, ENTONCES EL SISTEMA explicará la condición que lo impide y evitará mostrar una hora de salida como si estuviera calculada.
- RF-8. CUANDO se presente una recomendación o simulación, EL SISTEMA identificará su carácter informativo, la fecha e instante de referencia del saldo y la necesidad de confirmar los tiempos reales para registrar la jornada.
- RF-9. CUANDO la persona prepare o cambie una simulación, EL SISTEMA mostrará el descanso considerado, propondrá el del horario para una jornada nueva y recalculará la salida y los saldos al indicar un descanso real distinto.
- RF-10. SI el descanso no es válido para los tiempos propuestos, ENTONCES EL SISTEMA identificará ese dato como error y evitará presentar la propuesta como una salida calculada válida.
- RF-11. SI la jornada efectiva tiene cero minutos esperados, ENTONCES EL SISTEMA mostrará el estado sin jornada esperada y conservará el crédito sin consumirlo, sin clasificar ese día como compensado ni proponer una hora de salida.
- RF-12. CUANDO se consulte la simulación de una jornada ya registrada con horas fuera de las nuevas franjas o del máximo horario, EL SISTEMA mostrará sus tiempos originales, trabajo real y saldo sin ajustarlos silenciosamente, conservará los campos horarios no modificados y explicará que los valores nuevos o modificados deben cumplir las nuevas franjas y el máximo de salida de las 20:00.

## Requisitos no funcionales

- Los resultados se expresarán en minutos enteros y en la fecha y zona horaria de la persona.
- Las entradas y salidas nuevas o modificadas y toda hora de salida recomendada se expresarán en horas completas o medias horas. Una salida nueva, modificada o recomendada tendrá como máximo las 20:00 del mismo día, inclusive. Los valores horarios heredados que permanezcan sin cambios y la precisión histórica de los saldos se conservarán.
- La misma combinación de datos de cálculo y referencia producirá el mismo resultado.
- Las consultas conservarán los permisos existentes y no modificarán datos de jornada, sesiones ni saldos.
- Las condiciones y resultados se mostrarán en español y podrán entenderse sin depender exclusivamente del color.
- Los datos supuestos, pendientes o desactualizados se identificarán antes de usar la recomendación para interpretar un saldo.
- Al simular la edición de una jornada registrada, se parte del descanso ya guardado. Las reglas de validación del descanso coinciden con la spec 002.
- El estado sin jornada esperada se determina por los minutos esperados efectivos de la fecha. En registros existentes se respeta su fotografía guardada y su contribución confirmada al saldo, aunque la fecha coincida con un feriado o día no laborable según el calendario actual.
- Un horario ausente o una entrada incompleta que impida calcular una jornada con horas esperadas se explicará como dato faltante según RF-7. Ese error se distinguirá del estado sin jornada esperada.

## Ejemplos verificables

Para estos ejemplos se considera una jornada esperada de 6 h, entrada a las
08:30, descanso aplicable de 0 min y salidas expresadas en horas completas o
medias horas. El máximo de salida es las 20:00. Se propone el descanso del horario
y puede sustituirse por el realmente tomado, según la decisión confirmada.

| Crédito previo | Salida propuesta | Trabajo estimado | Crédito utilizado | Crédito restante | Deuda resultante |
| -------------- | ---------------- | ---------------- | ----------------- | ---------------- | ---------------- |
| 2 h            | 13:30            | 5 h              | 1 h               | 1 h              | 0 min            |
| 1 h            | 13:30            | 5 h              | 1 h               | 0 min            | 0 min            |
| 30 min         | 13:30            | 5 h              | 30 min            | 0 min            | 30 min           |
| 0 min          | 14:30            | 6 h              | 0 min             | 0 min            | 0 min            |

Con 2 h de crédito previo y las condiciones anteriores, la primera salida que
evita nueva deuda sería 12:30 y consumiría esas 2 h. Cambiar la propuesta a 13:30
conservaría 1 h. Consultar ambas propuestas mantiene los registros y el crédito
consolidado sin cambios.

Con 6 h de crédito previo para una jornada esperada de 6 h, la recomendación
indicará que puede compensarse el día completo, sin inventar una entrada y una
salida. La confirmación real de esa jornada corresponde a la spec 002.

Con deuda previa de 1 h, crédito previo de 0 min y las condiciones de entrada
y descanso del ejemplo, salir a las 14:30 cumple las 6 h esperadas y conserva
1 h de deuda acumulada. La recomendación identifica esa deuda existente en vez
de presentar el resultado como saldo acumulado cero.

Si la jornada actual ya aportaba +1 h y el crédito anterior era 30 min, su edición
se simula con 30 min previos, sin sumar de nuevo esa hora que se está reemplazando.

Con una jornada esperada de 8 h, entrada a las 08:30 y crédito previo de 1 h, un
descanso de 60 min produce una recomendación de salida a las 16:30. Si se indican
30 min de descanso real, la recomendación pasa a las 16:00. Ambas propuestas
consumen 1 h de crédito al confirmarse con esos mismos tiempos reales.

En un día no laborable o feriado cuya jornada efectiva tenga 0 min esperados,
con crédito previo de 2 h, la consulta muestra que no hay jornada esperada y
conserva las 2 h. No ofrece una compensación de 0 min ni una salida recomendada.
Si esa misma fecha tiene una jornada ya confirmada con 6 h esperadas guardadas,
se conserva ese dato y su contribución al saldo al evaluar la jornada.

Al consultar una jornada registrada de 08:15 a 20:15 y descanso de 0 min, se
muestran sus 12 h reales y su saldo original. Una propuesta que cambie solo la
salida a 20:00 conserva la entrada de 08:15 y calcula 11 h 45 min de trabajo.
Una propuesta nueva de 20:30 resulta inválida. El sistema no transforma la salida
original de 20:15 en otra hora ni recomienda salidas posteriores a las 20:00.
Si la entrada heredada impide cualquier salida válida antes de ese máximo,
se explica que no hay salida válida bajo las nuevas reglas, conservando visibles
el registro y sus resultados originales.

## Casos límite

- Crédito cero, parcial, exacto o suficiente para una jornada completa.
- Saldo previo negativo y deuda anterior que permanece al cumplir la jornada actual.
- Saldo histórico con minutos que no sean múltiplos de 30, cuya recomendación debe respetar las medias horas sin crear deuda adicional.
- Entrada real distinta de la programada y entrada todavía no confirmada.
- Descanso configurado, descanso real distinto, descanso de cero minutos y descanso inválido para el intervalo elegido.
- Salida propuesta anterior o igual a la entrada, fuera del día o fuera de límites admitidos.
- Saldo o jornada que cambia en otro dispositivo después de consultar la recomendación.
- Día actual sin registro y jornada actual ya registrada o corregida.
- Día no laborable, feriado, horario ausente o datos de cálculo insuficientes.
- Día civil de la persona diferente del día UTC y cambios de zona horaria.
- Consulta alrededor de medianoche y de cambios de mes o año.
- Día efectivo de cero minutos esperados con crédito cero o positivo, sin una compensación ficticia de cero minutos.
- Registro confirmado en una fecha que el calendario actual trata como feriado o día no laborable.
- Tiempos heredados fuera de las nuevas franjas o del máximo horario, edición de un único campo y ausencia de una nueva salida válida antes de las 20:00.

## Fuera de alcance

- Aprobación laboral de la salida, reserva de crédito o confirmación automática de trabajo.
- Cronómetro, fichaje continuo o inferencia de trabajo efectivo a partir de la hora del reloj.
- Planificación de jornadas futuras o simulación libre de fechas históricas en esta versión.
- Reglas de pago de horas extra o transferencias entre personas.
- Confirmación del día completo compensado, cubierta por la spec 002.

## Criterios de finalización

- Todos los RF tienen evidencia satisfactoria con entradas, saldos, descansos e intervalos relevantes.
- La recomendación y la simulación coinciden con la compensación que produciría el registro de esos mismos tiempos reales.
- Se comprueba que consultar y cambiar propuestas conserva los registros y el saldo consolidado.
- Las comprobaciones acordadas en el plan están ejecutadas y sus resultados registrados.
- El usuario ha revisado el resultado y aprobado el cierre.

## Dudas abiertas

Las decisiones solicitadas sobre franjas, límite horario, jornada completa y
descanso fueron respondidas. La recomendación para el día actual y el criterio
de evitar deuda nueva forman parte de la especificación aprobada para revisión QA.

## Clarificación

Revisión QA realizada el 11 de noviembre de 2026. Se detectaron dos hallazgos P2.

1. La condición de RF-2 podía interpretar crédito de 0 min como suficiente para
   compensar una jornada de 0 min. Se precisó que RF-2 requiere minutos esperados
   efectivos mayores que cero y se incorporó RF-11 para mostrar el estado sin
   jornada esperada, sin consumo, compensación ni recomendación de salida.
   Esta distinción respeta las reglas de días no laborables y la fotografía
   diaria descritas en [las reglas de cálculo](../../docs/CALCULATION.md).
   Las fotografías de jornadas existentes y su contribución al saldo se conservan.
   El horario ausente o la entrada incompleta sigue el error específico de RF-7.
2. Las nuevas franjas y el máximo de las 20:00 podían contradecir la compatibilidad
   de registros con otros minutos o salidas posteriores. RF-12 y sus ejemplos
   conservan los valores originales y los campos no modificados, validan los
   tiempos nuevos o modificados y mantienen el máximo de las recomendaciones,
   sin recortar o redondear registros de forma silenciosa.

Aclaraciones incorporadas y aprobadas por el usuario el 11 de noviembre de 2026. La aprobación
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
| RF-1 a RF-12 | Pendiente de plan y ejecución | Pendiente |

Veredicto y aprobación de cierre pendientes.
