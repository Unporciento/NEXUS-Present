# Studio UI — Fase 5B

`studio.html` monta `StudioApp`, que se suscribe una sola vez a StudioController y representa shell, metadatos, lista, editor de escena, estado, undo/redo y eliminación confirmada. La UI solo despacha comandos; no accede al historial ni modifica el borrador.

Las entradas de texto se confirman en `change` (confirmación o pérdida de foco), evitando snapshots por pulsación. Los tipos, layouts y bloques se obtienen de registros. La interfaz no ofrece preview, exportación, almacenamiento, drag and drop ni editor libre.

En móvil las columnas se apilan; los botones tienen mínimo 44 px. El DOM simulado cubre estructura básica; lector de pantalla y dispositivos físicos siguen pendientes.

La eliminación usa `<dialog>` local con Cancelar/Eliminar, Escape seguro, fallback mediante atributo `open` y devolución del foco al origen o al botón Añadir. Las pruebas DOM mínimas validan montaje, semántica, límites y limpieza; no sustituyen navegador real ni lector de pantalla.

Revisión 29/07/2026: navegador real de escritorio mediante HTTP local y tamaños emulados 320×568, 360×640, 375×667, 390×844, 412×915, 768×1024, 820×1180, 1024×768, 1366×768 y 1920×1080. Sin desbordamiento horizontal; controles visibles de 44 px; una `h1`; footer y año correctos; columnas apiladas bajo 800 px. No fue prueba física móvil ni validación con lector de pantalla real.

Capacidades reales de bloques: muestra tipos permitidos y edita texto de `heading` y `paragraph`; no ofrece CRUD completo. Preview queda reservado a 5C, exportación a 5D y onboarding completo a 5E.
