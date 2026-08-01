# Runtime portable

El paquete reutiliza Player, contratos, layouts, temas, renderers e Input Adapters de NEXUS. `RuntimeProvider` copia una lista cerrada de módulos locales; no clona el motor ni descarga código remoto.

`portable/runtime-app.js` obtiene `presentation.json` por HTTP, valida el documento, registra renderers y monta el Player. `StaticResourceManager` resuelve rutas verificadas, poster y WebVTT, conserva controles nativos y ofrece fallbacks recuperables. No accede a IndexedDB ni al estado privado del Studio.

## Apertura

1. Extraer el ZIP sin cambiar su estructura.
2. Iniciar un servidor HTTP estático en la carpeta que contiene `index.html`.
3. Abrir la URL HTTP indicada por el servidor.

`file://` no se declara compatible porque módulos ES y `fetch` están sujetos a políticas del navegador. El runtime sirve en alojamiento estático, pero NEXUS no publica ni activa Pages automáticamente.

## Ciclo de vida y validación

El Player libera teclado, tacto, multimedia y transiciones en `pagehide`. El runtime no crea Object URLs: usa rutas relativas. Recursos ausentes o codecs incompatibles no bloquean navegación.

La exportación se prueba por contenido, determinismo e integridad; la importación vuelve a comprobar hashes. Para certificar un paquete se sirve por HTTP y se recorre el Player real. Una inspección local no equivale a garantía universal de codec o dispositivo.
