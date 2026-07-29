# Publicación

La estrategia prevista es estática y portable. GitHub Pages es candidato inicial mediante un adaptador, no una dependencia del motor; no está activada durante Fase 1.

- La publicación futura incluirá favicon, iconos instalables, metadatos, footer y `© {año automático} NEXUS. Todos los derechos reservados.`
- Habrá página 404 propia, manifest y Service Worker solo después de aprobación.
- La caché será versionada; una actualización se ofrece al usuario y nunca invalida una sesión silenciosamente.
- La reversión conservará una versión publicada anterior y una clave de caché recuperable.
- Antes de publicar: navegación, 404, offline, actualización, móvil, accesibilidad, rendimiento y seguridad.
- La URL estable apunta a la release activa; publicaciones y reversión se rigen por `PUBLICATION_CONTRACT.md`.
