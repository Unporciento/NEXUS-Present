# Studio UI — Fases 5B–5E

`studio.html` monta `StudioApp`, que se suscribe una sola vez a StudioController y representa shell, metadatos, lista, editor de escena, estado, undo/redo y eliminación confirmada. La UI solo despacha comandos; no accede al historial ni modifica el borrador.

Las entradas de texto se confirman en `change` (confirmación o pérdida de foco), evitando snapshots por pulsación. Los tipos, layouts y bloques se obtienen de registros. La interfaz no ofrece preview, exportación, almacenamiento, drag and drop ni editor libre.

En móvil las columnas se apilan; los botones tienen mínimo 44 px. El DOM simulado cubre estructura básica; lector de pantalla y dispositivos físicos siguen pendientes.

La raíz de Studio recibe el tema del borrador al montar y vuelve a aplicarlo al cambiar el selector. Encabezado, navegación de escenas, editor y acciones usan superficies diferenciadas; etiquetas, ayudas, estados, controles y footer consumen exclusivamente los tokens definidos por el tema. Los controles deshabilitados conservan legibilidad y la escena seleccionada se distingue mediante estado y borde, no solo por color.

La eliminación usa `<dialog>` local con Cancelar/Eliminar, Escape seguro, fallback mediante atributo `open` y devolución del foco al origen o al botón Añadir. Las pruebas DOM mínimas validan montaje, semántica, límites y limpieza; no sustituyen navegador real ni lector de pantalla.

Revisión visual del hotfix 29/07/2026: Chrome real de escritorio mediante HTTP local, con tamaños emulados 320×568, 390×844, 768×1024, 1024×768, 1366×768 y 1920×1080. Sin desbordamiento horizontal; controles visibles de 44 px; foco contrastado; footer y año correctos; columnas apiladas bajo 800 px; temas `neutral` y `nexus` legibles y diálogo visible. Se revisó zoom de Chrome al 200 %. No fue prueba física móvil ni validación con lector de pantalla real.

Capacidades reales de bloques: muestra tipos permitidos y edita texto de `heading` y `paragraph`; no ofrece CRUD completo. Onboarding completo queda reservado a 5E.

## Fase 5C

Studio añade un panel de validación y un botón explícito `Previsualizar`. PreviewBridge valida y transforma; StudioApp nunca crea manualmente un documento público. Tras editar, la vista queda `stale` y conserva el Player anterior hasta una actualización manual.

En escritorio, editor y preview conviven desde 1100 px. En móvil, los controles `Editar` y `Previsualizar` muestran una sola vista a la vez. El panel de errores agrupa diagnósticos contractuales y permite enfocar metadatos o seleccionar la escena afectada cuando la ruta lo permite.

Abrir, actualizar, cerrar y reabrir destruye la instancia anterior. El teclado del Player se enlaza al contenedor de preview y no navega mientras el foco está en formularios.

## Fase 5D

`Descargar presentación` permanece separado de `Previsualizar`, muestra `Formato JSON` como apoyo y usa siempre el borrador actual. `bindStudioExport` conecta la UI con `ExportService` y `BrowserDownloadAdapter` sin introducir Blob o URLs en `StudioApp`. Consulta [EXPORT_SERVICE.md](EXPORT_SERVICE.md).

## Fase 5E

El encabezado incorpora descripción, versión 1.0 y Ayuda. Onboarding y Ayuda se implementan en `bindStudioGuidance`; la única persistencia es la versión vista del tutorial. Los nombres de escenas son amigables sin cambiar identificadores. Los estados vacíos indican una acción y los términos de vista previa están unificados.

En escritorio amplio, edición y vista previa coexisten sin forzar scroll interno en el panel de edición. En móvil, `Editar` y `Previsualizar` alternan áreas sin destruir el borrador. El Player embebido recibe `showCopyright: false`; el Player independiente conserva derechos. Consulta [ONBOARDING.md](ONBOARDING.md) y [HELP_SYSTEM.md](HELP_SYSTEM.md).

La lista de diseños se obtiene del registro contractual y aplica nombres desde `layoutLabels`; el valor de cada opción sigue siendo el ID interno. La cuadrícula de dos columnas exige simultáneamente `data-preview-open=true` y un preview listo o desactualizado. Al cerrar la vista previa no queda una columna reservada.

La captura inicial de título vacío se tomó antes de que el campo perdiera foco: el DOM visual cambió, pero el evento `change` aún no había confirmado el valor en StudioController. Tras blur, Controller y validación se actualizan de forma síncrona; no existía un defecto del validador.
