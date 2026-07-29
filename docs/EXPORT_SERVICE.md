# Servicio de exportación local

## Responsabilidades

`ExportService` no depende del DOM. Recibe el borrador actual, ejecuta `validateSourcePresentation`, reutiliza `createPublicPresentation`, ejecuta `validatePublicPresentation` y serializa el resultado. `BrowserDownloadAdapter` solo crea el `Blob`, la URL temporal y el enlace de descarga; siempre retira el enlace y revoca la URL.

Flujo: `SourcePresentationDocument → validación fuente → transformación pública → validación pública → JSON → descarga local`.

La exportación no depende del estado de la vista previa. Un preview `stale` no impide exportar un borrador actual válido.

## Formato determinista

- `PublicPresentationDocument` sin wrapper de Studio.
- UTF-8, MIME `application/json`, sin BOM.
- Sangría de dos espacios, saltos LF y un salto final.
- Orden contractual de propiedades y orden significativo de escenas y bloques.
- Sin timestamps, identificadores ni campos generados por exportar.
- Dos exportaciones del mismo borrador producen el mismo texto y bytes.

El nombre es `nexus-<slug>.json`. El slug usa minúsculas ASCII, elimina diacríticos y caracteres inseguros, colapsa guiones y limita el segmento a 64 caracteres. El fallback es `nexus-presentacion.json`.

## Privacidad y rutas

La conversión pública excluye `presenter`, `editorial`, `history`, `privateData`, selección, historial operativo, `dirty`, validación derivada y estado de preview. Los errores contienen código estable y contexto mínimo; nunca el documento completo.

Se conservan rutas relativas como `assets/images/portada.png`. Se rechazan rutas de unidad de Windows, `file:///`, `/Users/` y rutas UNC. No se copian recursos ni se produce ZIP. En una fase futura, el JSON y su carpeta `assets/` deberán viajar juntos.

## Estados y ciclo de vida

Servicio: `idle`, `validating`, `invalid`, `preparing`, `ready`, `stale`, `recoverable-error`, `destroyed`.

Interfaz/adaptador: añade `downloading` y `exported`. El botón queda deshabilitado durante la operación, el resultado se anuncia con `aria-live="polite"` y un error devuelve foco seguro.

Cada descarga crea una sola URL temporal y la revoca en `finally`. Las descargas repetidas no conservan Blobs o JSON anteriores. `destroy()` es idempotente, limpia la URL pendiente e impide nuevas operaciones.

## Límites de Fase 5D

No existen importación, selector de carpeta, historial de exportaciones, almacenamiento, autosave, empaquetado, copia de imágenes o videos, publicación, PWA, Service Worker, backend, sincronización ni IA.
