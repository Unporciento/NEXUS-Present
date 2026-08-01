# Revisión responsive — Fase 3

Revisión por emulación CSS/manual, no por dispositivos físicos: 320×568, 375×667, 390×844, 768×1024, 1024×768 y 1366×768.

En todos los tamaños, la interfaz usa un contenedor fluido, botones de 44 px en móvil, foco visible, progreso textual y sin anchuras fijas. Debe verificarse visualmente antes de integrar: ausencia de desbordamiento horizontal, títulos largos, texto al 200 %, error, finalización y orientación. No se declara certificación física de iPhone/Android.

## Revisión de lanzamiento 1.0

El 01/08/2026 se revisaron Entrada, Biblioteca, Studio y Player en Chromium real de escritorio servido por HTTP, con viewports emulados de 320×568, 360×640, 375×667, 390×844, 412×915, 768×1024, 820×1180, 1024×768, 1366×768 y 1920×1080. Las 40 combinaciones quedaron sin desbordamiento horizontal y los controles visibles midieron al menos 44 px.

Se recorrieron tarjetas, formularios, recursos, preview, ayuda, onboarding, importación, respaldo, imagen, video, subtítulos, temas y paquete portable. Se comprobó foco visible y operación por teclado. `prefers-reduced-motion` está cubierto por CSS y pruebas; la automatización disponible no permitió confirmar zoom nativo al 200 %, Safari, Firefox, lector de pantalla ni equipos iPhone/Android físicos. Esos límites no se presentan como pruebas realizadas.
