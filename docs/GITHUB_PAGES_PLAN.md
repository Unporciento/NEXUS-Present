# Publicación mediante GitHub Pages

Fuente aprobada: rama `gh-pages`, raíz, con el contenido exacto de `dist/`.

## Procedimiento

1. Generar `dist/` con `npm run build` desde `main` certificado.
2. Sustituir de forma no destructiva el contenido de `gh-pages` mediante `git worktree` temporal.
3. Publicar solo archivos allowlisted del build; nunca fuentes de respaldo, evidencias ni `node_modules`.
4. Configurar Pages con `build_type: legacy`, rama `gh-pages` y ruta `/`.
5. Validar base path, 404, MIME, favicon, imports, IndexedDB, importación, Studio, Player y paquetes.

URL esperada: `https://unporciento.github.io/NEXUS-Present/`. Desactivar Pages no elimina datos IndexedDB del navegador; solo retira el acceso público.
