# Constitución de Control de Horas

Aprobada por el usuario el 10 de noviembre de 2026. Aplica a specs, planes y tareas.

1. **Stack mantenible.** Mantener Next.js, TypeScript, Prisma y PostgreSQL, y justificar cualquier dependencia nueva.
2. **Especificación viva.** Aprobar cada fase antes de avanzar y cambiar requisitos primero en la spec, después en el plan, las tareas y el código.
3. **Cálculos separados.** Separar cálculos e interfaz, usar minutos enteros y una fecha de referencia explícita en los nuevos cálculos temporales.
4. **Verificación por tarea.** Probar primero los cambios de lógica con Vitest y verificar cada tarea antes de marcarla terminada. Documentar los fallos previos sin presentarlos como comprobaciones exitosas.
5. **Protección de datos.** Preservar datos, contratos y permisos. Mantener la base remota en solo lectura hasta que el usuario autorice escrituras concretas.
6. **Idioma consistente.** Usar nombres de código en inglés e interfaz y documentación en español.
