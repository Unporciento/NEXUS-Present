# Contrato de layouts

Layouts registrados: `centered`, `split`, `media-left`, `media-right`, `comparison`, `metric-focus`, `quote-focus`, `evidence-grid` y `closing-callout`. El contrato valida que cada bloque esté permitido por el layout antes de renderizar.

Los layouts en dos columnas se apilan bajo 600 px, conservan orden de lectura del documento y no usan posicionamiento absoluto como mecanismo general. `cover/hero` se representa como `centered` de manera compatible.

La compatibilidad exacta de tipo de escena, layout y bloques vive en `src/contracts/registry.js`; esta guía no la duplica.
