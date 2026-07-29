# Contrato de Studio

Studio recibe `SourcePresentationDocument` y devuelve un borrador inmutable, diagnósticos y comandos. `PreviewBridge` llama `createPublicPresentation(source)` y solo entrega el resultado válido a Player. Player clona su entrada; Studio nunca accede a sus datos internos.

La exportación 5D exige validación positiva y reutiliza la misma conversión pública. `ExportService` serializa; el adaptador del navegador descarga. Studio no guarda ni publica archivos. Consulta [EXPORT_SERVICE.md](EXPORT_SERVICE.md).

Los comandos implementados cubren metadatos, escenas, layouts, bloques de texto y tema. Cada uno recibe datos estructurados, devuelve errores comprensibles y no muta la entrada. Preview no es un comando del Controller ni entra en undo/redo.
