# Plan de rollback

## Puntos recuperables

- Base previa al programa: rama `backup/pre-nexus-1.0-rc`, tag `backup-pre-nexus-1.0-rc` y bundle externo verificado.
- Checkpoints: `rc-phase-6-complete`, `rc-phase-7-complete`, `rc-phase-8-complete`, `rc-phase-9-complete`.
- `main` permanece en `8c108df87ce40747405f6dbd7092f582194ecfae` hasta autorización humana.
- Respaldo inmediato del lanzamiento: rama `backup/pre-nexus-1.0-release`, tag `backup-pre-nexus-1.0-release` y bundle `nexus-pre-release-1.0.0.bundle` con SHA-256 `771F72B2BA690043B79D3FD232D65563D80E92C7A74954ED0A1E0A27559622E0`.

## Procedimiento

1. Detener nuevas publicaciones sin borrar datos locales.
2. Identificar el último commit/tag certificado y verificar su firma/hash.
3. Desactivar Pages o publicar en `gh-pages` el build del tag de respaldo mediante commit nuevo, sin reescribir historia.
4. Validar HTML, módulos, 404, importación y Player con caché limpia.
5. Documentar incidente, alcance, causa y versión retirada.

No usar force-push ni mover tags. No borrar ramas, artefactos o IndexedDB para “reparar”. La reversión de archivos publicados no migra ni modifica datos de usuario.
