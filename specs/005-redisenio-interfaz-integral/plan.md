# Plan de Spec 005 — Renovación integral de la interfaz

Estado del plan — aprobado

Referencia — [spec.md](spec.md), con especificación y clarificación aprobadas el 11 de noviembre de 2026.

## Alcance y dependencias

Este plan define la aplicación del lenguaje visual a los recorridos existentes.
Las decisiones de apariencia proceden del compromiso explícito de la spec 004,
registrado en `ROUND-2-CONTEXT.md`. Esta planificación no fija colores, fuentes,
formas ni una composición antes de esa elección. La implementación visual usa
ese documento como entrada y presenta ajustes materiales para decisión humana.

Las specs 001–003 entregan los contratos de saldo, compensación y recomendación.
La integración final consume esos resultados y sus estados. El servidor conserva
la autoridad de cálculo y autorización. Los controles funcionales pueden existir
antes en el estilo vigente y recibir aquí su adaptación visual.

## Archivos y responsabilidades

Las rutas de esta tabla se expresan desde la raíz del repositorio.

| Archivo existente o nuevo                                                                                                                                                                                                          | Cambio y responsabilidad                                                                                                                        | RF cubiertos           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `src/app/globals.css`                                                                                                                                                                                                              | Aplicar reglas comprometidas mediante propiedades semánticas y estilos compartidos, incluyendo foco, reflow y reducción de movimiento           | RF-1, RF-6, RF-7       |
| `src/app/layout.tsx`, `src/app/manifest.ts`                                                                                                                                                                                        | Mantener idioma, metadatos y PWA y alinear tipografía y color de navegador con la dirección aprobada                                            | RF-1, RF-7             |
| `src/app/(protected)/layout.tsx`, `src/components/app-navigation.tsx`, `src/components/logout-button.tsx`                                                                                                                          | Adaptar navegación, encabezado y menú de cuenta conservando rutas, foco, estado activo y acciones por rol                                       | RF-1, RF-5, RF-7       |
| `src/components/ui/page-heading.tsx` — nuevo                                                                                                                                                                                       | Compartir título y descripción cuando las páginas repitan la misma estructura semántica                                                         | RF-1, RF-4             |
| `src/components/ui/form-feedback.tsx` — nuevo                                                                                                                                                                                      | Compartir presentación de mensajes de error, éxito y progreso con rol y asociación accesibles, sin gestionar peticiones ni datos del formulario | RF-3, RF-5, RF-6, RF-7 |
| `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/recuperar/page.tsx`, `src/components/forms/login-form.tsx`                                                                                           | Renovar acceso y recuperación conservando autenticación, validación y recuperación administrativa actuales                                      | RF-1, RF-6, RF-7       |
| `src/app/(protected)/dashboard/page.tsx`, `src/components/dashboard/metric-card.tsx`, `src/components/dashboard/daily-quick-register.tsx`, `src/components/dashboard/balance-chart.tsx`                                            | Jerarquizar deuda, recuperación, crédito y acciones consumiendo 001–003, con alternativa textual al gráfico                                     | RF-1, RF-2, RF-6, RF-7 |
| `src/app/(protected)/registro/page.tsx`, `src/components/registration/daily-entry-form.tsx`                                                                                                                                        | Adaptar registro, descanso, compensación y simulación de 002–003, conservando entrada del usuario ante errores                                  | RF-1, RF-3, RF-6, RF-7 |
| `src/app/(protected)/historial/page.tsx`, `src/app/(protected)/reportes/page.tsx`, `src/components/forms/report-form.tsx`                                                                                                          | Presentar persona, período, unidades, saldo previo y resultados de 001–002 con tablas y filtros accesibles                                      | RF-1, RF-4, RF-6, RF-7 |
| `src/app/(protected)/perfil/page.tsx`, `src/components/forms/profile-form.tsx`                                                                                                                                                     | Aplicar la dirección a datos y contraseña con foco, errores asociados y estados de envío independientes                                         | RF-1, RF-6, RF-7       |
| `src/app/(protected)/administracion/page.tsx`, `src/components/forms/create-user-form.tsx`, `src/components/admin/create-schedule-form.tsx`, `src/components/admin/user-admin-row.tsx`, `src/components/admin/admin-entry-row.tsx` | Adaptar altas, edición, restablecimiento, eliminación y corrección, conservando validación y consecuencias visibles                             | RF-1, RF-5, RF-6, RF-7 |
| `src/app/(protected)/loading.tsx`, `src/app/(protected)/error.tsx` — nuevos                                                                                                                                                        | Mostrar carga de páginas y fallo recuperable de lectura con reintento, sin sustituir los errores propios de formularios                         | RF-6, RF-7             |
| `src/app/offline/page.tsx`, `src/components/pwa/online-status.tsx`                                                                                                                                                                 | Adaptar estado sin conexión y su lectura sin tapar contenido o foco                                                                             | RF-1, RF-6, RF-7       |
| `public/sw.js`                                                                                                                                                                                                                     | Renovar la versión de caché al entregar los recursos visuales, conservando la exclusión de API y HTML autenticado                               | RF-1, RF-6             |
| `STYLEGUIDE.html` — nuevo, tras aceptación                                                                                                                                                                                         | Documentar reglas aplicadas, componentes, estados, variación permitida y comprobaciones pendientes en una guía autocontenida                    | RF-8                   |
| `specs/005-redisenio-interfaz-integral/validation.md` — nuevo durante validación                                                                                                                                                   | Consolidar evidencia por RF, muestra de auditoría, limitaciones y aceptación humana                                                             | RF-1 a RF-8            |

Los componentes nuevos se limitan a repeticiones reales identificadas arriba.
Los controles de recomendación que incorpore la spec 003 se adaptan en su archivo
definido allí. Se conserva una sola implementación de cada control y cálculo.

## Contratos y flujo de presentación

Las páginas de servidor siguen leyendo sesión y datos y pasan únicamente los
campos necesarios a los componentes cliente. Los formatos de respuesta y los
permisos permanecen bajo responsabilidad de las API y servicios existentes.
El rediseño no añade modelos Prisma ni migraciones.

Cada formulario mantiene sus valores de edición localmente mientras una petición
está pendiente o falla. Sus mensajes distinguen error de campo, fallo global y
éxito. Un cambio de fecha o persona conserva las reglas de selección de la spec
funcional correspondiente y no reutiliza una respuesta tardía de otra selección.

```text
leer sesión y datos autorizados en el servidor
recibir saldos y estados de 001–003 con su fecha de corte
presentar valores mediante formatMinutes y etiquetas consistentes
al enviar un formulario, conservar valores y mostrar envío pendiente
si falla, mostrar errores asociados y permitir corregir o reintentar
si termina, confirmar el resultado y refrescar datos mediante el flujo existente
```

Las operaciones temporales nuevas pertenecen a 001–003, con referencia explícita.
Esta spec reutiliza sus resultados, `formatMinutes` y las utilidades de fechas
existentes. Evita nuevos cálculos de saldo o de salida en la capa de presentación.

## Interfaz y semántica

El shell conserva las rutas públicas y protegidas y los redireccionamientos de
calendario y permisos. La navegación identifica la página actual, facilita saltar
al contenido principal y evita que elementos fijos oculten el foco o las acciones.
Cada página tiene un título principal propio y una secuencia de encabezados coherente.

El resumen distingue crédito disponible y tiempo recuperado. El acceso a registrar
y simular utiliza los controles definidos en 002–003. Los registros confirmados,
las estimaciones y la fecha de corte se identifican mediante texto.

Los campos mantienen etiquetas visibles, instrucciones y errores mediante
`aria-describedby` y `aria-invalid`. El primer campo inválido recibe foco al enviar
cuando resulte necesario para encontrar el error. Los mensajes de estado usan
`role="status"` y los errores que requieren atención usan `role="alert"`, evitando
anuncios duplicados. Se conserva el funcionamiento de gestores de contraseñas y pegado.

En administración se muestran los datos afectados y la consecuencia de eliminar,
restablecer o corregir antes de confirmar. Si se adopta una interacción desplegable,
mantiene disparador identificable, estado expandido y retorno de foco al cerrarse.
Se conservan los formularios y operaciones actuales, sin incorporar aprobación laboral.

Los textos largos pueden envolver y las cantidades mantienen sus unidades.
Las tablas usan encabezados y desplazamiento propio cuando sea necesario y siguen
siendo operables por teclado. La información del gráfico dispone de equivalente
textual con fechas y saldos, derivado del mismo conjunto de datos.

## Decisiones técnicas

| Decisión                                             | Justificación                                                             | Alternativa descartada                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Tailwind y CSS existente con reglas derivadas de 004 | El stack actual permite aplicar una dirección propia sin otra dependencia | Adoptar una plantilla, biblioteca de componentes o tema predeterminado           |
| Componentes cliente actuales y validación existente  | Conserva comportamiento y valores introducidos                            | Reescribir formularios o introducir un gestor global de estado                   |
| Servicios existentes como fuente de saldo            | Permite coherencia con historial y exportaciones                          | Calcular una segunda versión del saldo en componentes                            |
| Auditoría por páginas y estados representativos      | Cubre interacción real y permite rastrear hallazgos                       | Dar conformidad por lectura de código o por un escaneo único                     |
| Recursos aprobados por la dirección comprometida     | La licencia y la compatibilidad forman parte de la entrega                | Incrustar fuentes externas o modificar la CSP para acomodar recursos por defecto |

Lucide y Recharts ya están instalados y producen SVG en ejecución. Su reutilización
se evalúa explícitamente después del compromiso de 004, con su licencia y aceptación
como componentes de terceros. La autoría de la dirección no generará ni editará SVG,
ni una familia de iconos. Si su uso resulta incompatible con la dirección o sus
restricciones, se presenta la decisión al usuario antes de implementar la alternativa.
Los iconos PWA existentes permanecen como entradas preexistentes a evaluar, sin
reemplazo automático ni una nueva dependencia de imágenes.

## Datos, compatibilidad y entrega

La base remota conserva el permiso de lectura. Las pruebas de login, logout,
contraseña, altas, eliminaciones, correcciones y registro utilizan exclusivamente
una base aislada autorizada. El cambio de apariencia no autoriza escrituras remotas.
Los datos de prueba cubren deuda, saldo cero, crédito, día compensado, datos vacíos,
motivos largos y roles distintos. Los documentos de evidencia excluyen credenciales.

El rollout aplica primero la dirección al shell y reglas compartidas, después a
acceso y recorridos personales y finalmente a administración y estados PWA.
Cada área se verifica antes de integrar la siguiente. La aceptación final requiere
la misma dirección en todas las pantallas y los contratos de 001–003 operativos.
Si el desglose posterior supera diez tareas o una tarea excede unos 20–30 minutos,
se presenta la división de alcance requerida por SDD antes de implementar.

Los PDF y Excel conservan su formato. Su saldo procede de la spec 001 y sus
descargas siguen disponibles desde la interfaz renovada. El service worker mantiene
recursos estáticos y fallback offline, sin caché transaccional ni sincronización nueva.

## Estrategia de verificación

Esta sección prescribe comprobaciones futuras. Su ejecución se registrará durante
implementación y validación, con sus resultados reales y las limitaciones encontradas.

| RF   | Evidencia prevista                                      | Comando o procedimiento                                                                                     | Entorno                                                 |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| RF-1 | Recorrido y correspondencia con `ROUND-2-CONTEXT.md`    | Abrir todas las páginas del alcance, revisar consola, estados y aceptación visual                           | Navegador, cuenta USER y ADMIN de prueba                |
| RF-2 | Deuda, cero, recuperación y crédito distinguibles       | Fixtures de 001–003, acciones de registro y simulación, comparación con sus resultados de servidor          | Base aislada                                            |
| RF-3 | Entrada, descanso, compensación y error conservan datos | Registrar y editar, inducir validación y fallo de red y comprobar reintento y resultado                     | Base aislada                                            |
| RF-4 | Persona, período, unidades y saldos coherentes          | Consultar período con saldo anterior y descargar PDF/Excel, usando los casos aprobados de 001               | Base aislada                                            |
| RF-5 | Acciones y restricciones por rol                        | Probar altas, edición, restablecimiento, eliminación y corrección con cancelación, error y éxito            | Base aislada                                            |
| RF-6 | Carga, vacío, error, éxito y offline                    | Respuesta retardada, fallo controlado, desconexión y formulario con valores introducidos                    | Navegador y aplicación local                            |
| RF-7 | Teclado, foco, reflow y evidencia WCAG                  | Recorridos a 375 y 1280 px, reflow a 320 px efectivos, zoom, movimiento reducido y auditoría descrita abajo | Navegador, lectores de pantalla para los puntos humanos |
| RF-8 | Guía vinculada a pantallas aceptadas                    | Revisar reglas, componentes, estados, licencias y variaciones de `STYLEGUIDE.html` con el usuario           | Archivos y navegador                                    |

Ejecutar `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`
y `npm run security:secrets` según los archivos intervenidos. Ejecutar integración
solo con `TEST_DATABASE_URL` aislada autorizada. La línea base previa incluye un
aviso de variable sin uso y tres fallos de integración documentados en `MEMORY.md`.
Se conservan como resultados previos y se contrastan con los cambios funcionales.
Los comportamientos puramente visuales se verifican en navegador. Los tests de
lógica de 001–003 permanecen en Vitest y no se duplican para probar clases CSS.

### Evaluación de interfaz y accesibilidad

`web-design-guidelines` obtiene las reglas oficiales vigentes al realizar la revisión
del código. `accessibility-audit` define alcance WCAG 2.2 AA y la muestra de login,
dashboard, registro, historial, reportes, perfil, administración y offline con sus
estados relevantes. `accessibility-scan` y `accessibility-inspect` trabajan sobre
el mismo estado y deduplican criterios antes de evaluar. Los hallazgos señalan
selector, evidencia y archivo/línea cuando el motor aporte su correspondencia.

Antes de modificar la UI se captura una referencia de accesibilidad del entorno
aislado y su revisión de código. La comparación posterior reutiliza esa referencia
con `accessibility-diff` cuando los estados sean comparables. Un árbol alternativo
o copia de baseline sirve para comparar versiones sin stashear ni cambiar de rama
en el directorio de trabajo actual del usuario. La deriva de selectores se declara.

`accessibility-fix` aplica las correcciones de los hallazgos dentro del alcance
aprobado y repite la misma comprobación. El informe distingue resultados verificados,
hallazgos por confirmar y comprobaciones humanas de lector de pantalla. Una herramienta
ausente o un criterio no ejercitado se registra como pendiente o indeterminado.
El resultado de evaluación y la aceptación visual se presentan por separado.

## Aprobación

Aprobado por el usuario el 11 de noviembre de 2026 mediante «apruebo»,
con alcance a los cinco planes presentados y su desglose en tareas.
La elección visual y la implementación conservan sus aprobaciones correspondientes.
