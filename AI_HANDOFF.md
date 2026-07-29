# AI HANDOFF — NEXUS Present

## Estado actual

Fase 5B implementa formularios guiados y diálogo local. Leer [STUDIO_UI.md](docs/STUDIO_UI.md), [STUDIO_CONTRACT.md](docs/STUDIO_CONTRACT.md), [STUDIO_STATE.md](docs/STUDIO_STATE.md) y [PLAYER_CONTRACT.md](docs/PLAYER_CONTRACT.md). Preview es 5C; exportación es 5D; onboarding completo es 5E.

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No iniciar Fase 4 sin autorización explícita. No hay Studio, Presenter, PWA, Service Worker, Pages, publicación, almacenamiento, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).

## Próximo paso sugerido

Tras el cierre e integración aprobados de Fase 3, preparar únicamente el plan de Fase 4; no implementar módulos nuevos sin aprobación.
