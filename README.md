# NEXUS Present

NEXUS Present es un motor local y modular para crear y reproducir presentaciones web narrativas. El Player consume documentos públicos; Studio conserva el borrador fuente y 5C incorpora validación y previsualización segura mediante el Player real.

## Estado

Fase 5C en rama de revisión visual: PreviewBridge, panel de validación y Player embebido. No incluye exportación, almacenamiento, publicación, PWA, Service Worker, cuentas ni Fase 5D.

## Uso de demostración

Abrir `index.html` desde un servidor estático local. El Player carga el documento sintético de `demo/public-demo.js`; este contenido no contiene notas privadas ni datos personales.

Abrir `studio.html` para editar el borrador, revisar diagnósticos y generar una vista previa explícita. Los cambios posteriores marcan el preview como desactualizado hasta que el usuario solicita actualizarlo.

## Arquitectura y contratos

- [Arquitectura](docs/ARCHITECTURE.md), [PreviewBridge](docs/PREVIEW_BRIDGE.md), [contrato del Player](docs/PLAYER_CONTRACT.md), [temas](docs/THEME_CONTRACT.md) y [layouts](docs/LAYOUT_CONTRACT.md).
- [Contrato de presentación](docs/PRESENTATION_CONTRACT.md), [contrato de escenas](docs/SCENE_CONTRACT.md) y [catálogo de estados](docs/STATE_CATALOG.md).
- [Revisión responsive](docs/RESPONSIVE_REVIEW.md), [accesibilidad](docs/ACCESSIBILITY.md) y [seguridad](docs/SECURITY.md).
- [Estándar de desarrollo](docs/DEVELOPMENT_STANDARD.md), [ficha técnica](FICHA_TECNICA.md), [continuidad](AI_HANDOFF.md), [decisiones](docs/DECISIONS.md), [cambios](CHANGELOG.md) y [licencia](LICENSE).

## Límites vigentes

El contenido se valida antes de cargarlo. El DOM Adapter solo representa contenido público. Los tipos no registrados y los fallos recuperables de renderer muestran un estado seguro. El teclado y los gestos táctiles son adaptadores externos, siempre con controles visibles como alternativa.

La demo incluye un SVG sintético local y fallback de imagen; vídeo permanece como placeholder, sin reproducción automática, audio ni streaming.
