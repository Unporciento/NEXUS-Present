# NEXUS Present

NEXUS Present es un motor local y modular para reproducir presentaciones web narrativas. La demostración incluida verifica el Player con cuatro escenas públicas: `cover`, `statement`, `content` y `closing`.

## Estado

Fase 4 — temas, escenas y demostración narrativa, pendiente de revisión de rama. No incluye Studio, Presenter completo, publicación, PWA, Service Worker, almacenamiento ni cuentas.

## Uso de demostración

Abrir `index.html` desde un servidor estático local. El Player carga el documento sintético de `demo/public-demo.js`; este contenido no contiene notas privadas ni datos personales.

## Arquitectura y contratos

- [Arquitectura](docs/ARCHITECTURE.md), [contrato del Player](docs/PLAYER_CONTRACT.md), [temas](docs/THEME_CONTRACT.md) y [layouts](docs/LAYOUT_CONTRACT.md).
- [Contrato de presentación](docs/PRESENTATION_CONTRACT.md), [contrato de escenas](docs/SCENE_CONTRACT.md) y [catálogo de estados](docs/STATE_CATALOG.md).
- [Revisión responsive](docs/RESPONSIVE_REVIEW.md), [accesibilidad](docs/ACCESSIBILITY.md) y [seguridad](docs/SECURITY.md).
- [Estándar de desarrollo](docs/DEVELOPMENT_STANDARD.md), [ficha técnica](FICHA_TECNICA.md), [continuidad](AI_HANDOFF.md), [decisiones](docs/DECISIONS.md), [cambios](CHANGELOG.md) y [licencia](LICENSE).

## Límites vigentes

El contenido se valida antes de cargarlo. El DOM Adapter solo representa contenido público. Los tipos no registrados y los fallos recuperables de renderer muestran un estado seguro. El teclado y los gestos táctiles son adaptadores externos, siempre con controles visibles como alternativa.
