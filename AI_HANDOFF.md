# AI HANDOFF — NEXUS Present

## Estado actual

Fase 5C está implementada en `phase-5c/studio-preview-validation` y espera revisión visual. Leer [PREVIEW_BRIDGE.md](docs/PREVIEW_BRIDGE.md), [STUDIO_UI.md](docs/STUDIO_UI.md) y [PLAYER_CONTRACT.md](docs/PLAYER_CONTRACT.md). Exportación es 5D; onboarding completo es 5E.

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No iniciar Fase 5D sin autorización explícita. No hay exportación, almacenamiento, Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.

## Próximo paso sugerido

Esperar aprobación visual explícita de 5C. No fusionar ni comenzar Fase 5D antes de esa decisión.
