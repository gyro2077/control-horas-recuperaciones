# Control de Horas

PWA sencilla para que pasantes, trainees y empleados registren un día de
trabajo, entiendan sus horas pendientes y descarguen reportes.

No es un sistema de recursos humanos. El MVP tiene dos roles, un registro por
persona y día, horarios asignados por un administrador y exportaciones en Excel
y PDF.

## Flujo principal

El usuario inicia sesión y elige una de tres acciones:

1. **Cumplí mi horario:** registra con un toque la jornada asignada.
2. **Horario diferente:** pide entrada, salida, descanso y una nota opcional.
3. **Permiso o ausencia:** documenta el motivo y las horas que sí trabajó.

El servidor calcula todo en minutos enteros:

```text
saldo diario = minutos trabajados - minutos esperados
deuda actual = max(0, -saldo acumulado)
crédito actual = max(0, saldo acumulado)
```

Las horas positivas recuperan automáticamente deuda anterior sin modificar los
registros históricos. Los días futuros y el día actual antes de terminar la
jornada no generan deuda.

## Funciones incluidas

- autenticación con cookies seguras y bloqueo por intentos;
- roles `ADMIN` y `USER` verificados en el servidor;
- horarios predefinidos para pasantes y jornada completa;
- horarios personalizados creados solo por administradores;
- un registro diario por usuario;
- dashboard con progreso, deuda y recuperación;
- historial de los últimos 60 días;
- Excel con Resumen, Detalle diario y Permisos y ausencias;
- PDF generado en el servidor;
- instalación como PWA y aviso sin conexión;
- caché únicamente para recursos estáticos;
- corrección administrativa simple de minutos con motivo.
- historial y reportes por compañero para administradores;
- restablecimiento administrativo de contraseñas bloqueadas.

No incluye equipos, supervisores, aprobaciones, nómina, cierres, sincronización
offline, notificaciones complejas ni personalización del dashboard.

## Tecnología

- Next.js App Router, React y TypeScript estricto;
- PostgreSQL y Prisma ORM;
- Tailwind CSS;
- Zod y React Hook Form;
- ExcelJS y pdf-lib;
- Recharts;
- service worker y Web App Manifest.

Requiere Node.js 20.19 o posterior. No usa Docker.

## Instalación local

```bash
npm install
cp .env.example .env
```

Configure `.env` con su PostgreSQL administrado. No coloque credenciales en
archivos versionados:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base?uselibpqcompat=true&sslmode=require"
AUTH_SECRET="un-secreto-aleatorio-de-al-menos-32-caracteres"
APP_URL="http://localhost:3000"
DEFAULT_TIMEZONE="America/Guayaquil"
DATABASE_POOL_MAX="1"
SEED_ADMIN_PASSWORD="contraseña-temporal-de-desarrollo"
```

Luego:

```bash
npm run db:deploy
npm run db:seed
npm run dev
```

Abra `http://localhost:3000`.

> La migración `202607250100_simplified_mvp` elimina las tablas del modelo
> anterior. Solo debe ejecutarse cuando ese reinicio haya sido autorizado.

## Datos iniciales

El seed crea:

- `admin@controlhoras.local`, administrador;
- horario de pasante/trainee de 30 horas;
- horario de jornada completa.

La contraseña inicial se lee de `SEED_ADMIN_PASSWORD`. Los compañeros se crean
posteriormente desde el panel de administración.

## Comandos de calidad

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run build
npm run security:secrets
```

Las pruebas de integración requieren `TEST_DATABASE_URL`. Debe apuntar a una
base con el esquema ya migrado; las filas temporales de la prueba se eliminan al
terminar.

## Despliegue Node.js

Configure las variables de entorno en el proveedor y ejecute:

```bash
npm ci
npm run db:deploy
npm run build
npm start
```

En producción, `APP_URL` debe ser la URL HTTPS pública. La conexión a Clever
Cloud permanece exclusivamente en el servidor.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Modelo entidad-relación](docs/ERD.md)
- [Reglas de cálculo](docs/CALCULATION.md)
- [API](docs/API.md)
- [Despliegue y Clever Cloud](docs/DEPLOYMENT.md)
- [Seguridad](docs/SECURITY.md)
