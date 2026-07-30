# AI HANDOFF — NEXUS Present

## Estado actual

Fase 7 está implementada en `phase-7/engine-assets-media` para integrarse únicamente en `program/nexus-1.0-rc`. `main` permanece en `8c108df`. Leer [ASSET_ARCHITECTURE.md](docs/ASSET_ARCHITECTURE.md), [MEDIA_CONTRACT.md](docs/MEDIA_CONTRACT.md), [MOTION_SYSTEM.md](docs/MOTION_SYSTEM.md), [ENGINE_AUDIT_PHASE_7.md](docs/ENGINE_AUDIT_PHASE_7.md) y el [contrato del Player](docs/PLAYER_CONTRACT.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No fusionar el programa en `main`. Fase 7 no incorpora ZIP, empaquetado, Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.
- Fase 6 propone IndexedDB detrás de `DraftRepository`; la UI nunca accede directamente. `localStorage` continúa reservado para `nexus:onboarding-version`.

## Próximo paso sugerido

Validar e integrar Fase 7 en la rama del programa, crear `rc-phase-7-complete` y continuar con Fase 8 sin modificar `main`.
