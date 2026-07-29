# Contrato de Studio

Studio recibe `SourcePresentationDocument` y devuelve un borrador inmutable, diagnósticos y comandos. `PreviewBridge` llama `createPublicPresentation(source)` y solo entrega el resultado válido a Player. Player clona su entrada; Studio nunca accede a sus datos internos.

La futura exportación exigirá validación positiva. Fase 5C solo usa la conversión pública en memoria para preview; no serializa, descarga ni publica archivos.

Los comandos implementados cubren metadatos, escenas, layouts, bloques de texto y tema. Cada uno recibe datos estructurados, devuelve errores comprensibles y no muta la entrada. Preview no es un comando del Controller ni entra en undo/redo.
