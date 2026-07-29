# AI HANDOFF — NEXUS Present

## Estado actual

Fase 4 trabaja en `phase-4/scenes-themes-demo`. Leer [THEME_CONTRACT.md](docs/THEME_CONTRACT.md), [LAYOUT_CONTRACT.md](docs/LAYOUT_CONTRACT.md), [PLAYER_CONTRACT.md](docs/PLAYER_CONTRACT.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md) y `CHANGELOG.md` antes de actuar.

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No iniciar Fase 4 sin autorización explícita. No hay Studio, Presenter, PWA, Service Worker, Pages, publicación, almacenamiento, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).

## Próximo paso sugerido

Tras el cierre e integración aprobados de Fase 3, preparar únicamente el plan de Fase 4; no implementar módulos nuevos sin aprobación.
