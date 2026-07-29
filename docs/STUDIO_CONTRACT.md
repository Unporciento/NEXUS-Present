# Contrato de Studio

Studio recibe `SourcePresentationDocument` y devuelve un borrador inmutable, diagnósticos y comandos. `PreviewBridge` llama `createPublicPresentation(source)` y solo entrega el resultado válido a Player. Player clona su entrada; Studio nunca accede a sus datos internos.

La exportación 5D exige validación positiva y reutiliza la misma conversión pública. `ExportService` serializa; el adaptador del navegador descarga. Studio no guarda ni publica archivos. Consulta [EXPORT_SERVICE.md](EXPORT_SERVICE.md).

Fase 5E no modifica los contratos de Source o Public Presentation. `bindStudioGuidance` gestiona tutorial y ayuda; `sceneLabels` traduce solo la presentación visual. La preferencia `nexus:onboarding-version` es ajena al estado de StudioController y nunca contiene una presentación.

Los comandos implementados cubren metadatos, escenas, layouts, bloques de texto y tema. Cada uno recibe datos estructurados, devuelve errores comprensibles y no muta la entrada. Preview no es un comando del Controller ni entra en undo/redo.
