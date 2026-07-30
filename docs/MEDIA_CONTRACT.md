# Contrato multimedia

## Imágenes

Formatos: PNG, JPEG, WebP y SVG seguro. Se comprueba extensión, MIME declarado y firma real. `alt` es obligatorio y admite hasta 300 caracteres. PNG y JPEG pueden registrar dimensiones sin decodificar la imagen completa.

SVG se decodifica como UTF-8, elimina comentarios y rechaza scripts, eventos, `foreignObject`, contenido embebido ejecutable, entidades, estilos y referencias externas. No se usa HTML arbitrario.

Estados: `idle`, `loading`, `ready`, `failed`, `unsupported`. Los dos últimos ofrecen fallback y permiten continuar.

## Video

Formatos: MP4 y WebM. NEXUS no transcodifica ni promete un codec: `canPlayType` decide la capacidad del navegador. Se usan controles nativos, `preload="metadata"` por defecto, título accesible y nunca autoplay con sonido.

Poster PNG/JPEG/WebP/SVG y subtítulos WebVTT son opcionales y se vinculan mediante `posterAssetId` y `captionsAssetId`. Los subtítulos se montan como `track kind="captions"` con etiqueta en español.

Al ocultar la pestaña, los videos gestionados se pausan. Al cambiar de escena se pausan, pierden su `src`, ejecutan `load` para liberar el decoder y se revocan las Object URLs. Fallo de video, poster o subtítulos es recuperable.

## Seguridad y portabilidad

El contrato público admite HTTPS, rutas relativas seguras y `nexus-asset:`. Rechaza `file:`, `data:`, JavaScript, rutas absolutas, barras invertidas y traversal. JSON conserva referencias, no Blobs; el empaquetado portable resolverá esas referencias en Fase 8.
