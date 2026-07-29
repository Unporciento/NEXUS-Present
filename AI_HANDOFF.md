# AI HANDOFF — NEXUS Present

## Estado actual

Fase 5E está implementándose en `phase-5e/studio-professional-closure` y debe detenerse para revisión visual. Leer [ONBOARDING.md](docs/ONBOARDING.md), [HELP_SYSTEM.md](docs/HELP_SYSTEM.md), [STUDIO_UI.md](docs/STUDIO_UI.md) y [PLAYER_CONTRACT.md](docs/PLAYER_CONTRACT.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No iniciar una fase posterior ni fusionar 5E sin aprobación visual explícita. No hay importación, guardado de presentaciones, empaquetado, Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.

## Próximo paso sugerido

Esperar aprobación visual explícita de 5E. No fusionar, etiquetar ni comenzar una fase posterior.
