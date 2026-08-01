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

## Fase 7 — Motor y multimedia real

Implementada en el programa RC: auditoría del motor, store de assets, repositorio, imágenes, video, poster, WebVTT, URLs temporales y movimiento cancelable. Player Core no se reescribió.

La siguiente fase genera e importa un paquete ZIP portable, incluye solo assets usados y contiene un runtime estático verificable. Publicación, Pages, PWA, backend y nube permanecen fuera.

## Fase 8 — Paquete portable

Implementada en el programa RC: contrato ZIP 1.0.0, manifiesto SHA-256, límites anti-bomba, exportación desde Studio, importación como copia desde Biblioteca y Player estático reutilizable. La única dependencia añadida es `fflate` 0.8.3, fijada y auditada.

La Fase 9 centraliza `1.0.0-rc.1`, ejecuta auditorías integrales y prepara artefactos y planes de lanzamiento sin desplegar ni modificar `main`.

## Fase 9 — NEXUS 1.0 RC

Preparada para cierre técnico: versión central, build estático, ZIP RC, seguridad, rendimiento, compatibilidad, legal, despliegue propuesto y rollback. El gate final exige revisión humana y pruebas físicas; `main`, Pages, Release y `v1.0.0` no cambian.

## NEXUS 1.0 — Lanzamiento

Unifica Biblioteca, Studio y Player mediante una carcasa compartida, separa tema de aplicación y tema de presentación, convierte la raíz en entrada útil y publica el build estático. Después de `v1.0.0`, el proyecto entra en mantenimiento; no se añaden subsistemas en este lanzamiento.
