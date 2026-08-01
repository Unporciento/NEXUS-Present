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
| D-036 | Assets usan un store IndexedDB separado y referencias `assetId`; nunca rutas privadas | implementada |
| D-037 | Hash SHA-256 y scope del borrador evitan duplicar el mismo Blob local | implementada |
| D-038 | SVG se acepta solo bajo sanitización conservadora sin referencias externas | implementada |
| D-039 | Video conserva controles nativos, precarga de metadata y no se transcodifica | implementada |
| D-040 | Object URLs tienen referencias y se revocan en navegación o destroy | implementada |
| D-041 | Movimiento usa un registro limitado, cancelable y reducido a cut cuando corresponde | implementada |
| D-042 | Player Core permanece ajeno a IndexedDB, Blob, codecs y animación | implementada |
| D-043 | El paquete portable usa ZIP determinista, manifiesto versionado y hashes SHA-256 | implementada |
| D-044 | `fflate` 0.8.3 es la única dependencia ZIP, fijada, sin CDN y documentada | implementada |
| D-045 | Importar paquetes crea copias con IDs locales nuevos y rollback compensatorio | implementada |
| D-046 | El runtime portable reutiliza Player y requiere HTTP estático; `file://` no se garantiza | implementada |
| D-047 | La candidata usa una única fuente `src/version.js` con `1.0.0-rc.1` | implementada |
| D-048 | El build estático es un artefacto reproducible, no un despliegue | implementada |
| D-049 | Pages y `v1.0.0` requieren gate humano, pruebas físicas y autorización separada | aprobada |
