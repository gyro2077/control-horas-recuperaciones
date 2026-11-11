# Spec 001 — Horas adelantadas y saldo a favor

Estado de la spec — aprobada
Fase actual — tareas

## Contexto y objetivo

La persona registra jornadas y consulta cuánto le falta por cumplir, pero necesita
reconocer también el tiempo que ya tiene a favor. Actualmente el tiempo adicional
puede presentarse como recuperación aunque no exista deuda, y el resumen principal
no hace visible el crédito disponible. El objetivo es distinguir cuánto tiempo
adicional se trabajó, cuánto cubrió deuda anterior y cuánto queda disponible para
compensar jornadas posteriores, con un saldo coherente entre consultas.

## Usuarios y actores

- Persona usuaria que registra jornadas y consulta su propio saldo.
- Administrador que consulta saldos de compañeros y corrige jornadas dentro de sus permisos.

## Historias de usuario

- HU-1. Como persona usuaria, quiero conocer mis horas adelantadas para decidir si necesito seguir acumulando tiempo.
- HU-2. Como persona usuaria, quiero distinguir recuperación y adelanto para entender qué ocurrió con mis horas adicionales.
- HU-3. Como administrador, quiero consultar el mismo saldo en resumen, historial y reportes para explicar su origen.

## Definiciones

- **Saldo diario** es la diferencia entre minutos trabajados y minutos esperados de una jornada.
- **Saldo acumulado** es la suma cronológica de los saldos diarios finalizados desde el inicio de cómputo aplicable.
- **Deuda** es la magnitud de la parte negativa del saldo acumulado.
- **Tiempo adicional** es la parte positiva del saldo diario.
- **Recuperación** es la parte del tiempo adicional que cubre deuda existente antes de esa jornada.
- **Horas adelantadas o saldo a favor** son la parte positiva del saldo acumulado, disponible para compensar faltantes posteriores.
- **Fecha de corte** es el último día incluido al determinar un saldo.

## Dependencias y decisiones confirmadas

El usuario confirmó el 10 de noviembre de 2026 la acumulación continua sin caducidad
y el descuento automático cuando una jornada posterior quede por debajo de lo
esperado, incluso entre semanas y meses distintos. Esta decisión confirma esa
regla de producto. La aprobación del conjunto de la spec se registró el 11 de
noviembre de 2026 en la tabla de aprobaciones.

El usuario confirmó conservar la selección de entrada y salida en horas completas
y medias horas, ampliando el límite de salida para registrar tiempo adicional.
El usuario fijó el máximo de salida en las 20:00 del mismo día el 11 de noviembre
de 2026, inclusive. Los saldos conservan su
precisión de minutos enteros, incluidos registros históricos.

La compensación al registrar una jornada se desarrolla en
[Spec 002](../002-compensacion-salida-temprana/spec.md). La recomendación informativa
de salida se desarrolla en [Spec 003](../003-recomendacion-de-salida/spec.md).

## Requisitos funcionales

- RF-1. CUANDO se presente el resultado de una jornada confirmada o una propuesta de registro con saldo diario positivo, EL SISTEMA distinguirá el tiempo adicional, la parte aplicada a deuda anterior y la parte que aumenta el saldo a favor, identificando si el resultado está confirmado o es una estimación.
- RF-2. CUANDO la persona consulte su resumen, EL SISTEMA mostrará las horas adelantadas disponibles, la deuda existente y el estado de saldo cero mediante valores explícitos en horas y minutos.
- RF-3. SI existe deuda anterior al registrar tiempo adicional, ENTONCES EL SISTEMA aplicará primero ese tiempo a la deuda y reconocerá como adelanto únicamente el remanente.
- RF-4. CUANDO se complete una semana, un mes o un año, EL SISTEMA conservará el saldo a favor disponible sin reiniciarlo ni hacerlo caducar.
- RF-5. CUANDO una jornada posterior tenga saldo diario negativo, EL SISTEMA reducirá automáticamente el saldo a favor previo y reconocerá deuda solo por el faltante que supere ese saldo.
- RF-6. CUANDO se consulte a la misma persona con la misma fecha de corte en resumen, historial o reportes, EL SISTEMA mostrará el mismo saldo acumulado e incorporará el saldo anterior a la ventana visible.
- RF-7. CUANDO una jornada histórica sea corregida, EL SISTEMA recalculará su contribución y los saldos posteriores sin duplicar minutos ni alterar las horas realmente registradas en otras jornadas.
- RF-8. MIENTRAS un día futuro o una jornada actual sin finalizar carezca de un registro confirmado aplicable, EL SISTEMA evitará presentar sus horas estimadas como adelanto consolidado y mantendrá las reglas vigentes de finalización del día.

## Requisitos no funcionales

- Los cálculos conservarán minutos enteros y la fecha civil de la persona.
- Las consultas conservarán los permisos existentes para datos propios y de compañeros.
- La información distinguirá con texto las horas adelantadas, recuperadas y pendientes, además de cualquier color utilizado.
- Los datos existentes participarán del cálculo con las mismas reglas aplicables a los nuevos registros.
- La presentación seguirá en español y expondrá el origen y la fecha de corte del saldo consultado.

## Ejemplos verificables

| Saldo previo            | Saldo diario                  | Recuperación del día | Saldo a favor final | Deuda final |
| ----------------------- | ----------------------------- | -------------------- | ------------------- | ----------- |
| −1 h                    | +2 h                          | 1 h                  | 1 h                 | 0 min       |
| 0 min                   | +2 h                          | 0 min                | 2 h                 | 0 min       |
| +2 h                    | −1 h                          | 0 min                | 1 h                 | 0 min       |
| +30 min                 | −1 h 30 min                   | 0 min                | 0 min               | 1 h         |
| +2 h al terminar el mes | 0 min al iniciar el siguiente | 0 min                | 2 h                 | 0 min       |

Una consulta del segundo mes conserva el crédito del primero aunque sus jornadas
no aparezcan en la ventana visible. Si una jornada anterior cambia de +2 h a +1 h,
la diferencia de 1 h se refleja una sola vez en los saldos posteriores.

## Casos límite

- Persona sin registros, sin horario o con saldo exactamente cero.
- Tiempo adicional insuficiente, exacto o superior a una deuda anterior.
- Jornadas con faltantes menores, iguales o mayores al saldo a favor previo.
- Crédito generado en semanas, meses o años anteriores a la consulta.
- Ventanas de historial y reporte que comienzan después de la generación del crédito.
- Corrección retrospectiva que cambia un saldo positivo a negativo o viceversa.
- Jornada actual registrada, jornada actual en curso y fechas futuras.
- Fechas civiles distintas al día UTC y cambios de horario aplicables a registros históricos.

## Fuera de alcance

- Pago, liquidación o autorización laboral de horas adicionales.
- Transferencia de saldo entre personas o límites nuevos de acumulación.
- Una cuenta independiente que duplique el saldo acumulado.
- Registro de salidas compensadas y simulación de una hora de salida, cubiertos por las specs dependientes.
- Rediseño visual integral, que se especifica por separado.

## Criterios de finalización

- Todos los RF tienen evidencia satisfactoria con los ejemplos y límites relevantes.
- Resumen, historial y reportes coinciden para una misma persona y fecha de corte.
- Las comprobaciones acordadas en el plan están ejecutadas y sus resultados registrados.
- El usuario ha revisado el resultado y aprobado el cierre.

## Dudas abiertas

No quedan dudas sobre continuidad, caducidad o consumo automático del saldo.
Los límites operativos para registrar jornadas y proponer salidas se aclaran en
las specs 002 y 003 antes de su implementación.

## Clarificación

Revisión QA realizada el 11 de noviembre de 2026, sin hallazgos bloqueantes en
ambigüedades, contradicciones, límites o conflictos con la constitución.
El usuario aprobó esta clarificación el 11 de noviembre de 2026. Esta revisión
documental no acredita implementación ni validación de los RF.

## Aprobaciones

| Fase           | Decisión explícita del usuario             | Fecha      | Alcance aprobado                                                          |
| -------------- | ------------------------------------------ | ---------- | ------------------------------------------------------------------------- |
| Especificación | Aprobada por el usuario mediante «apruebo» | 2026-11-11 | Contenido presentado de las specs 001–005 y paso a revisión QA            |
| Clarificación  | Aprobada por el usuario mediante «apruebo» | 2026-11-11 | Aclaraciones QA incorporadas de las specs 001–005 y preparación de planes |

Aprobación del plan registrada el 11 de noviembre de 2026 mediante «apruebo».
El alcance aprobado permite su desglose en tareas.

## Validación y cierre

| RF          | Evidencia y comprobación      | Resultado |
| ----------- | ----------------------------- | --------- |
| RF-1 a RF-8 | Pendiente de plan y ejecución | Pendiente |

Veredicto y aprobación de cierre pendientes.
