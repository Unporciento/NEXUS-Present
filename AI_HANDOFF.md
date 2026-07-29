# AI HANDOFF — NEXUS Present

## Estado actual

Fase 5D está implementándose en `phase-5d/studio-local-export` y debe detenerse para revisión visual. Leer [EXPORT_SERVICE.md](docs/EXPORT_SERVICE.md), [STUDIO_UI.md](docs/STUDIO_UI.md), [PREVIEW_BRIDGE.md](docs/PREVIEW_BRIDGE.md) y [PLAYER_CONTRACT.md](docs/PLAYER_CONTRACT.md). Onboarding completo es 5E.

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No iniciar Fase 5E sin autorización explícita. No hay importación, almacenamiento, empaquetado, Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.

## Próximo paso sugerido

Esperar aprobación visual explícita de 5D. No fusionar ni comenzar Fase 5E antes de esa decisión.
