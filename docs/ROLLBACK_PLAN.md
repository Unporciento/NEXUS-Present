# Plan de rollback

## Puntos recuperables

- Base previa al programa: rama `backup/pre-nexus-1.0-rc`, tag `backup-pre-nexus-1.0-rc` y bundle externo verificado.
- Checkpoints: `rc-phase-6-complete`, `rc-phase-7-complete`, `rc-phase-8-complete`, `rc-phase-9-complete`.
- `main` permanece en `8c108df87ce40747405f6dbd7092f582194ecfae` hasta autorización humana.

## Procedimiento futuro

1. Detener nuevas publicaciones sin borrar datos locales.
2. Identificar el último commit/tag certificado y verificar su firma/hash.
3. Configurar la fuente de Pages al artefacto anterior mediante cambio no destructivo.
4. Validar HTML, módulos, 404, importación y Player con caché limpia.
5. Documentar incidente, alcance, causa y versión retirada.

No usar force-push ni mover tags. No borrar ramas, artefactos o IndexedDB para “reparar”. La reversión de archivos publicados no migra ni modifica datos de usuario.
