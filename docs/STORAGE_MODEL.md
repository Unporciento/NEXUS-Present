# Modelo de almacenamiento local

## Tecnología

IndexedDB será la persistencia principal porque admite transacciones, objetos estructurados, índices y evolución de esquema. `localStorage` no guardará presentaciones completas; conserva únicamente `nexus:onboarding-version`.

Nombre propuesto: `nexus-present`.  
Versión física inicial: `1`.  
Versión lógica de registros inicial: `1`.

Separar versión física y lógica evita subir la versión de la base por cada cambio de contenido. Una nueva versión física se reserva para stores, índices o claves; una migración lógica transforma registros mediante migradores versionados.

## Stores e índices

### `drafts`

- `keyPath`: `draftKey`.
- índices:
  - `updatedAt`;
  - `titleIndex`;
  - `theme`;
  - `status`.
- contiene `DraftRecord`, incluido el Source validado.

### `recovery`

- `keyPath`: `recoveryKey`, formado de manera estable por borrador y revisión.
- índices:
  - `draftKey`;
  - `createdAt`;
  - par único `draftKey + revision`.
- conserva como máximo tres revisiones confirmadas anteriores por borrador.

### `meta`

- `keyPath`: `key`.
- guarda versión lógica actual, migraciones completadas, estado de restauración y datos técnicos mínimos.
- nunca contiene documentos de presentación ni secretos.

No se crea store de assets en Fase 6.

## Operaciones

| Operación | Stores | Modo |
|---|---|---|
| listar biblioteca | `drafts` | readonly por `updatedAt` |
| abrir | `drafts` | readonly |
| crear | `drafts` | readwrite |
| guardar | `drafts`, `recovery` | readwrite atómico |
| renombrar | `drafts`, `recovery` | readwrite atómico |
| duplicar | `drafts` | readwrite, nueva `draftKey` |
| eliminar | `drafts`, `recovery` | readwrite atómico |
| migrar físico | stores afectados | `versionchange` |
| restaurar backup | `drafts`, `recovery`, `meta` | preflight y transacción |

No se realizan llamadas externas ni trabajo de UI dentro de una transacción. Se preparan clones y validación antes de abrirla para evitar `TransactionInactiveError`.

## Cuota y capacidad

La aplicación impone los límites de documentos definidos en PHASE_6_PLAN aunque el navegador permita más. Antes de escrituras grandes:

1. serializa y mide el borrador normalizado;
2. comprueba el límite de 5 MiB;
3. consulta `navigator.storage.estimate()` si existe;
4. muestra advertencia si el margen calculado es insuficiente;
5. intenta la transacción;
6. trata `QuotaExceededError` como autoridad final.

No se solicita persistencia del sitio automáticamente. Una futura solicitud `navigator.storage.persist()` requerirá explicación y consentimiento porque el navegador puede ignorarla.

Safari, especialmente en navegación privada o bajo presión, puede limitar o purgar almacenamiento. La biblioteca debe comunicar que “guardado local” no equivale a respaldo externo.

## Timestamps

Todos los timestamps son ISO 8601 UTC generados por un reloj inyectable:

- `createdAt` del registro no cambia;
- `updatedAt` cambia al confirmar una escritura;
- `lastOpenedAt` se actualiza por una operación separada que no modifica el Source;
- timestamps contractuales del Source siguen sus propios contratos;
- una restauración conserva timestamps originales dentro del backup y registra además `restoredAt` en metadatos locales.

No se usa el reloj para resolver conflictos; la autoridad es `revision`.

## Recuperación de escritura interrumpida

IndexedDB confirma una escritura solo en `transaction.complete`. Si el proceso termina antes, la transacción se aborta y la revisión anterior permanece. Al abrir:

- se valida el registro actual;
- se comprueba que `recordSchema` sea compatible;
- si falla, se examina el punto de recuperación más reciente válido;
- nunca se reemplaza automáticamente el registro;
- la UI ofrece abrir copia recuperada, exportar diagnóstico o cancelar.

No se mantienen banderas de “guardado correcto” fuera de la misma base, pues podrían divergir.

## Privacidad

Los datos permanecen bajo el origen del sitio. Cualquier persona con acceso al perfil del navegador o a un backup descargado puede leerlos; IndexedDB no proporciona cifrado de aplicación. Notas privadas son privadas frente a la audiencia, no confidenciales criptográficamente.

Eliminar un borrador retira su registro y puntos de recuperación en la misma transacción. El navegador puede conservar copias internas fuera del control de NEXUS; la interfaz no promete borrado forense.
