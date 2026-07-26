# Modelo entidad-relación

```mermaid
erDiagram
    Schedule ||--|{ ScheduleDay : define
    Schedule ||--o{ User : asignado
    User ||--o{ DailyEntry : registra
    DailyEntry ||--o| Permission : explica
    User ||--o{ Permission : solicita
    User ||--o{ Session : inicia

    User {
      uuid id PK
      string name
      string email UK
      string passwordHash
      enum role
      enum status
      string timezone
      uuid scheduleId FK
      datetime createdAt
      datetime updatedAt
    }

    Schedule {
      uuid id PK
      string name UK
      enum type
      boolean active
    }

    ScheduleDay {
      uuid id PK
      uuid scheduleId FK
      int weekday
      boolean isWorkingDay
      time startTime
      time endTime
      int breakMinutes
      int expectedMinutes
    }

    DailyEntry {
      uuid id PK
      uuid userId FK
      date date
      int scheduledMinutes
      datetime startDateTime
      datetime endDateTime
      int breakMinutes
      int workedMinutes
      int balanceMinutes
      enum type
      string note
    }

    Permission {
      uuid id PK
      uuid userId FK
      uuid dailyEntryId FK
      date date
      enum kind
      int durationMinutes
      boolean fullDay
      string reason
    }

    Session {
      uuid id PK
      uuid userId FK
      string tokenHash UK
      datetime expiresAt
    }
```

Existe una restricción única sobre `(DailyEntry.userId, DailyEntry.date)`.
PostgreSQL también verifica que:

- todos los minutos sean enteros no negativos;
- `balanceMinutes = workedMinutes - scheduledMinutes`;
- una entrada completa tenga salida posterior a entrada;
- los días de horario estén entre 1 y 7.

`AuthThrottle` es una tabla técnica independiente para limitar intentos de
inicio de sesión.
