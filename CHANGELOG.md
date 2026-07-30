# Registro de cambios

## [0.7.0-rc] — 2026-07-29

- AssetRepository e IndexedDB v2 con Blob, SHA-256, deduplicación y limpieza explícita.
- PNG, JPEG, WebP, SVG seguro, MP4, WebM, poster y WebVTT.
- ResourceManager, ObjectUrlPool y detección de capacidades con fallbacks recuperables.
- Transiciones `cut`, `fade`, `slide` y `focus`, cancelables y compatibles con movimiento reducido.
- Correcciones reproducidas para layout `stack`, error visual obsoleto y mensaje de archivo ausente.
- Sin ZIP, publicación, PWA, Service Worker ni backend.

## [0.6.0-rc] — 2026-07-29

- Importación estricta de PublicPresentationDocument JSON y conversión aislada a Source.
- Persistencia IndexedDB mediante DraftRepository con revisiones, recovery y conflictos.
- Biblioteca local con crear, abrir, renombrar, duplicar, eliminar, backup y restauración.
- Guardado manual, advertencia de cambios pendientes y BroadcastChannel informativo.
- Sin assets reales, ZIP, nube, publicación, PWA ni backend.

## [1.0.0-rc] — 2026-07-29

- Onboarding 1.0 omitible, repetible y con preferencia local limitada.
- Ayuda integrada, nombres amigables y terminología unificada.
- Estados vacíos, identidad Studio 1.0 y refinamiento responsive.
- Opción explícita de copyright para Player independiente o embebido.
- Sin guardado de presentaciones, importación, empaquetado ni publicación.
- Auditoría final: diseños traducidos, columna de preview condicionada y foco restaurado al cerrar Ayuda con Escape.
- La validación de título vacío se reprodujo correctamente después de confirmar el cambio; el validador no requirió modificación.

## [0.5.5] — 2026-07-29

- ExportService determinista e independiente del DOM.
- Descarga local con Blob y URL temporal revocada.
- Botón `Exportar JSON`, estados accesibles y rechazo de rutas privadas absolutas.
- Sin importación, almacenamiento, empaquetado ni publicación.

## [0.5.4] — 2026-07-29

- PreviewBridge desacoplado con validación fuente/pública y exclusión de datos privados.
- Studio con panel de validación, preview explícito, estado stale y Player real embebido.
- Ciclo de vida de cierre/reapertura, teclado aislado, responsive y pruebas de destroy.
- Corrección reproducible del color de profundidad para los temas `neutral` y `nexus`.

## [0.5.3] — 2026-07-29

- Hotfix visual: tokens completos, contraste AA orientativo, controles legibles y navegación del Player separada del progreso.

## [0.5.2] — 2026-07-29

- Cierre de Studio 5B con diálogo accesible, limpieza de listeners, pruebas DOM mínimas y revisión responsive emulada.

## [0.4.0] — 2026-07-29

- Temas `neutral` y `nexus`, layouts y renderers visuales desacoplados.
- Demo pública sintética de siete escenas y movimiento reducido.
- Identidad inicial, footer con año automático y contrato de temas/layouts.

## [0.3.0] — 2026-07-29

### Añadido

- Player mínimo con estados, navegación, eventos y destrucción explícita.
- Renderers de texto `cover`, `statement`, `content` y `closing`.
- DOM Adapter, controles, progreso, teclado y swipe táctil opcional.
- Demostración pública sintética, pruebas de contratos, Player, entradas y DOM simulado.

### Límites

- Sin Studio, Presenter completo, temas, multimedia avanzada, publicación, PWA, Service Worker o persistencia.

## [0.2.0] — 2026-07-28

- Núcleo contractual y validación de documentos públicos.

## [0.1.0] — 2026-07-26

- Arranque documental del proyecto.
