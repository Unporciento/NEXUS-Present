# AI HANDOFF — NEXUS Present

## Estado actual

Fase 6 está implementada en `phase-6/import-storage-library` para integrarse únicamente en `program/nexus-1.0-rc`. `main` permanece en `8c108df`. Leer [PHASE_6_PLAN.md](docs/PHASE_6_PLAN.md), [IMPORT_CONTRACT.md](docs/IMPORT_CONTRACT.md), [DRAFT_REPOSITORY.md](docs/DRAFT_REPOSITORY.md), [STORAGE_MODEL.md](docs/STORAGE_MODEL.md), [MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md) y el [contrato del Player](docs/PLAYER_CONTRACT.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No fusionar el programa en `main`. Fase 6 no incorpora assets, empaquetado, Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.
- Fase 6 propone IndexedDB detrás de `DraftRepository`; la UI nunca accede directamente. `localStorage` continúa reservado para `nexus:onboarding-version`.

## Próximo paso sugerido

Validar e integrar Fase 6 en la rama del programa, crear `rc-phase-6-complete` y continuar con Fase 7 sin modificar `main`.
