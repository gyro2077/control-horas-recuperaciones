# Plan de Spec 002 — Compensación al salir temprano

Estado del plan — aprobado
Referencia — [spec.md](spec.md), especificación y clarificación aprobadas el 11 de noviembre de 2026.
Depende del saldo y contratos del [plan 001](../001-horas-adelantadas/plan.md).

## Archivos y responsabilidades

| Archivo                                                                                                                              | Cambio y responsabilidad                                                                          | RF cubiertos |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------ |
| `src/domain/time-balance-service.ts`                                                                                                 | Cálculo de intervalo con descanso efectivo y validación de campos horarios cambiados              | 5, 9–11      |
| `src/domain/balance-range-service.ts`                                                                                                | Derivar crédito usado, faltante descubierto y clasificación financiera diaria                     | 1–8          |
| `src/server/services/daily-entry-service.ts`                                                                                         | Resolver jornada efectiva, confirmar compensación y corregir dentro de transacción con reintentos | 1–11         |
| `src/server/services/balance-query-service.ts`                                                                                       | Leer con el cliente transaccional y exponer la compensación derivada                              | 1–8          |
| `src/app/api/daily-entries/route.ts`                                                                                                 | Validar forma de entrada, descanso y nuevo modo de día compensado, conservar respuesta            | 1–7, 9–11    |
| `src/app/api/daily-entries/[id]/route.ts`                                                                                            | Delegar corrección administrativa al servicio transaccional conservando RBAC                      | 6, 8         |
| `src/app/api/daily-entries/schedule/route.ts`                                                                                        | Entregar fotografía, descanso, saldo previo y versión de registro                                 | 1, 9, 11     |
| `src/components/registration/daily-entry-form.tsx`                                                                                   | Registro compensado, descanso editable y opciones heredadas visibles                              | 2–5, 9–11    |
| `src/components/dashboard/daily-quick-register.tsx`, `src/app/(protected)/historial/page.tsx`                                        | Etiquetas de compensación y motivo explicativo independiente                                      | 3, 8         |
| `src/components/forms/report-form.tsx`, `src/server/export/report-data.ts`, `src/server/export/excel.ts`, `src/server/export/pdf.ts` | Mostrar falta diaria, compensación y faltante pendiente con crédito al cierre                     | 4, 8         |
| `tests/unit/time-balance-service.test.ts`, `tests/unit/balance-range-service.test.ts`                                                | Intervalos, legado y clasificación con datos puros                                                | 1–11         |
| `tests/integration/application-flows.test.ts`                                                                                        | Confirmación, permisos, reintentos y dos escrituras concurrentes                                  | 1–11         |

## Contratos y compatibilidad de llamadas

`getScheduleForDate(userId, date, options?)` conservará sus argumentos actuales y resultado
existente. `options` acepta `now` y `client` para lectura desde una misma transacción.
Resolverá primero la jornada existente y su `scheduledMinutes`; solo una jornada nueva
dependerá de un horario actual activo. Los campos originales se usan aunque el calendario
actual clasifique esa fecha de otra forma. Se conservan los errores de datos faltantes.
`view` añadirá `balanceBeforeDateMinutes`, `calculatedAt` y `timezone`.
`existingEntry` añadirá `breakMinutes` y `updatedAt`, conservando los demás campos.

`DailyEntryInput` conservará SCHEDULED, CUSTOM, DIFFERENT, RECOVERY y PERMISSION.
Los modos con horas admitirán `breakMinutes?` y `expectedUpdatedAt?` como campos opcionales.
La omisión del descanso resolverá el guardado al editar o el configurado al crear.
Se añade `COMPENSATED`, con `date` y nota opcional, para una jornada completa cubierta
por crédito. No exige horas ficticias ni un motivo de permiso.
Las entradas de modos antiguos conservan su estructura y los errores se mantienen
mediante `AppError` y `errorResponse`; las reglas nuevas autorizadas se aplican a sus valores nuevos.

La validación HTTP comprobará forma, tipos y reloj `HH:mm` sin rechazar primero un valor
heredado. El servicio compara cada campo contra su valor guardado y valida franjas de
30 min y salida máxima 20:00 solo al crear o cambiar ese campo. El intervalo resultante
siempre debe ser válido y permanecer en el mismo día. Un timestamp original no modificado
se conserva exactamente, incluida su precisión, en lugar de reconstruirlo desde una etiqueta.

`TimeBalanceService` reutilizará `calculateWorkedMinutes` y añadirá el cálculo de intervalo
editable con originales opcionales y descanso efectivo explícito. Las firmas públicas
actuales conservarán sus argumentos previos mediante parámetros opcionales.
El flujo vigente dejará de inventar el descanso mínimo de 30 min. Los llamadores del
registro resolverán el descanso configurado o realmente informado conforme a la spec.

## Lógica y algoritmo

```text
capturar now una vez y autorizar actor sobre usuario objetivo
reintentar transacción Serializable, máximo tres intentos:
  establecer barrera por usuario con UPDATE parametrizado de id sobre su mismo valor
  leer usuario, horario y jornada existente con el cliente de esa transacción
  resolver esperado efectivo desde fotografía existente o horario del día
  leer saldo previo hasta fecha - 1, excluyendo esa fecha y fechas posteriores
  si modo COMPENSATED:
    exigir esperado > 0 y crédito previo >= esperado
    trabajado = 0; entrada = salida = null; descanso = 0
  si no, si modo PERMISSION:
    validar minutos trabajados declarados según sus reglas vigentes
    usar esos minutos, o cero cuando se declara día completo
    entrada = salida = null; descanso = 0
  si no, para modos con horas:
    conservar horas y descanso originales cuando no cambian
    validar horas introducidas y calcular trabajo con descanso efectivo
  movimiento = calculateBalanceMovement(saldoPrevio, trabajado - esperado)
  resolver permiso explicativo y escribir una sola jornada por usuario/fecha
  devolver jornada y compensación derivada desde la misma fotografía de lectura
si agota reintentos, responder conflicto recuperable y solicitar actualizar datos
```

Los reintentos atienden conflictos de serialización `P2034` o `40001` y la carrera de
unicidad de usuario/fecha `P2002`, sin repetir errores de validación o autorización.
La operación escribe valores absolutos. Repetir un payload cuyo resultado ya coincide
devuelve la jornada existente sin sumar consumos ni añadir otra nota administrativa.
Si una edición incluye `expectedUpdatedAt`, un cambio concurrente incompatible devuelve
conflicto antes de sobrescribirlo; una repetición idéntica ya aplicada se reconoce como tal.
Las llamadas existentes sin versión conservan la semántica de reemplazo del mismo día.
La corrección administrativa se mueve a `correctDailyEntry` y usa el mismo núcleo
transaccional y reintentos, manteniendo su validación de administrador y motivo.

El saldo previo se lee dentro de la transacción de confirmación, después de la barrera
propuesta `UPDATE "User" SET "id" = "id" WHERE "id" = $1::uuid`, con parámetro enlazado.
El cambio de versión física de esa fila fuerza un conflicto y una nueva fotografía
en un escritor Serializable concurrente del mismo usuario, aunque escriban fechas distintas.
Se conservan todos sus valores lógicos y `updatedAt`. Todos los escritores relevantes
de jornadas, incluida `correctDailyEntry`, pasan por esa misma barrera antes de leer saldo.
Un `SELECT FOR UPDATE` aislado sin nueva versión no sustituye esta garantía de fotografía.

La barrera es una decisión de diseño que se comprobará con escritores concurrentes
en la base aislada. Se apoya en el conflicto de actualización del aislamiento de
PostgreSQL y en que `UPDATE` también procesa filas cuyo valor asignado no cambia.
[Aislamiento de transacciones](https://www.postgresql.org/docs/17/transaction-iso.html),
[comportamiento de UPDATE](https://www.postgresql.org/docs/17/sql-update.html).

Tras un conflicto se repite toda la transacción y se devuelve el resultado real confirmado.
La barrera garantiza coherencia de lectura y confirmación en ese instante, sin reservar
crédito ni cerrar períodos. Una corrección retrospectiva puede reducir el crédito que
cubría una jornada posterior y hacer visible deuda posterior según el recálculo de 001 RF-7.
Ese resultado se refleja en las consultas y no introduce un rechazo de la retroedición.
La estimación previa del navegador no manda sobre el cálculo de confirmación.

## Permisos, datos y clasificación

Se conserva `balanceMinutes = workedMinutes - scheduledMinutes`, incluso si la jornada
queda cubierta. `creditUsedMinutes` y `uncoveredMinutes` se derivan del saldo previo.
El resultado añadirá `compensationStatus` con `NONE`, `COMPENSATED` o `PARTIAL`, separado
del tipo almacenado y del permiso explicativo. Los estados y campos actuales permanecen
disponibles para consumidores existentes. Las nuevas etiquetas priorizan la situación
financiera y muestran el motivo en un bloque independiente cuando existe.

Si no queda faltante descubierto, no se crea un permiso por obligación. Si lo hay,
se conservan las reglas vigentes de motivo y tipo para ese tramo, sin endurecerlas.
Un permiso real o voluntario ya guardado conserva motivo, tipo y duración explicativa,
aunque el crédito cubra el faltante. No se elimina automáticamente al recalcular.
Para nuevas explicaciones voluntarias se conserva el tiempo real explicado. La consulta
dejará de sustituir indiscriminadamente la duración guardada por todo el faltante diario.
La deuda neta y la duración del permiso son campos distintos y no se descuentan dos veces.

Se inspeccionaron `prisma/schema.prisma` y la migración simplificada en lectura.
Los checks admiten trabajado cero, saldo negativo igual a menos esperado y ambos
timestamps nulos. `EntryType.CUSTOM` sin Permission representa el día compensado completo.
La restricción de Permission exige duración positiva, por lo que nunca se creará permiso cero.
Este flujo no necesita nueva tabla, enum persistido ni migración.

## Interfaz

Añadir “Usar horas adelantadas” para el día completo cuando el crédito lo cubra,
descanso real editable y resumen de compensado, crédito restante y deuda pendiente.
El motivo se solicita solo según las reglas vigentes del faltante descubierto.
Al editar, incluir la hora heredada como opción visible y seleccionada aunque no esté
en las nuevas franjas, conservándola hasta que se cambie expresamente.
Si cambia el saldo entre lectura y confirmación, mostrar el resultado confirmado o
el conflicto y conservar datos del formulario para que la persona revise su decisión.
Mantener componentes, clases actuales, etiquetas asociadas, estados de guardado y teclado.
La renovación visual global se implementará con la spec 005.

## Decisiones técnicas

- Derivar la compensación del movimiento compartido evita descontar dos veces el crédito.
  Se descarta persistir un consumo separado o inflar trabajado con minutos compensados.
- Un modo explícito de día compensado evita inventar horas y satisface las restricciones actuales.
  Se descarta almacenarlo como permiso obligatorio o crear un nuevo tipo persistido.
- Validar cambios frente al registro real permite ampliar las franjas sin truncar legado.
  Se descarta normalizar todos los timestamps heredados al guardar una edición.
- La transacción agrupa lectura del saldo y escritura, en lugar de confiar en el saldo del cliente.
- La barrera parametrizada por usuario es una decisión técnica propuesta para ordenar
  escrituras concurrentes sin tabla adicional. Su ejecución requiere aprobar plan y tareas
  y utilizar el entorno de escritura autorizado. No se ejecuta durante esta planificación.

## Estrategia de verificación

| RF  | Evidencia prevista                                                                           | Procedimiento                                                        | Entorno                      |
| --- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| 1   | Saldo antes de fecha excluye hoy y registros posteriores                                     | Rangos con fecha y `now` fijos                                       | Unitario y BD aislada        |
| 2   | Crédito suficiente, exacto e insuficiente                                                    | +120/−60 y +30/−90                                                   | Sin BD                       |
| 3   | Día completo con trabajado 0, esperado 360, timestamps nulos y sin permiso cero              | Confirmación y checks existentes                                     | BD aislada autorizada        |
| 4   | Parcial descubierto y permiso voluntario preservado aunque quede cubierto                    | Crear, cubrir y editar explicación                                   | BD aislada autorizada        |
| 5   | Trabajo real no aumenta por la compensación                                                  | Comparar campos reales, movimiento y cierre                          | Sin BD y BD aislada          |
| 6   | Reintento idéntico, edición concurrente y corrección administrativa                          | Una sola jornada, respuesta estable y conflicto o recálculo correcto | BD aislada autorizada        |
| 7   | Crédito de fecha posterior no compensa retrospectivamente                                    | Fixture cronológico con crédito futuro                               | Sin BD                       |
| 8   | Igual desglose en resumen, historial, JSON, Excel y PDF                                      | Exportar y contrastar campos del mismo corte                         | BD aislada y navegador local |
| 9   | Descanso del horario, cero real, descanso guardado y cambio de descanso                      | Intervalo con resultados esperados calculados explícitamente         | Sin BD y formulario local    |
| 10  | Descanso negativo, fraccionario, igual o mayor al intervalo                                  | Error en UI y servicio sin escritura parcial                         | Sin BD y BD aislada          |
| 11  | 08:15–20:15 permanece intacto; cambiar solo salida 20:00 conserva entrada; 20:30 nuevo falla | Lectura, edición de nota y edición parcial                           | Sin BD y BD aislada          |

Usar `npm run test:unit` y `npm run test:integration`, este último exclusivamente con
`TEST_DATABASE_URL` de una base aislada autorizada y migrada. La base remota sigue en lectura.
Para integración concurrente usar clientes independientes, sin depender de un único pool serial.
Actualizar los casos antiguos que suponen 60 min de descanso al valor configurado o real
de cada fixture según RF-9. En fixtures con descanso 0, probar 0 y su trabajo correspondiente;
añadir los casos explícitos de descanso 60 y 30 aprobados. Fijar el reloj de referencia.
Conservar los fallos preexistentes como línea base y separar cualquier fallo ajeno al cambio.
Finalizar con lint, typecheck, build, escaneo de secretos y revisión de UI local a 375 px.
Esta fase no ejecuta pruebas, escrituras, migraciones ni operaciones de sesión.

## Aprobación

Aprobado por el usuario el 11 de noviembre de 2026 mediante «apruebo»,
con alcance a los cinco planes presentados y su desglose en tareas.
La elección visual y la implementación conservan sus aprobaciones correspondientes.
