# Studio UI — Fase 5B

`studio.html` monta `StudioApp`, que se suscribe una sola vez a StudioController y representa shell, metadatos, lista, editor de escena, estado, undo/redo y eliminación confirmada. La UI solo despacha comandos; no accede al historial ni modifica el borrador.

Las entradas de texto se confirman en `change` (confirmación o pérdida de foco), evitando snapshots por pulsación. Los tipos, layouts y bloques se obtienen de registros. La interfaz no ofrece preview, exportación, almacenamiento, drag and drop ni editor libre.

En móvil las columnas se apilan; los botones tienen mínimo 44 px. El DOM simulado cubre estructura básica; lector de pantalla y dispositivos físicos siguen pendientes.
