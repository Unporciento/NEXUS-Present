# Publicación

NEXUS 1.0 usa una publicación estática y portable. GitHub Pages sirve exclusivamente el contenido generado en `dist/` desde la rama `gh-pages`; el motor no depende de GitHub ni de un backend.

- La publicación incluye favicon, metadatos, footer, año automático, derechos y página 404 propia.
- Manifest y Service Worker quedan fuera de 1.0; no se declara instalación PWA ni funcionamiento offline.
- La reversión conserva el tag, commit y build anterior; IndexedDB permanece únicamente en cada navegador y no se borra al retirar Pages.
- Antes de publicar se verifican navegación, subdirectorio, móvil emulado, accesibilidad, rendimiento y seguridad.
- La URL estable apunta a la release activa; publicaciones y reversión se rigen por `PUBLICATION_CONTRACT.md`.
