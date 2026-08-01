# Checklist de lanzamiento NEXUS 1.0

## Antes de aprobar

- [x] Revisar `program/nexus-1.0-rc` y el tag `rc-phase-9-complete`.
- [ ] Completar pruebas físicas de Safari/iPhone, Android y al menos otro navegador de escritorio.
- [x] Ejecutar suite, verificador documental, secretos, rutas y `npm audit` (0 vulnerabilidades).
- [x] Comparar checksum del artefacto y abrirlo desde servidor HTTP limpio.
- [x] Confirmar legal, privacidad, accesibilidad, soporte y avisos de terceros.

## Publicación final

- [x] Crear y validar `release/nexus-1.0.0` desde el programa RC.
- [x] Cambiar versión de `1.0.0-rc.1` a `1.0.0` en la fuente central y regenerar lock/build.
- [x] Crear tag `v1.0.0` solo después de la validación final.
- [x] Configurar Pages según [GITHUB_PAGES_PLAN.md](GITHUB_PAGES_PLAN.md).
- [x] Ejecutar smoke test y checklist post-lanzamiento.

## Post-lanzamiento

- [x] Comprobar portada, Biblioteca, Studio, 404 y assets desde el origen público.
- [x] Verificar importación, guardado, paquete y Player en el origen público.
- [x] Confirmar que no se publicaron borradores, evidencias ni bundles privados.
- [x] Registrar commit, URL, checksum y fuente de Pages.
- [ ] Si falla un criterio crítico, aplicar [ROLLBACK_PLAN.md](ROLLBACK_PLAN.md).
