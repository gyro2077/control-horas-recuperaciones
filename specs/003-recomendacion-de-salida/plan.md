# Plan de Spec 003 — Recomendación y simulación de salida

Estado del plan — aprobado
Referencia — [spec.md](spec.md), especificación y clarificación aprobadas el 11 de noviembre de 2026.
Depende del saldo del [plan 001](../001-horas-adelantadas/plan.md) y del intervalo
y contexto efectivo del [plan 002](../002-compensacion-salida-temprana/plan.md).

## Archivos y responsabilidades

| Archivo                                                     | Cambio y responsabilidad                                                     | RF cubiertos   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------- |
| `src/domain/departure-service.ts` — nuevo                   | Simulación y búsqueda pura de primera salida válida con referencia explícita | 1–12           |
| `src/domain/time-balance-service.ts`                        | Reutilizar intervalo con descanso y movimiento compartidos                   | 2–3, 9–10, 12  |
| `src/server/services/departure-query-service.ts` — nuevo    | Autorizar y leer una fotografía del día actual, saldo previo y originales    | 1, 4–8, 11–12  |
| `src/server/services/daily-entry-service.ts`                | Reutilizar el contexto de jornada efectiva y legado definido en 002          | 1, 5, 9, 11–12 |
| `src/server/services/balance-query-service.ts`              | Aportar saldo anterior a fecha y referencia dentro de la lectura común       | 3, 5–6         |
| `src/app/api/daily-entries/preview/route.ts` — nuevo        | Consulta GET autenticada y sin escritura para tiempos propuestos             | 1–12           |
| `src/components/registration/departure-preview.tsx` — nuevo | Presentar recomendación, datos usados, simulación y errores                  | 1–3, 7–12      |
| `src/components/registration/daily-entry-form.tsx`          | Conectar cambios del día actual y descanso al componente funcional           | 1, 3, 5, 9–12  |
| `src/app/(protected)/registro/page.tsx`                     | Pasar el mismo instante inicial y habilitar orientación solo para hoy        | 1, 5, 8        |
| `src/app/(protected)/dashboard/page.tsx`                    | Añadir acceso a la orientación del día actual sin duplicar el motor          | 1–2, 8         |
| `tests/unit/departure-service.test.ts` — nuevo              | Casos puros de simulación, umbral y compatibilidad                           | 1–12           |
| `tests/integration/application-flows.test.ts`               | Lectura del objetivo autorizado, snapshots y ausencia de escrituras          | 1, 4–8, 11–12  |

## Contratos de entrada y salida

`simulateDeparture(input)` recibirá fecha civil, zona, `now`, esperado efectivo,
saldo previo firmado, entrada, salida propuesta opcional y descanso efectivo.
Recibirá también los valores horarios originales y el trabajo guardado cuando exista
un registro. El origen de cada dato distinguirá horario, confirmado o supuesto.
El descanso inicial será el guardado para una edición y el del horario para un día nuevo.

Devuelve `date`, `timezone`, `calculatedAt`, datos usados y un estado discriminado
`NO_SCHEDULED_WORK`, `MISSING_INPUT`, `INVALID_INPUT`, `FULL_DAY_COVERED`,
`RECOMMENDED` o `NO_VALID_DEPARTURE`.
Los resultados incluyen `previousBalanceMinutes`, crédito y deuda previos,
`recommendedEndTime` cuando exista y la simulación del tiempo propuesto.
La simulación contiene esperado, trabajado, saldo diario, recuperado, crédito generado,
crédito utilizado, crédito restante, faltante descubierto y deuda acumulada resultante,
calculados con el mismo movimiento de 001 y el mismo intervalo de 002.
La fotografía original, si existe, se devuelve separada para mostrar sus horas, trabajo
y saldo reales sin convertirlos en una nueva propuesta válida.

`getDeparturePreview(actor, targetUserId, input, now)` autoriza con `RbacService`,
obtiene la zona de la persona objetivo y limita esta función a su día actual.
Lee usuario, jornada efectiva y saldo hasta ayer con un mismo cliente y fotografía
de lectura consistente. Reutiliza los servicios de 001–002 en lugar de repetir sus reglas.
No utiliza autenticación mutante ni crea sesiones al leer la sesión existente.
El adaptador construye expresamente el DTO enumerado arriba y solo expone identificador
y nombre públicos del objetivo si la UI los necesita. Nunca devuelve el `user` completo,
el contexto interno, hashes de contraseña, sesiones ni metadatos internos del usuario.

`GET /api/daily-entries/preview` admite `date`, `userId?`, `startTime?`, `endTime?`
y `breakMinutes?`. El servidor fija `now`; el navegador no controla el instante de corte.
La omisión de un dato usa su valor confirmado o programado y declara ese origen.
El esquema valida forma sin rechazar un valor heredado antes de resolver su registro.
Una consulta con fecha distinta de hoy devuelve `PREVIEW_DATE_NOT_SUPPORTED` y 422.
Un objetivo ajeno sin permiso devuelve el error RBAC vigente. Las respuestas se devuelven
con `success({ preview })` y caché `no-store`. Los errores de datos del formulario
permanecen estructurados en el preview para mostrar cada causa sin inventar una salida.

## Lógica y algoritmo

```text
capturar now en el servidor y resolver hoy en la zona del usuario objetivo
leer contexto efectivo con originales y saldo firmado hasta el día anterior
si esperado efectivo = 0:
  devolver NO_SCHEDULED_WORK, crédito intacto y registro original si existe
si falta un dato necesario para la rama evaluada:
  devolver MISSING_INPUT con la causa concreta
si crédito previo >= esperado efectivo:
  recomendación = FULL_DAY_COVERED y efecto de trabajado 0, sin inventar horas
si no cubre la jornada completa:
  resolver entrada y descanso; validar datos usados para recomendar
  para cada salida de media hora del día, hasta las 20:00 inclusive, en orden:
    si salida > entrada y el intervalo admite el descanso:
      simular trabajo, saldo diario y movimiento con saldo previo
      elegir la primera con faltante diario <= crédito previo
  si ninguna cumple, recomendación = NO_VALID_DEPARTURE
si se indicó una salida propuesta, aunque el crédito cubra la jornada completa:
  resolver entrada y descanso y validar cada valor introducido según 002
  calcular la simulación de esa salida o devolver su error específico
devolver recomendación y simulación opcional, condiciones y referencia
conservar el saldo consolidado
```

La rama sin jornada precede a cualquier comparación de crédito, evitando que cero
se considere suficiente para compensar cero. Se usan los minutos efectivos guardados
si existe registro, incluso si el calendario actual marca esa fecha como feriado.
La falta de horario o entrada para una jornada con minutos esperados se distingue
de un día efectivo sin jornada. Una orientación de jornada completa cubierta no requiere entrada. Si la persona
propone trabajar parte del día, esa simulación sí requiere entrada y descanso válidos
y muestra el crédito que conservaría, aunque la recomendación siga siendo día cubierto.

La simulación nunca incorpora la contribución confirmada de hoy al saldo previo,
ni crédito de fechas posteriores. Ante deuda anterior se busca cumplir la jornada
sin añadir deuda y se informa la deuda que permanece. La búsqueda no exige saldarla toda.
Si hay un resto de crédito histórico de 15 min, la elección de una media hora nunca
redondea hacia una salida que cause deuda nueva. El crédito sin consumir permanece visible.
Un día con esperado efectivo cero conserva cualquier aporte confirmado que tenga
trabajo real registrado. Su estado sin consejo de salida no elimina ese aporte del saldo.
Las horas heredadas se muestran tal como se guardaron. Un cambio parcial conserva los
timestamps originales de los campos no modificados. Todas las recomendaciones nuevas
respetan las franjas y el máximo, aunque la salida confirmada original sea posterior.
El resultado conserva el instante de referencia y evita inferir trabajo efectivo por
el simple paso del reloj. La persona confirma después sus tiempos reales mediante 002.

## Interfaz

El bloque del día actual muestra entrada, descanso, saldo previo y su origen antes
del resultado. Presenta “Puedes compensar el día completo” o la primera salida
compatible con los datos, y distingue crédito restante y deuda anterior pendiente.
Cambiar salida o descanso actualiza una estimación identificada como tal.
Una petición anterior que termine tarde se descarta mediante cancelación o identificador
de consulta, evitando mostrar una respuesta correspondiente a valores ya modificados.
El estado de carga conserva los valores de formulario y los errores identifican el campo.

Los registros heredados tienen una vista original independiente de la propuesta.
La UI explica las nuevas franjas al cambiar sus horas y no reemplaza automáticamente
08:15 o 20:15 por una opción distinta. La opción original permanece visible.
En días sin jornada se muestra ese estado, con crédito intacto y sin acción de compensar.
Para fechas históricas, el registro habitual sigue disponible, sin activar la recomendación
de esta spec. El enlace desde dashboard conduce al bloque de orientación de hoy.
Reutilizar clases actuales, etiquetas, regiones de estado y foco visible. El rediseño se hará en 005.

## Decisiones técnicas

- Un GET de consulta permite recalcular sin confirmar ni reservar crédito.
  Se descarta crear un borrador persistente o una reserva que compita con registros reales.
- Buscar los candidatos de media hora con el cálculo compartido evita errores de restar
  crédito a la salida nominal cuando cambian entrada o descanso. Son como máximo 41 candidatos.
- El saldo firmado previo evita ocultar deuda anterior cuando el crédito disponible es cero.
  Se descarta usar únicamente `totalCreditMinutes` del dashboard como entrada del simulador.
- La lectura se agrupa mediante una transacción de solo consultas con aislamiento
  `RepeatableRead`, sin DML. La confirmación posterior vuelve a resolver todo en Serializable.
- La hora y fecha de referencia vienen del servidor. El motor puro recibe `now` como dato,
  permitiendo pruebas deterministas sin acoplarlo a la hora real del proceso.

## Datos y compatibilidad

No hay cambios de esquema ni actualización de jornadas, permisos, saldos o sesiones.
La lectura retorna el registro original y el cálculo propuesto como objetos separados.
Una edición posterior usa el contrato y la versión de registro de 002. Si alguien modifica
el saldo mientras se observa el preview, la confirmación recalcula y comunica su resultado real.
Los helpers de fechas civiles y horas locales existentes siguen siendo los adaptadores.
Los errores no incluyen credenciales ni información de otra persona.

## Estrategia de verificación

| RF  | Evidencia prevista                                                                                  | Procedimiento                                                         | Entorno                  |
| --- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| 1   | Datos, origen, saldo firmado y referencia visibles                                                  | Payload del servicio y bloque de datos a 375 px                       | Sin BD y navegador local |
| 2   | Crédito 120, esperado 360, entrada 08:30 y descanso 0 recomienda 12:30; deuda anterior no se oculta | Casos puros y ejemplo de deuda −60                                    | Sin BD                   |
| 3   | Salida 13:30 consume crédito según ejemplos; deuda final incluye deuda previa                       | Tabla de ejemplos de la spec                                          | Sin BD                   |
| 4   | Variar propuestas conserva jornadas, permisos y sesiones                                            | Comparar filas y marcas de actualización antes y después del servicio | BD aislada autorizada    |
| 5   | Editar hoy excluye su +60 anterior del saldo previo                                                 | Fixture con ayer +30 y hoy +60                                        | Sin BD y BD aislada      |
| 6   | Crédito de mañana queda fuera del cálculo                                                           | Entrada con registro posterior a hoy                                  | Sin BD                   |
| 7   | Entrada incompleta, horario ausente y ninguna salida posible tienen causas distintas                | Estados discriminados y presentación de error                         | Sin BD y UI local        |
| 8   | Carácter informativo, fecha y referencia visibles sin confirmación automática                       | Inspección de UI y ausencia de llamadas de escritura                  | Navegador local aislado  |
| 9   | Descanso 60 y 30 producen 16:30 y 16:00 con esperado 480 y crédito 60                               | Mismos datos en simulación y registro                                 | Sin BD y BD aislada      |
| 10  | Descanso negativo, fraccionario o que invalida el intervalo                                         | Error sin recomendación válida                                        | Sin BD                   |
| 11  | Esperado 0 y crédito 0 o 120 conservan saldo; fotografía histórica 360 prevalece                    | Casos puros de jornada efectiva                                       | Sin BD                   |
| 12  | Legado 08:15–20:15 intacto; cambio solo a 20:00 conserva entrada; nuevo 20:30 falla                 | Original separado y reglas de cambio parcial                          | Sin BD y UI local        |

Ejecutar en implementación `npm run test:unit`, lint, typecheck, build y escaneo de secretos.
La integración, incluido cualquier login de preparación, solo usa `TEST_DATABASE_URL`
y un entorno local aislado autorizado. La base remota mantiene su permiso de lectura.
Pruebas de zona, medianoche y fechas usarán `now` explícito y conservarán la regla civil.
La comprobación visual incluye teclado, carga, error, resultado y móvil de 375 px.
Este plan no acredita resultados ejecutados ni realiza operaciones sobre la base.

## Aprobación

Aprobado por el usuario el 11 de noviembre de 2026 mediante «apruebo»,
con alcance a los cinco planes presentados y su desglose en tareas.
La elección visual y la implementación conservan sus aprobaciones correspondientes.
