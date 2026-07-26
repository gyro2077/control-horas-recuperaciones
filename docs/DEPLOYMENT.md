# Despliegue sin Docker

## Clever Cloud PostgreSQL

Use la URI del complemento PostgreSQL en una variable del entorno del servidor:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base?uselibpqcompat=true&sslmode=require"
DATABASE_POOL_MAX="1"
```

No use variables `NEXT_PUBLIC_` para la conexión. Prisma y PostgreSQL se
ejecutan únicamente en el servidor.

Si la URI entregada no tiene parámetros, agregue
`?uselibpqcompat=true&sslmode=require`. Si ya tiene una consulta, agregue los
parámetros con `&`.

## Variables

```env
AUTH_SECRET="secreto-aleatorio-de-al-menos-32-caracteres"
APP_URL="https://su-dominio.example"
DEFAULT_TIMEZONE="America/Guayaquil"
SESSION_TTL_HOURS="12"
REMEMBER_SESSION_TTL_DAYS="30"
LOGIN_MAX_ATTEMPTS="5"
LOGIN_LOCK_MINUTES="15"
DATABASE_POOL_MAX="1"
```

Las variables `SEED_*` solo se necesitan durante la carga inicial.

## Preparación

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run verify
```

La migración simplificada elimina las tablas antiguas. No la ejecute sobre una
base que deba conservar información.

## Inicio

```bash
npm run build
npm start
```

El proceso escucha el puerto entregado por `PORT` o el 3000 predeterminado de
Next.js. El proveedor debe terminar TLS y reenviar tráfico al proceso Node.

## Comprobaciones

```bash
curl https://su-dominio.example/api/health
```

Después valide manualmente:

1. inicio de sesión;
2. horario visible;
3. registro de un día;
4. descarga Excel;
5. descarga PDF;
6. instalación PWA.

No existe Dockerfile ni `docker-compose.yml` en este proyecto.
