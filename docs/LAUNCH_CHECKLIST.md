# Checklist de lanzamiento NEXUS 1.0

## Antes de aprobar

- [x] Revisar `program/nexus-1.0-rc` y el tag `rc-phase-9-complete`.
- [ ] Completar pruebas físicas de Safari/iPhone, Android y al menos otro navegador de escritorio.
- [x] Ejecutar suite, verificador documental, secretos y rutas; auditoría externa queda declarada.
- [x] Comparar checksum del artefacto y abrirlo desde servidor HTTP limpio.
- [x] Confirmar legal, privacidad, accesibilidad, soporte y avisos de terceros.

## Publicación futura con autorización separada

- [x] Crear y validar `release/nexus-1.0.0` desde el programa RC.
- [x] Cambiar versión de `1.0.0-rc.1` a `1.0.0` en la fuente central y regenerar lock/build.
- [ ] Crear tag `v1.0.0` solo después de la validación final.
- [ ] Configurar Pages según [GITHUB_PAGES_PLAN.md](GITHUB_PAGES_PLAN.md).
- [ ] Ejecutar smoke test y checklist post-lanzamiento.

## Post-lanzamiento

- [ ] Comprobar portada, Biblioteca, Studio, 404 y assets con caché limpia.
- [ ] Verificar importación/exportación local sin pérdida de datos.
- [ ] Confirmar que no se publicaron borradores, evidencias ni bundles privados.
- [ ] Registrar commit, URL, hora, checksum y responsable.
- [ ] Si falla un criterio crítico, aplicar [ROLLBACK_PLAN.md](ROLLBACK_PLAN.md).
