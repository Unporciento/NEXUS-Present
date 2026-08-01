# Arquitectura

## Implementado en Fase 3

`src/contracts/` valida documentos públicos y compatibilidad. `src/player/` reúne la máquina de estados, navegación, eventos y ciclo de vida. `src/ui/player-view.js` es el DOM Adapter mínimo: pinta texto público, progreso y controles. `src/input/` adapta teclado y tacto sin tomar control de elementos interactivos. `demo/` solo contiene datos sintéticos; no es una dependencia del motor.

```text
src/
  contracts/   validación, versión y datos públicos
  player/      Player Core, estados, navegación y eventos
  ui/          DOM Adapter
  input/       adaptadores de teclado y tacto
demo/          documento demostrativo
tests/         contratos, Player, entradas, DOM simulado y documentos
```

El Player recibe un `PublicPresentationDocument`, lo clona y no lo muta. El Renderer Registry resuelve el tipo de escena. El DOM Adapter no valida, no navega globalmente por sí mismo y nunca recibe notas privadas. Los Input Adapters devuelven una función de limpieza que el Player ejecuta mediante `destroy`.

## Reglas mantenidas

- HTML mínimo y semántico; CSS y JavaScript fuera de HTML.
- Un archivo, una responsabilidad y menos de 400 líneas.
- Sin dependencias circulares, almacenamiento directo desde la UI ni dependencias de producción.
- Eventos públicos pequeños; no incluyen documento completo ni notas privadas.
- `destroy` elimina suscripciones, listeners registrados, referencias al documento y navegación; no se programan temporizadores.

## Futuro reservado

Studio, Presenter, multimedia, temas, almacenamiento, PWA, publicación y Laboratory conservan su separación documental, pero no tienen implementación en esta fase.

## Extensión visual de Fase 4

`src/themes/` aplica tokens al contenedor de interfaz; `src/layouts/` valida composición; renderers transforman bloques públicos en HTML semántico. Esta capa no modifica el estado del Player ni accede a notas. La demostración queda en `demo/` y el estilo global en `styles.css`.

## Studio y preview — Fases 5A–5C

`src/studio/controller.js` es la autoridad del borrador y del historial privado. `src/studio/ui.js` representa edición, validación y modo responsive. `src/studio/preview-bridge.js` es el único puente hacia la conversión pública y el Player.

```text
StudioController → StudioApp → PreviewBridge → PublicPresentationDocument
                                           → Player existente
```

StudioApp mantiene una suscripción al Controller y otra al PreviewBridge. La UI no crea documentos públicos ni controla internamente el Player. El bridge no conoce selección, historial, dirty state ni formularios. La referencia contractual completa está en [PREVIEW_BRIDGE.md](PREVIEW_BRIDGE.md).

## Exportación local — Fase 5D

`StudioApp → bindStudioExport → ExportService → BrowserDownloadAdapter`

El servicio contractual es independiente del DOM y reutiliza `createPublicPresentation`. El adaptador no valida ni transforma datos; limita su responsabilidad a Blob, URL temporal, descarga y limpieza. No hay acceso a almacenamiento ni publicación. Consulta [EXPORT_SERVICE.md](EXPORT_SERVICE.md).

## Cierre profesional — Fase 5E

`StudioApp → bindStudioGuidance → OnboardingPreference`

La guía no accede al Controller. Solo la preferencia versionada del tutorial usa almacenamiento local; los borradores continúan exclusivamente en memoria. `sceneLabels` mantiene separada la terminología visible de los contratos. `createPlayerView({ showCopyright })` conserva derechos por defecto y permite ocultarlos explícitamente al embeber el Player en Studio.

## Importación y almacenamiento — Fase 6

```text
library.html → LibraryApp → ImportService → PublicToSourceConverter
                          → DraftRepository → IndexedDbAdapter
studio.html  → StudioApp + PersistenceSession → DraftRepository
```

`ImportService` limita y valida archivos públicos antes de convertirlos. `draftKey` identifica el registro local y permanece separado del `id` contractual. `DraftRepository` valida SourcePresentationDocument y es la única capa que conoce el adaptador IndexedDB. La UI usa resultados estructurados; no accede a `indexedDB`.

La base `nexus-present` contiene `drafts`, `recovery` y `meta`. Guardar compara `expectedRevision`, escribe la nueva revisión y su punto de recuperación en una transacción. `BroadcastChannel` solo avisa entre pestañas; la revisión almacenada es la autoridad.

## Motor y multimedia — Fase 7

```text
Studio Assets UI → AssetRepository → AssetIndexedDbAdapter → assets
PlayerView → ResourceManager → AssetRepository + ObjectUrlPool
PlayerView → TransitionController → TransitionRegistry
```

El store `assets` se añadió mediante la versión 2 de la base. Documento y Blob permanecen separados: `assetId` es estable; `nexus-asset:` es una referencia lógica, no una ruta. El ResourceManager resuelve solo dentro del `draftKey`, comprueba capacidades, monta recursos y libera elementos, decoders y Object URLs en navegación o `destroy`.

Renderer Registry continúa produciendo HTML semántico inerte. Los hooks `data-nexus-asset` no contienen código ni datos privados. El DOM Adapter coordina ResourceManager y transiciones, pero Player Core no conoce IndexedDB, Blob, video ni animaciones.

Contratos detallados: [ASSET_ARCHITECTURE.md](ASSET_ARCHITECTURE.md), [MEDIA_CONTRACT.md](MEDIA_CONTRACT.md), [MOTION_SYSTEM.md](MOTION_SYSTEM.md) y [ENGINE_AUDIT_PHASE_7.md](ENGINE_AUDIT_PHASE_7.md).

## Paquete portable — Fase 8

```text
Studio → PackageExportService → RuntimeProvider + AssetRepository → ArchiveAdapter
ZIP → ArchiveAdapter → ManifestValidator → IntegrityVerifier
    → PackageImportService → AssetRepository + DraftRepository
```

`src/package/` no conoce el DOM. Los bindings de Studio y Biblioteca solo coordinan archivos, estados y descarga. La importación valida antes de escribir y ejecuta rollback compensatorio. El runtime portable reutiliza el Player existente y reemplaza IndexedDB por rutas estáticas verificadas. Consulta [PACKAGE_CONTRACT.md](PACKAGE_CONTRACT.md) y [PORTABLE_RUNTIME.md](PORTABLE_RUNTIME.md).
