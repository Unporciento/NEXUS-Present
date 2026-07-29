# Contrato de publicación

## Artefactos

| Contrato | Contenido | Prohibiciones |
|---|---|---|
| SourcePresentationDocument | documento editable local, notas, configuración editorial e historial permitido | código ejecutable y HTML no sanitizado |
| PublicPresentationDocument | contenido para audiencia, escenas, tema y recursos públicos | notas, historial interno, rutas locales y datos privados |
| PublicBundle | documento público validado, motor compatible, tema, recursos usados, metadatos, favicon, vista previa, 404, manifest si aplica, hashes y versión | secretos, recursos no usados y datos no autorizados |
| PublishedRelease | `releaseId`, `presentationId`, versión, motor, slug, destino, URLs, fecha, estado, hash, release previa y rollback | reescritura destructiva del historial |

## PublishAdapter

El proveedor se abstrae mediante `validateDestination`, `preparePublication`, `publish`, `update`, `rollback`, `retire`, `getUrl` y `reportError`. GitHub Pages será candidato inicial, no dependencia del motor. Ningún token personal se almacena en navegador, código, documento ni repositorio.

## URLs y releases

- URL estable: `/presentations/{slug}/`, siempre representa la release pública activa.
- URL versionada opcional: `/presentations/{slug}/versions/{version}/`.
- Una publicación fallida conserva la última release válida.
- La reversión es una nueva operación trazable que activa una release válida; no reescribe historia.
