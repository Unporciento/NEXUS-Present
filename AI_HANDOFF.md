# AI HANDOFF — NEXUS Present

## Estado actual

Fase 5 está cerrada en `main` (`8c108df`) con `phase-5-complete`. La planificación de Fase 6 vive únicamente en `planning/phase-6`; no hay implementación. Leer [PHASE_6_PLAN.md](docs/PHASE_6_PLAN.md), [IMPORT_CONTRACT.md](docs/IMPORT_CONTRACT.md), [DRAFT_REPOSITORY.md](docs/DRAFT_REPOSITORY.md), [STORAGE_MODEL.md](docs/STORAGE_MODEL.md), [MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md) y el [contrato del Player](docs/PLAYER_CONTRACT.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No iniciar 6A sin aprobación explícita. No hay importación, guardado de presentaciones, empaquetado, Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.
- Fase 6 propone IndexedDB detrás de `DraftRepository`; la UI nunca accede directamente. `localStorage` continúa reservado para `nexus:onboarding-version`.

## Próximo paso sugerido

Esperar aprobación de la planificación de Fase 6. No crear rama de implementación, no comenzar 6A y no modificar `main`.
