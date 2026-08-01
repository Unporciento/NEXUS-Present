# Arquitectura de recursos

## Separación

```text
Studio Assets UI
  → AssetRepository
    → AssetIndexedDbAdapter
      → store assets

Player DOM Adapter
  → ResourceManager
    → AssetRepository
    → MediaCapabilityDetector
    → ObjectUrlPool
```

La UI nunca usa IndexedDB. El documento referencia un recurso mediante `assetId` y una URL lógica `nexus-asset:<assetId>`; no conserva rutas del computador ni el Blob. `draftKey` delimita el alcance local.

## Registro persistido

- `assetId`, `draftKey`, `kind`, `filename`, `mime`, `size`;
- hash SHA-256 y Blob;
- metadata segura;
- `createdAt`, `updatedAt`, `schemaVersion`.

La base `nexus-present` pasa a versión 2. El store `assets` usa índices `draftKey`, `scopeHash`, `hash`, `kind` y `updatedAt`. `scopeHash = [draftKey, hash]` impide duplicar el mismo contenido dentro de un borrador.

## Operaciones

`AssetRepository` permite abrir, importar, consultar, listar, actualizar metadata, contar referencias, detectar huérfanos, eliminar y limpiar huérfanos con confirmación. Las escrituras de IndexedDB son transaccionales. Cuota, formato, MIME, nombre, hash, scope, recurso ausente y repositorio destruido producen errores estructurados.

`ObjectUrlPool` cuenta adquisiciones. Cada cambio de escena libera sus referencias; `destroy` revoca lo restante. `ResourceManager` pausa videos, retira `src`, reinicia el elemento y cancela resoluciones anteriores. Un recurso roto nunca bloquea la navegación.

## Límites

- imagen: 10 MiB;
- video: 200 MiB;
- subtítulos: 2 MiB;
- máximo de borradores y documentos permanece bajo el contrato de Fase 6.

No hay nube, streaming, transcodificación, editor de imagen ni copia de assets en JSON. El paquete portable pertenece a Fase 8.
