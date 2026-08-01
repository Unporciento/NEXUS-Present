# Plan propuesto de GitHub Pages

Estado actual: desactivado y fuera del alcance autorizado.

## Propuesta futura

1. Aprobar y fusionar `program/nexus-1.0-rc` en `main` mediante PR.
2. Generar `dist/` con `npm run build:rc` desde un commit limpio y certificado.
3. Publicar el contenido exacto del build mediante GitHub Actions oficial o rama dedicada inmutable; no servir el repositorio de desarrollo completo.
4. Aplicar permisos mínimos: `contents: read`, `pages: write`, `id-token: write` solo al job de deploy.
5. Mantener CSP y cabeceras dentro de las capacidades reales de Pages; no prometer cabeceras que Pages no controle.
6. Validar base paths, 404, MIME de módulos, favicon, assets y navegación directa.

No se crea workflow ni se cambia la configuración remota durante la RC. La URL pública, fuente y dominio se decidirán en la aprobación de lanzamiento.
