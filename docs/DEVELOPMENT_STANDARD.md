# Estándar de desarrollo eficiente

## Memoria y alcance

`README.md`, `AI_HANDOFF.md`, `CHANGELOG.md` y `docs/` son la memoria principal. Consultarlos antes de actuar, sin repetir decisiones registradas ni duplicar documentación. Revisar a fondo solo archivos modificados y dependencias directas; auditorías completas se reservan para seguridad, migraciones, releases, incidentes graves e hitos.

## Cambios

- Una fase o módulo por rama, commit y validación.
- No reescribir módulos estables sin razón comprobable ni mezclar fases grandes.
- Mantener archivos bajo 400 líneas y responsabilidades únicas.
- UX e identidad visual permanecen separados de la función principal.
- Laboratorio es futuro; no se implementa antes de su fase.

## Pruebas y calidad

- Añadir pruebas solo para comportamiento nuevo o regresiones confirmadas.
- Cada defecto confirmado se convierte en prueba antes de corregirse.
- Usar `verify:quick` durante desarrollo y verificación completa antes de publicar.
- No eliminar pruebas útiles para ahorrar contexto.
- Validar PC, iPhone, accesibilidad, seguridad, reversión y estabilidad.

## Reporte final

Informar brevemente: resultado, cambios, pruebas, archivos, rama/commit, riesgos y hasta cinco pasos manuales.
