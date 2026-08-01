# Contrato del paquete NEXUS

## Propósito y versión

Un paquete `nexus-<slug>.zip` transporta un `PublicPresentationDocument`, sus recursos usados y un Player estático. `packageVersion` usa SemVer; el lector 1.x rechaza otra versión mayor. El paquete nunca contiene Source, historial, selección, dirty state, preview, recovery ni credenciales.

## Estructura 1.0.0

```text
nexus-<slug>/
  index.html
  presentation.json
  manifest.json
  runtime/
  assets/images/
  assets/videos/
  assets/posters/
  assets/captions/
  LEEME.txt
```

Solo se incluyen carpetas con archivos. JSON usa UTF-8, LF, dos espacios y salto final. La raíz, el orden de entradas, la fecha ZIP y la compresión son deterministas para entradas iguales.

## Manifiesto

Campos obligatorios: `packageVersion`, `engineVersion`, `contractVersion`, `presentation`, `assets`, `runtime` y `requiredCapabilities`. Cada archivo verificable declara `path`, `size` y `sha256`; cada asset añade `id`, `kind`, `filename`, `mime` y metadatos seguros.

Las rutas son relativas, NFC y con `/`. Se rechazan segmentos vacíos, `.`, `..`, barras inversas, rutas absolutas, controles y nombres reservados. Las URLs con caracteres no ASCII se codifican en el documento público, pero el nombre legible permanece en el ZIP.

## Límites defensivos

- ZIP comprimido: 250 MiB.
- Contenido expandido: 500 MiB.
- Entradas: 512.
- Relación de compresión por entrada: 100:1.
- Longitud de ruta: 240 caracteres.

La inspección central ocurre antes de descomprimir. Después se valida una raíz, lista cerrada, manifiesto, hashes y contrato público. No se ejecuta contenido importado.

## Exportación e importación

Exportar resuelve solo `assetId` usados y falla si falta un Blob o su scope no coincide. Importar verifica todo antes de persistir, crea `draftKey` y asset IDs nuevos, reescribe referencias y revierte escrituras parciales. Nunca sobrescribe un borrador.

## Exclusiones

No garantiza `file://`; requiere HTTP estático. No incluye ZIP anidado, plugins, scripts de usuario, CDN, publicación, PWA, backend, nube ni sincronización.
