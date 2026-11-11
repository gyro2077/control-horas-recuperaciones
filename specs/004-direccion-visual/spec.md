# Spec 004 — Dirección visual de Control de Horas

Estado de la spec — aprobada
Fase actual — tareas

## Contexto y objetivo

La persona responsable considera que la interfaz actual tiene la apariencia de una
plantilla genérica de IA. Quiere una identidad propia que ayude a entender el tiempo
trabajado, el tiempo pendiente y el tiempo disponible para salir antes. Esta spec
define la exploración y la elección de esa identidad antes de aplicarla a las pantallas.

## Usuarios y actores

- Persona responsable del proyecto, que evalúa las propuestas y decide la dirección.
- Personas que registran sus jornadas y necesitan distinguir deuda, recuperación y adelanto.
- Administradores que revisan jornadas y reportes.

## Historias de usuario

- HU-1. Como responsable, quiero comparar propuestas visuales propias del proyecto para elegir una identidad reconocible.
- HU-2. Como persona usuaria, quiero leer mis tiempos y sus consecuencias con claridad para decidir cuándo trabajar o compensar horas.

## Definiciones

- Dirección visual elegida es una propuesta que el usuario quiere explorar.
- Dirección visual comprometida es la propuesta que el usuario adopta explícitamente como base de la interfaz.
- Una propuesta exploratoria muestra lenguaje visual mediante palabras, números, color y espacio.

## Requisitos funcionales

- RF-1. CUANDO comience la exploración, EL SISTEMA presentará diez propuestas identificadas únicamente de A a J, accesibles individualmente y con igual importancia en la comparación inicial.
- RF-2. CUANDO se presenten las propuestas, EL SISTEMA utilizará el mismo contenido de trabajo en todas e incluirá las nociones de horas pendientes, recuperadas, adelantadas y salida anticipada.
- RF-3. CUANDO la persona evalúe una propuesta, EL SISTEMA permitirá apreciar una composición, jerarquía, tipografía, color y distribución del espacio propios de esa propuesta.
- RF-4. MIENTRAS no se haya recibido la primera reacción visual del usuario, EL SISTEMA mantendrá las explicaciones de las propuestas separadas de su presentación inicial para permitir una evaluación sin sugerir una favorita.
- RF-5. SI el usuario descarta las diez propuestas, ENTONCES EL SISTEMA recogerá su valoración y permitirá una nueva exploración cuando la solicite.
- RF-6. CUANDO el usuario comprometa explícitamente una dirección, EL SISTEMA conservará esa decisión y sus reglas para aplicarlas a la renovación de las pantallas.
- RF-7. CUANDO se entregue la dirección comprometida, EL SISTEMA dejará documentadas sus reglas de texto, números, color, espacio, adaptación móvil y estados, junto con las condiciones pendientes de comprobar en la interfaz real.

## Requisitos no funcionales

- La primera exploración utiliza exclusivamente texto, fondos planos, colores de texto y espacio.
- La exploración parte del problema y del lenguaje del proyecto. Su autoría creativa se mantiene en una sola persona o agente durante esta etapa.
- Las diferencias entre propuestas deben poder juzgarse visualmente por el usuario. El criterio de aceptación es su elección explícita.
- El contenido de trabajo estará en español e incluirá tildes, números, horas y minutos.
- Las fuentes y recursos adoptados deben contar con usos y licencias compatibles con su incorporación.
- La accesibilidad y la posibilidad de corregir errores se conservan como límites de la dirección elegida.

## Casos límite

- El usuario preselecciona varias propuestas sin comprometer todavía ninguna.
- La reacción es positiva pero no contiene una elección explícita.
- Ninguna propuesta satisface al usuario.
- La dirección elegida necesita ajustes para contenido largo, números negativos o lectura móvil.
- Una tipografía requiere una licencia o recurso que el usuario no acepta adquirir.
- Se detecta un impedimento de accesibilidad o implementación que exige revisar una decisión.

## Fuera de alcance

- Esta spec culmina con una dirección comprometida y sus reglas. La aplicación a las pantallas corresponde a la [spec 005](../005-redisenio-interfaz-integral/spec.md).
- Las propuestas exploratorias no se presentan como pantallas funcionales ni acreditan el funcionamiento del producto.
- Los cálculos de tiempo corresponden a las specs 001, 002 y 003.

## Criterios de finalización

- Se entregó el conjunto de diez propuestas para la valoración visual del usuario.
- El usuario eligió explícitamente la dirección que continuará y sus ajustes aceptados quedaron registrados.
- Las reglas de esa dirección permiten continuar la renovación de las pantallas.
- Se distinguieron revisión del contenido de las propuestas, elección humana y verificaciones pendientes de la interfaz real.
- El usuario aprobó el cierre de esta spec.

## Dudas abiertas

La dirección visual queda pendiente de la exploración y elección previstas en esta spec.
El mensaje original aporta contexto suficiente para comenzar esa exploración cuando se aprueben las fases correspondientes.

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

Todos los RF están pendientes de validación. La solicitud de rediseño autoriza
preparar esta especificación. La elección de una dirección y el cierre se
registrarán cuando el usuario revise los entregables correspondientes.
