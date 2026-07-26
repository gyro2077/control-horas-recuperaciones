# Seguridad

## Credenciales

- `.env` está ignorado y debe tener permisos restrictivos;
- `.env.example` contiene únicamente marcadores;
- `DATABASE_URL` y `AUTH_SECRET` solo se leen en módulos del servidor;
- las contraseñas se almacenan con bcrypt, costo 12;
- el script `npm run security:secrets` revisa secretos accidentales.

Una credencial de base compartida por un canal de conversación debe rotarse
antes de un despliegue público.

## Sesión

- token opaco aleatorio;
- en la base solo se guarda su HMAC SHA-256;
- cookie `httpOnly`, `sameSite=lax`, `secure` en producción;
- expiración corta o extendida al marcar “mantener sesión”;
- cuentas inactivas no crean ni reutilizan sesiones.

## Autenticación

El inicio de sesión limita intentos por correo e IP, usa una comparación de
contraseña falsa cuando el usuario no existe y aplica bloqueo temporal.

## Autorización

- `USER`: exclusivamente su usuario;
- `ADMIN`: usuarios, horarios, reportes y correcciones;
- cada endpoint comprueba la sesión y el rol;
- ocultar un botón nunca se considera autorización.

## Integridad

- Zod valida entradas HTTP;
- Prisma parametriza consultas;
- PostgreSQL mantiene restricciones de minutos y saldo;
- el servidor ignora saldos enviados por el navegador;
- solo existe un registro por usuario y fecha;
- Excel y PDF se crean desde consultas autorizadas.

## Navegador y red

- CSP, `X-Frame-Options`, `nosniff`, Referrer Policy y Permissions Policy;
- mutaciones verifican origen y `X-Requested-With`;
- endpoints dinámicos y API usan `no-store`;
- el service worker no cachea API, sesión ni HTML autenticado;
- no se guardan contraseñas ni tokens en `localStorage`.

## Operación

- use HTTPS para aplicación y PostgreSQL;
- mantenga `DATABASE_POOL_MAX=1` en el plan gratuito;
- rote secretos después de cualquier exposición;
- aplique migraciones desde un único proceso de despliegue;
- no registre URI, contraseña, cuerpo de login o cookies.
