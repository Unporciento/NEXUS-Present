# Accesibilidad

La interfaz usa encabezados, progreso textual, foco visible, controles de al menos 44 px en móvil y orden DOM coherente. Los layouts se apilan en móvil y el contenido sigue siendo comprensible sin animación. Imágenes requieren `alt`; un recurso ausente declara su estado. La verificación con lector de pantalla físico sigue pendiente.

NEXUS será navegable íntegramente por teclado, ratón y táctil. Mantendrá foco visible al cambiar escena, estructura semántica, nombres accesibles, contraste verificable y orden de tabulación predecible.

- Las escenas describen roles, títulos y alternativas para lector de pantalla.
- Diálogos contienen foco, permiten Escape y restauran origen.
- `prefers-reduced-motion` elimina movimiento no esencial.
- Zoom, texto ampliado, áreas seguras y orientación se prueban en iPhone Safari, Android, tablet y escritorio.
- Vídeo o audio significativo requiere subtítulos, transcripción o alternativa equivalente.
- Pantalla completa es mejora progresiva; su ausencia no bloquea uso.

## Revisión visual posterior a 5B

El 29/07/2026 se revisaron Player y Studio en Chrome real de escritorio servido por HTTP. Los tamaños móviles fueron emulados. Los temas `neutral` y `nexus` proporcionan tokens explícitos para texto, texto secundario, controles, estados, foco y footer; no dependen del negro predeterminado del navegador sobre superficies oscuras. El foco observado usa contorno sólido contrastado, los controles visibles miden al menos 44 px y el estado deshabilitado permanece reconocible.

Se comprobaron zoom de Chrome al 200 %, teclado, ausencia de desbordamiento horizontal y la regla `prefers-reduced-motion`. Quedan pendientes una auditoría automatizada WCAG completa, lector de pantalla real y dispositivos móviles físicos; por ello el resultado se registra como contraste AA orientativo, no como certificación formal.
