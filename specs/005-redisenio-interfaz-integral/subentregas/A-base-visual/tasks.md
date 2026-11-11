# Tareas de 005-A — Base visual, acceso y estados generales

Estado de las tareas — borrador

Referencias — [spec.md](spec.md), [plan.md](plan.md) y [tareas de 005](../../tasks.md).
La división documental fue aprobada el 11 de noviembre de 2026.
La implementación de 005 conserva su aprobación pendiente.

## Dependencias y condiciones comunes

- Antes de aplicar apariencia debe existir el compromiso visual explícito de 004
  y `ROUND-2-CONTEXT.md`. Una preselección no satisface esta dependencia.
- La aplicación aislada, sus cuentas USER y ADMIN y datos de prueba deben estar
  disponibles para las comprobaciones de interacción. Los recorridos de B consumen
  los contratos terminados de 001–003 y C conserva sus controles administrativos.
- La base remota sigue en lectura. Login, logout, registro, contraseña y gestión
  administrativa se prueban exclusivamente en la base aislada autorizada.
- Cada área registra referencia previa y comprobación posterior en
  `specs/005-redisenio-interfaz-integral/validation.md`, con versión, URL, estado,
  viewport y resultado. Se conservan únicamente datos de prueba sin credenciales.
- El baseline usa una copia o árbol aislado. La comparación no requiere stashear
  ni cambiar la rama del directorio de trabajo actual del usuario.
- Las comprobaciones visuales usan 375 y 1280 px y reflow a 320 px efectivos.
  Cada tarea comprueba teclado, foco y errores de la porción que modifica.
- `web-design-guidelines` se aplica al código intervenido con sus reglas vigentes.
  `accessibility-scan` detecta violaciones y `accessibility-inspect` cubre interacción
  sin duplicar criterios. `accessibility-fix` se usa para hallazgos de alcance aprobado.
  `accessibility-diff` compara referencias compatibles y declara la deriva de selectores.
- Los resultados automáticos, manuales y que requieren lector de pantalla o juicio
  humano se registran por separado. Un punto pendiente no se marca como conforme.
- Las tareas visuales se verifican en navegador. Las comprobaciones de lint y tipos
  se ejecutan sobre los cambios pertinentes, manteniendo visible la línea base previa.
  Las pruebas de lógica de 001–003 siguen en Vitest y no se duplican para clases CSS.

La aplicación de apariencia requiere el compromiso de 004 y ROUND-2-CONTEXT.md. La referencia previa de A/T1 puede capturarse antes de aplicar esa apariencia.

## Secuencia

- [ ] **T1. Capturar la referencia de acceso y shell.** RF-1, RF-6, RF-7
  - Alcance — lectura de login, recuperación, shell protegido y estado offline. Registrar estados y referencias en `../../validation.md`.
  - Dependencias — entorno aislado y herramientas de comprobación disponibles. No requiere modificar la apariencia.
  - Hecho cuando las URLs y estados iniciales del área A tengan referencia reproducible y sus comprobaciones no ejecutadas estén identificadas.
  - Comprobación — escaneo de los estados definidos y recorrido breve de teclado del shell, con capturas y referencia de versión. Entorno local aislado.
  - Evidencia — pendiente de ejecución.

- [ ] **T2. Aplicar las reglas visuales comprometidas a la base.** RF-1, RF-7
  - Alcance — `src/app/globals.css`, `src/app/layout.tsx` y `src/app/manifest.ts`, incluyendo foco, tipografía aprobada y reducción de movimiento.
  - Dependencias — T1 y compromiso de 004 registrado en `ROUND-2-CONTEXT.md`.
  - Hecho cuando las reglas aplicadas correspondan al contexto comprometido y los textos y focos del área A se mantengan disponibles en los tres anchos previstos.
  - Comprobación — inspección de fuentes y estilos aplicados, teclado, reflow y movimiento reducido, más lint y tipos pertinentes. Entorno local aislado.
  - Evidencia — pendiente de ejecución.

- [ ] **T3. Preparar presentación compartida de encabezados y mensajes.** RF-1, RF-3, RF-5, RF-6, RF-7
  - Alcance — nuevos `src/components/ui/page-heading.tsx` y `src/components/ui/form-feedback.tsx`, con contrato pequeño de presentación e integración inicial mínima en `login/page.tsx` y `login-form.tsx`.
  - Dependencias — T2. Los componentes no asumen peticiones, cálculos ni propiedad de valores del formulario.
  - Hecho cuando representen título, descripción y mensajes de progreso, éxito y error con asociaciones y roles accesibles, sin anuncios duplicados.
  - Comprobación — integrar su uso inicial en la página de acceso y comprobar nombre, asociación y anuncio de error. Lint y tipos. Entorno local aislado.
  - Evidencia — pendiente de ejecución.

- [ ] **T4. Adaptar navegación y cuenta.** RF-1, RF-5, RF-7
  - Alcance — `src/app/(protected)/layout.tsx`, `src/components/app-navigation.tsx` y `src/components/logout-button.tsx`.
  - Dependencias — T2 y T3.
  - Hecho cuando ambas cuentas de prueba tengan navegación y estado activo correctos, salto al contenido y foco disponible al abrir o cerrar la cuenta, sin acciones tapadas por elementos fijos.
  - Comprobación — recorrido USER y ADMIN con teclado a 375 y 1280 px y reflow a 320 px efectivos. Logout solo en base aislada.
  - Evidencia — pendiente de ejecución.

- [ ] **T5. Adaptar estructura de acceso y recuperación.** RF-1, RF-6, RF-7
  - Alcance — `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx` y `src/app/(auth)/recuperar/page.tsx`.
  - Dependencias — T2 y T3.
  - Hecho cuando ambas páginas sigan la dirección comprometida y mantengan título principal, enlaces y explicación de recuperación administrativa disponibles.
  - Comprobación — revisar encabezados, navegación, texto largo, consola y reflow, y escanear ambas páginas. Entorno local aislado.
  - Evidencia — pendiente de ejecución.

- [ ] **T6. Adaptar validación y estados del formulario de login.** RF-1, RF-6, RF-7
  - Alcance — `src/components/forms/login-form.tsx`, reutilizando los mensajes de T3.
  - Dependencias — T5.
  - Hecho cuando envío, error de campo, error de credenciales y reintento mantengan los valores introducidos, permitan corregir y conserven pegado y gestores de contraseñas.
  - Comprobación — provocar validación y fallo de red, revisar foco y anuncios y realizar un acceso de prueba autorizado. Entorno local y base aislada.
  - Evidencia — pendiente de ejecución.

- [ ] **T7. Adaptar carga, error y conexión.** RF-1, RF-6, RF-7
  - Alcance — nuevos `src/app/(protected)/loading.tsx` y `error.tsx`, `src/app/offline/page.tsx`, `src/components/pwa/online-status.tsx` y versión de caché en `public/sw.js`.
  - Dependencias — T2 a T4. Reutilizar lógica y fallback PWA existentes.
  - Hecho cuando carga y fallo de lectura ofrezcan su estado y reintento, y offline conserve el contenido y foco accesibles sin añadir escrituras ni caché de API.
  - Comprobación — retardar y fallar una lectura, desconectar el navegador y revisar `sw.js` y comportamiento PWA en build local de prueba. Entorno aislado.
  - Evidencia — pendiente de ejecución.

- [ ] **T8. Cerrar la evaluación del área A y sus regresiones.** RF-1, RF-6, RF-7
  - Alcance — consolidación de las evidencias de T1 a T7 y correcciones menores de los archivos de esa área.
  - Dependencias — T1 a T7 terminadas.
  - Hecho cuando los estados de acceso, shell y conexión de la muestra tengan resultados actualizados y se hayan identificado los puntos humanos pendientes.
  - Comprobación — comparación con el baseline de T1, verificaciones focalizadas de hallazgos corregidos y revisión `web-design-guidelines`. Una remediación que exceda el bloque se desglosa antes de continuar.
  - Evidencia — pendiente de ejecución.

## Checkpoints humanos

La dirección de 004 debe estar comprometida y `ROUND-2-CONTEXT.md` disponible
antes de aplicar apariencia de producción. Una preselección no satisface ese punto.
La aceptación de las pantallas tras C/T8 habilita C/T9. La guía y el cierre se
presentan después para aceptación. Estas decisiones no son tareas de duración
estimada ni se aprueban en nombre del usuario.

## Aprobaciones

| Fase                               | Decisión explícita del usuario | Fecha      | Alcance aprobado                                         |
| ---------------------------------- | ------------------------------ | ---------- | -------------------------------------------------------- |
| División documental A/B/C          | Aprobada                       | 2026-11-11 | Alcance derivado y materialización de la división de 005 |
| Tareas e inicio de implementación  | Pendiente                      | —          | —                                                        |
| Implementación y paso a validación | Pendiente                      | —          | —                                                        |

## Entrega

Las 8 tareas están pendientes de ejecución. Sus RF mantienen el estado
de implementación y validación pendiente hasta disponer de evidencia y las
aprobaciones correspondientes. La finalización de esta subentrega no acredita
por sí sola la finalización de 005.
