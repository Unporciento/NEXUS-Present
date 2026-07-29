# Contrato propuesto de Studio

Studio recibe `SourcePresentationDocument` y devuelve un borrador inmutable, diagnósticos y comandos. `PreviewBridge` llama `createPublicPresentation(source)` y solo entrega el resultado válido a Player. Player clona su entrada; Studio nunca accede a su DOM interno.

La exportación exige validación positiva, fija `contractVersion`, elimina `presenter`, `editorial`, `history`, `privateData` y estado interno, y serializa JSON legible de forma determinista. Si falla, no genera archivo ni publica nada.

Comandos futuros: `setMetadata`, `addScene`, `updateScene`, `moveScene`, `removeScene`, `setTheme`. Cada uno recibe datos estructurados, devuelve errores comprensibles y no muta la entrada.
