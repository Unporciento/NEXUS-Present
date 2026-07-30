# Roadmap

Fase 5 está cerrada en `8c108df` y etiquetada como `phase-5-complete`. Studio 1.0 crea, valida, previsualiza y descarga un PublicPresentationDocument, pero aún no importa ni guarda borradores.

## Fase 6 — Importación y almacenamiento local

| Bloque | Alcance | Detención |
|---|---|---|
| 6A | Importación JSON pública, validación y conversión a Source | aprobación técnica y visual del flujo |
| 6B | `DraftRepository`, IndexedDB, guardado manual y conflictos | persistencia y recuperación aprobadas |
| 6C | Biblioteca: nueva, abrir, renombrar, duplicar y eliminar | comportamiento observable aprobado |
| 6D | Backup individual/completo, restauración y migraciones | rollback y compatibilidad aprobados |
| 6E | revisión visual, responsive, accesibilidad y cierre | aprobación antes de merge y tags |

Fase 6 está implementada y validada en su rama de programa. La siguiente fase fortalecerá el motor e incorporará assets locales mediante un store separado; no altera los stores documentales de Fase 6.

La especificación está en [PHASE_6_PLAN.md](PHASE_6_PLAN.md), [IMPORT_CONTRACT.md](IMPORT_CONTRACT.md), [DRAFT_REPOSITORY.md](DRAFT_REPOSITORY.md), [STORAGE_MODEL.md](STORAGE_MODEL.md) y [MIGRATION_PLAN.md](MIGRATION_PLAN.md).

Fuera de Fase 6 permanecen imágenes y videos reales, ZIP, copia de assets, publicación, GitHub Pages, PWA, Service Worker, Presenter completo, backend, cuentas, sincronización, colaboración e IA.
