# AI HANDOFF — NEXUS Present

## Estado actual

NEXUS `1.0.0` está publicado y estable. El tag `v1.0.0` apunta al commit certificado `ae08c592dbdb5ecd455ec9c3cf563c3a818446eb`; Pages se sirve desde `gh-pages` en [producción](https://unporciento.github.io/NEXUS-Present/). Leer [RELEASE_REPORT_1.0.md](docs/RELEASE_REPORT_1.0.md), [APP_SHELL.md](docs/APP_SHELL.md), [SECURITY_REVIEW_1.0.md](docs/SECURITY_REVIEW_1.0.md) y [ROLLBACK_PLAN.md](docs/ROLLBACK_PLAN.md).

## Límites firmes

- El Player acepta solo documentos públicos validados y no debe mutarlos.
- Su API y ciclo de vida se definen en `docs/PLAYER_CONTRACT.md`.
- Notas privadas no llegan al DOM Adapter ni a eventos públicos.
- Los adaptadores de teclado y tacto se registran como limpiezas del Player; `destroy` debe impedir actividad posterior.
- La publicación 1.0 se realiza solo desde la rama release validada, sin force-push y con rollback previo.
- Este proyecto adopta [DEVELOPMENT_STANDARD.md](docs/DEVELOPMENT_STANDARD.md).
- Toda modificación de interfaz requiere revisión visual y aprobación del usuario antes del merge.
- Fase 6 propone IndexedDB detrás de `DraftRepository`; la UI nunca accede directamente. `localStorage` continúa reservado para `nexus:onboarding-version`.

## Próximo paso sugerido

Después del lanzamiento, detener nuevas funciones. Solo corregir defectos reproducibles en ramas dedicadas y mantener `1.0.0` estable.
