# Accesibilidad

La interfaz usa encabezados, progreso textual, foco visible, controles de al menos 44 px en móvil y orden DOM coherente. Los layouts se apilan en móvil y el contenido sigue siendo comprensible sin animación. Imágenes requieren `alt`; un recurso ausente declara su estado. La verificación con lector de pantalla físico sigue pendiente.

NEXUS será navegable íntegramente por teclado, ratón y táctil. Mantendrá foco visible al cambiar escena, estructura semántica, nombres accesibles, contraste verificable y orden de tabulación predecible.

- Las escenas describen roles, títulos y alternativas para lector de pantalla.
- Diálogos contienen foco, permiten Escape y restauran origen.
- `prefers-reduced-motion` elimina movimiento no esencial.
- Zoom, texto ampliado, áreas seguras y orientación se prueban en iPhone Safari, Android, tablet y escritorio.
- Vídeo o audio significativo requiere subtítulos, transcripción o alternativa equivalente.
- Pantalla completa es mejora progresiva; su ausencia no bloquea uso.
