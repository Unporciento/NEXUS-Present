# Fase 6 — Importación y almacenamiento local

Estado de implementación: completa en `phase-6/import-storage-library`, pendiente de integración en la rama del programa RC.

## Objetivo y resultado esperado

Fase 6 permitirá importar una presentación pública JSON, convertirla en un borrador editable, conservarla localmente y administrarla desde una biblioteca. Todo permanece en el dispositivo. No existen nube, cuentas, sincronización remota ni publicación.

La arquitectura mantiene cuatro límites:

```text
Archivo del usuario
  → ImportService
  → PublicToSourceConverter
  → StudioController
  → DraftRepository
  → LibraryController
```

- `ImportService` lee, limita, analiza y valida datos públicos; no abre Studio ni escribe en la base.
- `PublicToSourceConverter` crea un Source válido y nuevo estado privado; no conserva objetos compartidos.
- `DraftRepository` es la única capa que conoce IndexedDB.
- `LibraryController` coordina acciones y estados visibles; la UI no accede directamente a almacenamiento.

## Decisiones transversales

- IndexedDB será el almacenamiento principal. `localStorage` continúa limitado a `nexus:onboarding-version`.
- `draftKey` identifica un registro local y no sustituye al `id` contractual de la presentación.
- Toda entrada externa se valida antes de convertirse o persistirse.
- Guardar exige `expectedRevision`; una revisión distinta produce conflicto y nunca sobrescritura silenciosa.
- Los borradores no incluyen archivos multimedia. Solo pueden conservar referencias contractuales seguras.
- Los servicios reciben adaptadores inyectados para poder probarse sin DOM ni navegador físico.
- Ningún archivo superará 400 líneas; importación, conversión, repositorio, migraciones y UI serán módulos distintos.

## Límites iniciales

| Recurso | Límite propuesto |
|---|---:|
| Archivo JSON importado | 5 MiB antes de analizar |
| Borrador normalizado | 5 MiB serializado |
| Presentaciones locales | 100 |
| Respaldo completo descargable | 50 MiB |
| Copias de recuperación por borrador | 3 |
| Título | contrato vigente, 1–120 caracteres |
| Escenas | contrato vigente, 1–200 |

El límite de aplicación es preventivo y no promete la cuota real del navegador. Antes de cada escritura se consulta `navigator.storage.estimate()` cuando esté disponible; el resultado es orientativo. `QuotaExceededError` siempre tiene estado y recuperación explícitos.

## Estados profesionales

- Importación: `idle`, `reading`, `too-large`, `parsing`, `invalid`, `incompatible`, `converting`, `ready`, `error`, `destroyed`.
- Repositorio: `opening`, `ready`, `saving`, `saved`, `conflict`, `quota-error`, `unavailable`, `recovering`, `error`, `closed`.
- Biblioteca: `loading`, `empty`, `ready`, `renaming`, `duplicating`, `deleting`, `error`.
- Migración: `not-needed`, `planning`, `migrating`, `completed`, `rolled-back`, `blocked`.

Los errores usan código estable, mensaje comprensible, ruta cuando corresponde y contexto mínimo. Nunca incorporan el documento completo.

## División definitiva

### 6A — Importación JSON

**Objetivo:** aceptar únicamente `PublicPresentationDocument` JSON compatible y producir un Source aislado.

**Entregables:** contrato de importación, lector limitado, análisis seguro, validación estricta, matriz de compatibilidad, convertidor público → fuente y flujo UI de selección/diagnóstico.

**Pruebas:** archivo válido, MIME/extensión, UTF-8, tamaño, JSON roto, campos privados, claves peligrosas, rutas absolutas, versión incompatible, duplicados, aislamiento y conversión determinista.

**Riesgos:** confiar en MIME, agotar memoria durante parseo, aceptar datos internos o alterar IDs.

**Cierre:** ningún documento inválido inicia Studio; un documento válido genera un Source nuevo sin escribir todavía en IndexedDB. Detenerse para aprobación.

### 6B — Repositorio local de borradores

**Objetivo:** persistir SourcePresentationDocument mediante una API independiente del DOM.

**Entregables:** adaptador IndexedDB, stores e índices, CRUD, revisiones optimistas, escritura atómica, guardado manual, estados de cuota y recuperación de escritura interrumpida.

**Pruebas:** apertura/upgrade, crear/leer/actualizar/eliminar, clones defensivos, rollback transaccional, conflictos, cuota, base bloqueada, cierre y reapertura.

**Riesgos:** variaciones de IndexedDB, transacciones inactivas, cuota privada y pestañas concurrentes.

**Cierre:** un borrador guardado reaparece tras recrear servicios; una escritura fallida conserva la revisión anterior. Detenerse para aprobación.

### 6C — Biblioteca de presentaciones

**Objetivo:** ofrecer una pantalla sencilla para administrar borradores locales.

**Entregables:** controlador de biblioteca, listado ordenado por modificación, nueva/abrir/renombrar/duplicar/eliminar, confirmación, estados vacío/error y enlace con dirty state.

**Pruebas:** comportamiento observable, orden, foco, nombres accesibles, duplicado con nueva clave, eliminación confirmada, cancelación, responsive y teclado.

**Riesgos:** mezclar biblioteca con Studio, pérdida de foco, borrado accidental y títulos ambiguos.

**Cierre:** todas las operaciones se realizan por `DraftRepository`; la UI nunca usa IndexedDB. Detenerse para aprobación.

### 6D — Respaldo, restauración y migraciones

**Objetivo:** proteger y evolucionar datos locales sin nube.

**Entregables:** exportación de un Source, backup completo con sobre versionado, restauración validada, catálogo de migraciones puras, preflight, rollback y recuperación.

**Pruebas:** backup determinista, restauración como copia, colisiones, backup parcial inválido, migraciones sucesivas, migración interrumpida y rollback.

**Riesgos:** backups grandes, migración irreversible, mezcla de versiones y falsas expectativas de confidencialidad.

**Cierre:** una copia validada restaura borradores sin sobrescritura silenciosa; una migración fallida deja la versión anterior utilizable. Detenerse para aprobación.

### 6E — Revisión visual, accesibilidad y cierre

**Objetivo:** certificar el recorrido importar → guardar → cerrar → reabrir → administrar → restaurar.

**Entregables:** revisión Chrome de escritorio con emulación responsive, validación móvil, teclado, lector de pantalla cuando esté disponible, estados profesionales, documentación y auditoría final.

**Pruebas:** suite completa, DOM observable, IndexedDB real en navegador, dos pestañas, cuota simulada, zoom 200 %, movimiento reducido, secretos, rutas y archivos bajo 400 líneas.

**Riesgos:** diferencias con Safari/iPhone, diálogos de cierre limitados y cuota imposible de garantizar.

**Cierre:** aprobación visual y técnica explícita antes de merge y tags. No incluye publicación.

## Matriz mínima de pruebas

| Área | Unidad | Integración | Navegador real/manual |
|---|---|---|---|
| Importación y conversión | límites, diagnósticos, clones | archivo → Source | selector, cancelación, errores |
| Repositorio | CRUD, revisión, migradores | IndexedDB real | cerrar y reabrir |
| Biblioteca | controlador y orden | UI → repositorio | teclado, responsive, foco |
| Guardado | dirty, estados, conflicto | dos controladores | dos pestañas y cierre |
| Respaldo | formato y validación | exportar/restaurar | descarga y selección |
| Accesibilidad | nombres y anuncios | estados observables | zoom, teclado, lector |
| Seguridad | claves, tamaños, URLs | entrada hostil | mensajes sin datos sensibles |

## Exclusiones

Fase 6 no incorpora imágenes o videos reales, ZIP, copia de assets, publicación, GitHub Pages, PWA, Service Worker, backend, cuentas, sincronización, colaboración ni IA. Autosave continuo queda fuera; solo podrá evaluarse después de medir el guardado manual y los conflictos.

## Evidencia de cierre

- Importación pública actual y entradas hostiles cubiertas por pruebas.
- CRUD, recovery, backup, migraciones y conflictos cubiertos mediante adaptador contractual en Node.
- IndexedDB real comprobado en Chrome mediante crear, guardar, recargar, renombrar, duplicar y eliminar.
- Dos pestañas comprobaron aviso por BroadcastChannel y rechazo por `expectedRevision`.
- La selección automatizada de archivo en Chrome quedó bloqueada por el permiso de la extensión para URLs locales; no es un fallo de NEXUS y la importación se valida con `File` real en Node.

## Riesgos pendientes

1. Safari puede cerrar o purgar almacenamiento local bajo presión; el respaldo descargable sigue siendo necesario.
2. La cuota depende del navegador, modo privado y dispositivo; no puede expresarse como capacidad garantizada.
3. El contrato actual acumula algunas advertencias: 6A necesitará un modo estricto de frontera sin cambiar Player.
4. La migración de esquema de IndexedDB no permite disminuir la versión física; el rollback debe ser transaccional o lógico.
5. `beforeunload` no está garantizado en móviles; dirty state visible y guardado manual son la defensa principal.
6. El verificador documental todavía compara `main` con el cierre de 5D; deberá corregirse en una autorización técnica futura.
