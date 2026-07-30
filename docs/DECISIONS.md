# Decisiones arquitectónicas

| Id | Decisión | Estado |
|---|---|---|
| D-001 | V1 comienza por motor y reproductor; el editor es posterior | aprobada |
| D-002 | Repositorio público `Unporciento/NEXUS-Present`, rama `main` | aprobada |
| D-003 | Publicación futura estática mediante GitHub Pages, sin acoplamiento actual | aprobada |
| D-004 | Presentaciones como datos JSON validados e independientes del motor | aprobada |
| D-005 | Licencia propietaria y derechos reservados | aprobada |
| D-006 | Identidad técnica, editorial y cinematográfica moderada | aprobada |
| D-007 | Laboratory es futuro y no altera datos sin autorización | aprobada |
| D-012 | Studio usa Source y Player usa `PublicPresentationDocument` | aprobada |
| D-013 | Player Core, Renderer Registry, DOM Adapter e Input Adapters permanecen separados | aprobada |
| D-014 | `destroy` concentra liberación explícita de suscripciones y entradas | aprobada |
| D-015 | La demo usa datos sintéticos públicos y no expone notas privadas | aprobada |
| D-016 | Temas y layouts se desacoplan del Player Core mediante tokens y validación | aprobada |
| D-017 | La identidad inicial usa azul profundo y acento funcional, sin fuentes externas | aprobada |
| D-018 | Fase 5 será Studio guiado por contratos, no editor visual libre | aprobada |
| D-019 | 5D exporta únicamente PublicPresentationDocument JSON determinista mediante servicio sin DOM y adaptador aislado | aprobada |
| D-020 | Recursos relativos se conservan; rutas locales absolutas se rechazan; empaquetado queda fuera de 5D | aprobada |
| D-021 | La única persistencia 5E es `nexus:onboarding-version`; nunca guarda presentaciones | aprobada |
| D-022 | Los nombres amigables son una capa visual y no cambian identificadores contractuales | aprobada |
| D-023 | El Player muestra copyright por defecto y solo Studio lo oculta mediante opción explícita | aprobada |
| D-024 | Etiquetas de diseños centralizadas traducen la UI sin modificar IDs ni exportación | aprobada |
| D-025 | La distribución amplia requiere preview explícitamente abierto; cerrar libera la columna | aprobada |
| D-026 | Preview usa conversión pública y Player aislado; exportación es local | aprobada |
| D-027 | Toda fase que modifica interfaz requiere revisión visual y aprobación antes del merge | aprobada |
| D-028 | PreviewBridge es el único puente entre el borrador privado y el Player público; preview se actualiza de forma explícita | aprobada |
| D-029 | Fase 6 se divide en importación, repositorio, biblioteca, recuperación y cierre | implementada |
| D-030 | IndexedDB será la persistencia de presentaciones; `localStorage` seguirá limitado al onboarding | implementada |
| D-031 | `draftKey` local y `id` contractual son identidades distintas | implementada |
| D-032 | Guardar usa revisión optimista y transacción atómica; no existe sobrescritura silenciosa | implementada |
| D-033 | Importación acepta solo PublicPresentationDocument estricto y crea un Source aislado | implementada |
| D-034 | Fase 6 usa guardado manual; autosave continuo y sincronización quedan fuera | implementada |
| D-035 | Backups y restauraciones son locales, versionados, validados y sin assets | implementada |
