# Reglas de cálculo

## Unidad

Todo se calcula con minutos enteros. No se guardan horas decimales.

```text
6 h = 360 min
8 h = 480 min
30 h = 1800 min
```

## Jornada diferente

```text
minutos brutos = salida - entrada
minutos trabajados = minutos brutos - descanso
```

La salida debe ser posterior a la entrada y el descanso debe ser menor que la
jornada.

## Saldo diario

```text
saldo diario = minutos trabajados - minutos esperados
```

- negativo: tiempo pendiente;
- positivo: tiempo adicional;
- cero: jornada cumplida.

`minutos esperados` se obtiene del horario asignado y se copia a
`DailyEntry.scheduledMinutes`.

## Permisos y ausencias

Universidad, permisos y ausencias explican por qué faltaron horas, pero no
cuentan como trabajo:

```text
esperado = 360
permiso = 120
trabajado propuesto = 360 - 120 = 240
saldo = 240 - 360 = -120
```

El permiso no se resta nuevamente del saldo.

## Acumulación y recuperación

Los saldos se recorren cronológicamente:

```text
saldo acumulado = suma de saldos diarios finalizados
deuda = max(0, -saldo acumulado)
crédito = max(0, saldo acumulado)
```

La recuperación de un día es el menor valor entre la deuda anterior y el saldo
positivo del día:

```text
recuperado_hoy = min(deuda_anterior, max(0, saldo_diario))
```

Ejemplo:

```text
Día 1: -120 min
Día 2: +120 min
Saldo final: 0 min
Recuperado: 120 min
```

No se reescribe ningún saldo histórico.

### Horario diferente y recuperación

El usuario selecciona entrada y salida en franjas de 30 minutos. El sistema
clasifica automáticamente el resultado. Para un pasante:

```text
Entrada 08:30, salida 11:30 = 3 h trabajadas = -3 h
Entrada 09:30, salida 17:30, descanso automático 60 min = 7 h = +1 h
Entrada 08:30, salida 17:30, descanso automático 60 min = 8 h = +2 h
```

Cuando el saldo es negativo se solicita el motivo del tiempo faltante. Cuando
es positivo se aplica como recuperación. Si el día ya estaba registrado, se
actualiza ese mismo registro; nunca se crea una segunda jornada para la fecha.

## Fechas

- timestamps técnicos: UTC;
- visualización: zona horaria del usuario;
- horarios: horas locales sin zona;
- fechas civiles de registro: tipo PostgreSQL `DATE`;
- días futuros: saldo cero;
- día actual sin registro: “En curso” hasta terminar el horario;
- días no laborables: saldo cero.

`TimeBalanceService` es la fuente única para tiempo neto, saldo diario y
acumulación.
