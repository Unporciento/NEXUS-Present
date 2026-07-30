# Plan de migraciones, respaldo y restauración

## Versiones separadas

NEXUS distingue:

1. `contractVersion`: forma de Public/SourcePresentationDocument;
2. `recordSchema`: envoltorio local de cada borrador;
3. versión física de IndexedDB: stores e índices;
4. `backupVersion`: formato del respaldo completo.

Nunca se infiere una versión desde otra. Cada migrador declara `from`, `to`, precondiciones, transformación y validación posterior.

## Propiedades de un migrador

- función pura sobre un clon;
- sin DOM, IndexedDB, red, reloj ni IDs implícitos;
- no muta la entrada;
- determinista e idempotente para su versión destino;
- conserva datos reconocidos o genera un diagnóstico explícito;
- rechaza saltos no soportados;
- valida el resultado con el contrato destino;
- tiene prueba de ejemplo real y regresión.

La cadena se planifica antes de escribir: `v1 → v2 → v3`. Si falta un paso, no comienza.

## Migración física de IndexedDB

Los cambios de stores o índices ocurren en `onupgradeneeded` y dentro de la transacción `versionchange`. Antes:

- se comprueba que no haya otra conexión activa;
- las conexiones reciben `versionchange` y se cierran;
- se muestra estado bloqueado si otra pestaña impide el upgrade;
- no se elimina un store hasta que exista una ruta probada de conservación.

Si la transacción aborta, el navegador conserva la versión física anterior. Como IndexedDB no permite disminuir la versión, “rollback” significa abortar antes de confirmar o restaurar lógicamente desde un backup compatible; nunca intentar decrementar.

## Respaldo individual

Un borrador puede descargarse como `SourcePresentationDocument` mediante un servicio separado de la exportación pública. Debe advertir que puede incluir notas y datos editoriales privados.

Formato: UTF-8, JSON, dos espacios, LF, sin BOM. Antes de descargar se valida Source y se excluyen selección, historial temporal, dirty state y estados UI.

## Respaldo completo

El backup completo usa un sobre:

```text
NexusLocalBackup
  backupVersion
  product
  createdAt
  engineVersion
  records[]
    draftKey
    recordSchema
    revision
    source
    createdAt
    updatedAt
```

No incluye assets, blobs, onboarding, cachés, preview, undo/redo ni credenciales. Límite: 50 MiB y 100 registros. El usuario debe tratarlo como archivo privado sin cifrar.

## Restauración

La restauración se divide en dos pasos:

### Preflight sin escritura

1. limitar y decodificar el archivo;
2. validar sobre, versión y cantidad;
3. inspeccionar claves peligrosas;
4. migrar copias en memoria si existe ruta;
5. validar cada Source;
6. calcular espacio aproximado;
7. presentar resumen: válidos, incompatibles, colisiones y acciones.

### Aplicación atómica

Por defecto, cada registro se restaura como copia con nueva `draftKey`; conserva su `id` contractual. Reemplazar exige selección explícita por registro y revisión esperada.

El modo predeterminado es todo-o-nada. Si una transacción falla, no se considera restaurado ningún registro. Una futura restauración parcial requerirá decisión separada y reporte exacto.

## Rollback

- Importación: no escribe hasta concluir validación y conversión.
- Guardado: la transacción conserva la revisión anterior si aborta.
- Migración lógica: el registro original permanece hasta que el nuevo sea validado.
- Migración física: abortar `versionchange` conserva la base anterior.
- Restauración: una sola transacción evita estados parciales dentro de los límites.

Antes de una migración irreversible se exige backup descargable recomendado y espacio para copia local de recuperación. NEXUS nunca elimina automáticamente el único registro válido.

## Registro y diagnóstico

`meta` puede conservar únicamente:

- migración aplicada;
- fecha;
- versiones origen/destino;
- cantidad procesada;
- resultado;
- código de error seguro.

No guarda contenido del borrador. Laboratory podrá leer este registro en una fase futura, pero no ejecutará reparaciones ni migraciones sin autorización.

## Pruebas obligatorias

- cada migrador con entrada anterior, salida esperada y no mutación;
- cadena completa y salto ausente;
- repetición idempotente;
- documento incompatible;
- upgrade bloqueado por otra conexión;
- aborto a mitad de transacción;
- backup determinista;
- restauración válida, colisión y falta de cuota;
- ningún rollback elimina la última copia válida.

## Base IndexedDB v1 → v2

La migración añade únicamente el store `assets` y sus índices. No recorre ni reescribe borradores existentes. `onversionchange` cierra conexiones anteriores para evitar escritura con un esquema obsoleto; un upgrade bloqueado se comunica sin borrar datos.
