# Spec 005 — Renovación integral de la interfaz

Estado de la spec — aprobada
Fase actual — tareas

## Contexto y objetivo

La interfaz debe ofrecer una experiencia coherente con la dirección visual elegida
y hacer comprensible el balance de tiempo de cada persona. La renovación comprende
acceso, navegación, resumen, registro, historial, reportes, perfil, administración
y estados de conexión. Las mejoras funcionales de horas adelantadas y salida
anticipada tienen sus especificaciones independientes y se integran en este recorrido.

## Usuarios y actores

- Persona usuaria que consulta saldo, registra jornadas y revisa sus reportes.
- Administrador que gestiona personas, horarios y correcciones y consulta reportes autorizados.
- Persona responsable del proyecto, que aprueba la aplicación de la dirección visual.

## Historias de usuario

- HU-1. Como persona usuaria, quiero reconocer mi saldo y la siguiente acción útil para organizar mi jornada.
- HU-2. Como persona usuaria, quiero registrar y corregir mis tiempos desde móvil o escritorio con información consistente.
- HU-3. Como administrador, quiero gestionar los registros con la misma claridad visual y con sus consecuencias visibles.
- HU-4. Como persona que usa teclado, zoom o tecnología de asistencia, quiero poder completar los recorridos principales.

## Requisitos funcionales

- RF-1. CUANDO una persona navegue por acceso, recuperación de acceso, resumen, registro, historial, reportes, perfil, administración o estado sin conexión, EL SISTEMA aplicará la dirección visual comprometida y mantendrá una jerarquía consistente de acciones y contenido.
- RF-2. CUANDO una persona consulte su resumen, EL SISTEMA distinguirá horas pendientes, recuperación de deuda y horas adelantadas disponibles y dará acceso a registrar jornada y consultar la salida anticipada.
- RF-3. CUANDO una persona registre o edite su jornada, EL SISTEMA mostrará los datos introducidos, su efecto sobre el saldo y el resultado de confirmación o error junto a la acción correspondiente.
- RF-4. CUANDO una persona consulte historial o reportes, EL SISTEMA presentará período, persona consultada, unidades y sentido del saldo con los mismos términos usados en el resumen.
- RF-5. CUANDO un administrador gestione personas, horarios o correcciones, EL SISTEMA mantendrá accesibles las acciones autorizadas y mostrará confirmaciones, errores y consecuencias pertinentes a cada operación.
- RF-6. CUANDO el contenido esté cargando, vacío, en error, confirmado o sin conexión, EL SISTEMA mostrará el estado y las acciones disponibles sin perder los valores del formulario por un error de validación o de red.
- RF-7. CUANDO una persona utilice móvil, escritorio, teclado o ampliación del contenido, EL SISTEMA permitirá completar los recorridos principales y reconocer foco, campos, errores y estados sin depender exclusivamente del color.
- RF-8. CUANDO el usuario apruebe las pantallas renovadas, EL SISTEMA conservará una guía reutilizable de la dirección aplicada con ejemplos de estados y criterios para ampliar la interfaz de forma coherente.

## Requisitos no funcionales

- La apariencia debe corresponder a la dirección comprometida en la [spec 004](../004-direccion-visual/spec.md), cuya aceptación visual corresponde al usuario.
- El objetivo de accesibilidad es WCAG 2.2 AA en las pantallas intervenidas. El informe distinguirá evidencia comprobada, hallazgos y puntos que requieren evaluación humana.
- Se comprobarán los recorridos principales a 375 y 1280 píxeles de ancho. A 320 píxeles de ancho efectivo, la información y las acciones deben seguir disponibles sin desplazamiento horizontal de toda la página.
- Las tablas que necesiten dos dimensiones conservarán sus encabezados y acciones accesibles en su propio contenedor.
- Las acciones interactivas tendrán foco visible y un nombre accesible. Los errores identificarán el campo y la acción para corregirlo.
- El movimiento respetará la preferencia de reducción de animaciones.
- La interfaz y sus mensajes estarán en español. La carga de recursos visuales respetará las restricciones de conexión y licencias aprobadas.
- La revisión visual empleará datos de prueba y entornos autorizados para cada operación.

## Dependencias

- La [spec 001](../001-horas-adelantadas/spec.md) define adelanto, recuperación y coherencia de saldo.
- La [spec 002](../002-compensacion-salida-temprana/spec.md) define el registro compensado de tiempo faltante.
- La [spec 003](../003-recomendacion-de-salida/spec.md) define simulación y recomendación.
- La spec 004 define la dirección visual que se aplicará a todas las pantallas.

## Casos límite

- Persona sin registros, sin horario asignado o sin compañeros administrables.
- Deuda, saldo cero, crédito positivo y cantidades que ocupen más espacio que los ejemplos iniciales.
- Nombre, correo o motivo largo, y validación de campos con contenido introducido previamente.
- Pérdida de conexión o respuesta fallida durante una operación y reintento posterior.
- Acciones permitidas a un administrador y restringidas a una persona usuaria.
- Navegación con teclado, zoom, reducción de movimiento y pantalla estrecha.
- Períodos con saldo anterior, registros corregidos y una jornada compensada completa.

## Fuera de alcance

- Cambios de política de permisos, recuperación de contraseña o de roles ajenos a las specs funcionales.
- Nuevos módulos de nómina, aprobación laboral, equipos o notificaciones.
- Rehacer los formatos de documentos descargables por motivos exclusivamente estéticos. Su coherencia de saldo se define en la spec 001.
- La ejecución de escrituras sobre la base remota requiere una autorización específica distinta de la revisión de estas pantallas.

## Criterios de finalización

- Se comprobaron los recorridos de acceso, consulta, registro, historial, reportes, perfil y administración en un entorno autorizado.
- Cada pantalla intervenida respeta la dirección comprometida y sus estados están revisados.
- Cada RF tiene evidencia de comprobación y las limitaciones están documentadas.
- La evaluación de accesibilidad identifica resultados por criterio y las comprobaciones humanas pendientes.
- La persona responsable aprobó las pantallas y la guía de continuidad.
- El usuario aprobó el cierre de la spec.

## Dudas abiertas

La decisión visual depende de la spec 004. Se conserva el alcance de las pantallas
existentes y se incorporan los controles definidos por las specs funcionales.

## Clarificación

Revisión QA realizada el 11 de noviembre de 2026, sin hallazgos bloqueantes en
ambigüedades, contradicciones, límites o conflictos con la constitución.
El usuario aprobó esta clarificación el 11 de noviembre de 2026. Esta revisión
documental no acredita implementación ni validación de los RF.

## Aprobaciones

| Fase           | Decisión explícita del usuario             | Fecha      | Alcance aprobado                                                          |
| -------------- | ------------------------------------------ | ---------- | ------------------------------------------------------------------------- |
| Especificación | Aprobada por el usuario mediante «apruebo» | 2026-11-11 | Contenido presentado de las specs 001–005 y paso a revisión QA            |
| Clarificación  | Aprobada por el usuario mediante «apruebo» | 2026-11-11 | Aclaraciones QA incorporadas de las specs 001–005 y preparación de planes |

Aprobación del plan registrada el 11 de noviembre de 2026 mediante «apruebo».
El alcance aprobado permite su desglose en tareas.

## Validación y cierre

Todos los RF están pendientes de validación. La revisión de requisitos, la prueba
de recorridos y la aceptación visual se registrarán como resultados diferenciados.
