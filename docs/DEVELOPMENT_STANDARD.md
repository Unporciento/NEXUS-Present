# Estándar de desarrollo eficiente

## Propósito

Construir NEXUS Present con el menor consumo razonable de contexto, tiempo y tokens, sin reducir calidad, seguridad, documentación ni capacidad de reversión.

## Memoria y documentación

- `README.md`, `AI_HANDOFF.md`, `CHANGELOG.md` y la documentación de arquitectura son la memoria principal.
- Consultar esas fuentes antes de actuar y no volver a preguntar decisiones ya registradas.
- Cada documento tiene una responsabilidad concreta; no duplicar el mismo contenido entre ellos.
- Mantener la documentación breve, vigente y enfocada.

## Alcance de revisión

- Revisar a fondo los archivos modificados y sus dependencias directas.
- Reservar auditorías completas para migraciones, seguridad, releases, incidentes graves e hitos importantes.
- No reescribir módulos estables sin una razón demostrable.
- Mantener los archivos por debajo de 400 líneas cuando sea práctico; separar responsabilidades antes de superar ese límite.

## Pruebas y verificación

- Añadir pruebas solo para comportamiento nuevo o regresiones reales.
- No crear pruebas duplicadas ni eliminar pruebas útiles para ahorrar contexto.
- Usar `verify:quick` durante el desarrollo y la verificación completa antes de publicar.
- Mantener compatibilidad con PC e iPhone como requisito de validación.

## Entregas y cambios

- Una fase o módulo por rama, commit y validación.
- No implementar varias fases grandes en un mismo commit.
- Conservar cambios pequeños, reversibles y documentados.
- La identidad visual y el módulo UX permanecen separados de las funciones principales.
- Laboratorio es un requisito futuro: no se implementa antes de su fase aprobada.
- Nunca sacrificar seguridad, reversión, pruebas ni estabilidad para ahorrar tokens.

## Reporte final

Los reportes finales deben ser breves e incluir: resultado, cambios principales, pruebas aprobadas, archivos relevantes, rama y commit, riesgos y un checklist manual de hasta cinco pasos.
