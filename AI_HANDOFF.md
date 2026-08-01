# AI HANDOFF — NEXUS Present

## Estado actual

Fase 8 está implementada en `phase-8/portable-package` para integrarse únicamente en `program/nexus-1.0-rc`. `main` permanece en `8c108df`. Leer [PACKAGE_CONTRACT.md](docs/PACKAGE_CONTRACT.md), [PORTABLE_RUNTIME.md](docs/PORTABLE_RUNTIME.md), [SECURITY.md](docs/SECURITY.md) y el [contrato del Player](docs/PLAYER_CONTRACT.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- No fusionar el programa en `main`. Fase 8 no incorpora Presenter completo, PWA, Service Worker, Pages, publicación, backend, salas ni IA.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.
- Fase 6 propone IndexedDB detrás de `DraftRepository`; la UI nunca accede directamente. `localStorage` continúa reservado para `nexus:onboarding-version`.

## Próximo paso sugerido

Validar e integrar Fase 8 en la rama del programa, crear `rc-phase-8-complete` y continuar con la certificación RC de Fase 9 sin modificar `main`.
