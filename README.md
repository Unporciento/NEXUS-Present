# NEXUS Present

NEXUS Present es un motor local y modular para crear y reproducir presentaciones web narrativas. La candidata incorpora Biblioteca y Studio para importar, guardar, editar, validar, previsualizar y descargar presentaciones estructuradas con recursos locales.

## Estado

Fase 8 implementada en el programa NEXUS 1.0 RC: además de recursos locales, Studio exporta un ZIP portable verificable y Biblioteca lo importa como copia segura. No incluye publicación, PWA, Service Worker ni cuentas.

La especificación exacta está en [EXPORT_SERVICE.md](docs/EXPORT_SERVICE.md).

El cierre de experiencia está descrito en [ONBOARDING.md](docs/ONBOARDING.md) y [HELP_SYSTEM.md](docs/HELP_SYSTEM.md).

## Uso de demostración

Abrir `index.html` desde un servidor estático local. El Player carga el documento sintético de `demo/public-demo.js`; este contenido no contiene notas privadas ni datos personales.

Abrir `studio.html` para editar el borrador, revisar diagnósticos y generar una vista previa explícita. Los cambios posteriores marcan el preview como desactualizado hasta que el usuario solicita actualizarlo.

Abrir `library.html` para crear, importar y administrar borradores guardados en este navegador. Guardado local no equivale a respaldo: la Biblioteca permite descargar una copia completa.

## Arquitectura y contratos

- [Arquitectura](docs/ARCHITECTURE.md), [PreviewBridge](docs/PREVIEW_BRIDGE.md), [contrato del Player](docs/PLAYER_CONTRACT.md), [temas](docs/THEME_CONTRACT.md) y [layouts](docs/LAYOUT_CONTRACT.md).
- [Recursos](docs/ASSET_ARCHITECTURE.md), [multimedia](docs/MEDIA_CONTRACT.md), [movimiento](docs/MOTION_SYSTEM.md) y [auditoría del motor](docs/ENGINE_AUDIT_PHASE_7.md).
- [Paquete portable](docs/PACKAGE_CONTRACT.md), [runtime portable](docs/PORTABLE_RUNTIME.md) y [avisos de terceros](THIRD_PARTY_NOTICES.md).
- [Contrato de presentación](docs/PRESENTATION_CONTRACT.md), [contrato de escenas](docs/SCENE_CONTRACT.md) y [catálogo de estados](docs/STATE_CATALOG.md).
- [Revisión responsive](docs/RESPONSIVE_REVIEW.md), [accesibilidad](docs/ACCESSIBILITY.md) y [seguridad](docs/SECURITY.md).
- [Estándar de desarrollo](docs/DEVELOPMENT_STANDARD.md), [ficha técnica](FICHA_TECNICA.md), [continuidad](AI_HANDOFF.md), [decisiones](docs/DECISIONS.md), [cambios](CHANGELOG.md) y [licencia](LICENSE).

## Límites vigentes

El contenido se valida antes de cargarlo. El DOM Adapter solo representa contenido público. Los tipos no registrados y los fallos recuperables de renderer muestran un estado seguro. El teclado y los gestos táctiles son adaptadores externos, siempre con controles visibles como alternativa.

Studio admite PNG, JPEG, WebP, SVG seguro, MP4, WebM y WebVTT. El navegador decide codecs de video; NEXUS no transcodifica, no reproduce con sonido automáticamente y libera cada recurso al cambiar de escena.

`Descargar presentación` genera JSON público. `Descargar paquete portable` añade los assets usados y un Player estático. El ZIP debe extraerse y abrirse mediante un servidor HTTP; NEXUS no promete funcionamiento con `file://`.
