# API del MVP

Todas las rutas devuelven:

```json
{ "data": {} }
```

o:

```json
{
  "error": {
    "code": "CODIGO",
    "message": "Mensaje seguro",
    "fieldErrors": {}
  }
}
```

Las mutaciones requieren sesión, mismo origen y
`X-Requested-With: control-horas-pwa`.

| Método    | Ruta                                | Acceso                                | Uso                                        |
| --------- | ----------------------------------- | ------------------------------------- | ------------------------------------------ |
| POST      | `/api/auth/login`                   | público                               | iniciar sesión                             |
| POST      | `/api/auth/logout`                  | sesión                                | cerrar sesión                              |
| GET       | `/api/auth/session`                 | sesión                                | consultar sesión                           |
| GET       | `/api/dashboard`                    | propio/admin                          | resumen de horas                           |
| GET       | `/api/daily-entries/schedule?date=` | propio                                | horario del día                            |
| GET       | `/api/daily-entries`                | propio/admin                          | registros diarios                          |
| POST      | `/api/daily-entries`                | usuario                               | registrar el día                           |
| PATCH     | `/api/daily-entries/:id`            | admin                                 | corregir minutos con motivo                |
| GET, POST | `/api/users`                        | admin para listado completo/escritura | usuarios                                   |
| PATCH     | `/api/users/:id`                    | admin                                 | estado, rol, horario o contraseña temporal |
| GET, POST | `/api/schedules`                    | admin                                 | horarios                                   |
| GET       | `/api/reports`                      | propio/admin                          | datos normalizados                         |
| GET       | `/api/exports/excel`                | propio/admin                          | archivo `.xlsx`                            |
| GET       | `/api/exports/pdf`                  | propio/admin                          | archivo PDF                                |
| GET       | `/api/health`                       | público                               | salud sin secretos                         |

## Crear registro diario

### Horario normal

```json
{ "mode": "SCHEDULED", "date": "2026-07-24" }
```

### Trabajé otras horas

```json
{
  "mode": "DIFFERENT",
  "date": "2026-07-24",
  "startTime": "09:30",
  "endTime": "17:30",
  "reason": "Recuperación"
}
```

Entrada y salida aceptan únicamente horas completas o medias horas. El servidor
decide si el resultado es jornada cumplida, tiempo pendiente o recuperación.
Si faltó tiempo, también se puede enviar `permissionKind`.

### No trabajé

```json
{
  "mode": "PERMISSION",
  "date": "2026-07-24",
  "permissionKind": "UNIVERSITY",
  "workedMinutes": 0,
  "fullDay": true,
  "reason": "Clases"
}
```

El servidor obtiene el horario y recalcula `workedMinutes`,
`balanceMinutes` y las horas faltantes antes de guardar. Si la jornada del día
ya existe, actualiza ese mismo registro en lugar de crear un duplicado.
