# AI HANDOFF — NEXUS Present

## Estado actual

Fase 9 prepara NEXUS `1.0.0-rc.1` en `phase-9/nexus-1.0-rc` para integrarse únicamente en `program/nexus-1.0-rc`. `main` permanece en `8c108df`. Leer [RELEASE_CANDIDATE_REPORT.md](docs/RELEASE_CANDIDATE_REPORT.md), [SECURITY_REVIEW_1.0.md](docs/SECURITY_REVIEW_1.0.md), [COMPATIBILITY_MATRIX_1.0.md](docs/COMPATIBILITY_MATRIX_1.0.md) y [LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Su API y ciclo de vida se definen en `docs/PLAYER_CONTRACT.md`.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No fusionar el programa en `main`. No activar Pages, crear Release o tag `v1.0.0`, ni desplegar desde esta rama.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.
- Fase 6 propone IndexedDB detrás de `DraftRepository`; la UI nunca accede directamente. `localStorage` continúa reservado para `nexus:onboarding-version`.

## Próximo paso sugerido

Completar certificación, integrar Fase 9 en la rama del programa y crear `rc-phase-9-complete`. La revisión humana posterior decide si se publica; no modificar `main` automáticamente.
