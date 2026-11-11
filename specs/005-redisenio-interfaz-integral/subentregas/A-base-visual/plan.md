# Plan derivado de 005-A — Base visual, acceso y estados generales

Estado del documento — partición del [plan aprobado de 005](../../plan.md)
Referencia — [spec.md](spec.md) y división aprobada el 11 de noviembre de 2026.

## Alcance y dependencias

Reglas de la dirección comprometida, componentes de presentación compartidos, navegación, acceso, recuperación y estados de carga, error y conexión.
La aplicación de apariencia requiere el compromiso de 004 y ROUND-2-CONTEXT.md. La referencia previa de A/T1 puede capturarse antes de aplicar esa apariencia.
Se conserva una sola dirección comprometida, una sola fuente de saldo de servidor
y los contratos de API definidos en 001–003. Las decisiones de apariencia se
obtienen de `ROUND-2-CONTEXT.md`, sin fijar una estética en estos documentos.

## Archivos y responsabilidades

Las rutas se expresan desde la raíz del repositorio. Su intervención está
limitada a la responsabilidad de esta subentrega y las tareas que la concretan.

| Archivos                                                                                                                                 | Responsabilidad                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/app/globals.css`, `src/app/layout.tsx`, `src/app/manifest.ts`                                                                       | Reglas comprometidas, tipografía aprobada, metadatos y adaptación |
| `src/components/ui/page-heading.tsx`, `src/components/ui/form-feedback.tsx`                                                              | Presentación compartida sin controlar datos ni peticiones         |
| `src/app/(protected)/layout.tsx`, `src/components/app-navigation.tsx`, `src/components/logout-button.tsx`                                | Navegación, cuenta y foco                                         |
| `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/recuperar/page.tsx`, `src/components/forms/login-form.tsx` | Acceso, recuperación y sus mensajes                               |
| `src/app/(protected)/loading.tsx`, `src/app/(protected)/error.tsx`                                                                       | Carga y fallo de lectura recuperable                              |
| `src/app/offline/page.tsx`, `src/components/pwa/online-status.tsx`, `public/sw.js`                                                       | Conexión y fallback PWA existentes                                |

## Lógica y flujo

```text
leer datos autorizados y contratos de servidor cuando corresponda
presentar datos y estados con la dirección comprometida
conservar valores del usuario al fallar validación o red
mostrar errores, confirmación o reintento asociados a la operación
registrar evidencia de la porción modificada y su RF original
```

Los componentes y estilos existentes se reutilizan según el plan padre.
Los nuevos encabezados y mensajes compartidos de A solo presentan información.
Los cálculos temporales permanecen en 001–003 y reciben su referencia explícita.
Las operaciones administrativas y de autenticación conservan sus contratos.

## Interfaz y decisiones técnicas

Se heredan Tailwind, CSS, componentes cliente actuales y los controles semánticos
del plan padre. Las nuevas reglas visuales requieren el compromiso de 004.
La reutilización de recursos existentes se evalúa dentro de esa dirección y sus
licencias. No se crean dependencias, iconos ni recursos creativos en esta partición.
Las alternativas descartadas y sus justificaciones permanecen en el plan padre.

## Datos y compatibilidad

Los valores confirmados y sus fechas se presentan sin recálculos de negocio
independientes en el cliente. Los errores y reintentos conservan la entrada local.
Las escrituras de pruebas se limitan a la base aislada autorizada. El baseline de
accesibilidad utiliza una copia o árbol aislado sin stashear trabajo del usuario.

## Estrategia de verificación

Cada tarea especifica alcance, dependencia, resultado, procedimiento y entorno.
La evidencia se agrega al informe común `specs/005-redisenio-interfaz-integral/validation.md`.
Se comprueban 375 y 1280 px y reflow a 320 px efectivos, teclado, foco y estados
aplicables. Las habilidades de interfaz y AccessLint siguen la asignación aprobada.
Los criterios automáticos, manuales y humanos se mantienen separados, con pendientes
explícitos. Los tests de lógica de 001–003 no se duplican para comprobar estilos.

## Aprobaciones y ejecución

Se registra la división aprobada el 11 de noviembre de 2026. Este documento extrae
el alcance y las decisiones del plan padre aprobado, sin introducir otra política.
La aprobación de tareas e implementación y los checkpoints humanos permanecen
registrados en [tasks.md](tasks.md) y en los documentos de 005.
