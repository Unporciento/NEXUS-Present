# Repositorio local de borradores

## Responsabilidad

`DraftRepository` ofrece una API asíncrona sobre un adaptador de almacenamiento. Su implementación principal será IndexedDB, pero controladores y UI solo conocen el contrato.

API propuesta:

```text
open()
list({ order, direction })
get(draftKey)
create(source, metadata)
save(draftKey, source, expectedRevision)
rename(draftKey, title, expectedRevision)
duplicate(draftKey)
delete(draftKey, expectedRevision)
getRecoveryPoints(draftKey)
restoreRecoveryPoint(draftKey, revision)
subscribe(listener)
close()
destroy()
```

Todas las respuestas son estructuradas. Los métodos de lectura y escritura devuelven clones defensivos. Después de `destroy`, ninguna operación ni suscripción continúa.

## Registro de borrador

```text
DraftRecord
  draftKey           UUID local, clave primaria
  recordSchema       entero
  revision           entero monotónico
  source             SourcePresentationDocument validado
  titleSort          cadena normalizada para índice
  theme              id derivado
  status             editable | incompatible | recovery-needed
  createdAt          ISO UTC local del registro
  updatedAt          ISO UTC de última escritura
  lastOpenedAt       ISO UTC opcional
  savedFingerprint   huella determinista del Source guardado
```

`draftKey` nunca se exporta como parte de `PublicPresentationDocument`. `titleSort`, `theme`, estado y fingerprint son derivados y se recalculan en cada escritura.

## Consistencia y atomicidad

- Crear, guardar, renombrar, duplicar y eliminar usan una única transacción `readwrite`.
- Guardar compara `expectedRevision` con la revisión almacenada dentro de la misma transacción.
- Si coinciden, conserva la revisión anterior como punto de recuperación, escribe el nuevo registro e incrementa `revision`.
- Si no coinciden, aborta con `revision-conflict`; no aplica last-write-wins.
- Si la transacción se interrumpe, IndexedDB revierte todos sus cambios.
- El servicio anuncia `saving` solo mientras la transacción está activa y `saved` después de `complete`, nunca después de `request.success` aislado.

Eliminar requiere confirmación en la UI, revisión esperada y una decisión explícita sobre puntos de recuperación. En 6C la eliminación será lógica durante la operación y física al confirmar la transacción; no existe papelera permanente salvo decisión posterior.

## Guardado y dirty state

`StudioController` mantiene el borrador en memoria. Un coordinador de sesión compara su fingerprint con `savedFingerprint`:

- `clean`: coincide con la última revisión guardada;
- `dirty`: difiere;
- `saving`: transacción en curso;
- `saved`: escritura confirmada;
- `save-error`: la revisión anterior sigue disponible;
- `conflict`: otra pestaña avanzó la revisión.

Fase 6 implementará guardado manual. El autosave continuo queda fuera. Puede evaluarse después un guardado controlado con pausa, visibilidad y límites, pero nunca se activa por defecto durante 6.

Al cerrar o navegar con cambios pendientes se solicita confirmación mediante mecanismos estándar del navegador cuando estén disponibles. En móvil no se confía en `beforeunload`; la interfaz mantiene estado visible y un botón Guardar.

## Conflictos entre pestañas

La corrección depende de revisiones optimistas, no de `BroadcastChannel`. El canal solo mejora la experiencia:

1. cada sesión abre con `draftKey` y `revision`;
2. una escritura exitosa anuncia `{ draftKey, revision, updatedAt }`;
3. otra pestaña marca su sesión como potencialmente desactualizada;
4. al guardar, IndexedDB vuelve a comparar la revisión;
5. ante conflicto ofrece recargar, duplicar como nuevo borrador o cancelar;
6. sobrescribir requiere una acción separada y explícita, si llega a autorizarse.

Si `BroadcastChannel` no existe, la seguridad se conserva por `expectedRevision`.

## Errores y recuperación

| Error | Respuesta |
|---|---|
| `QuotaExceededError` | conservar dirty state, explicar y ofrecer respaldo/eliminación |
| base no disponible o modo privado | continuar en memoria y advertir que no está guardado |
| versión bloqueada por otra pestaña | pedir cerrar/recargar otras pestañas, sin bucle |
| transacción abortada | conservar revisión anterior y permitir reintento |
| registro inválido | aislarlo como `recovery-needed`, no abrirlo directamente |
| borrador inexistente | volver a biblioteca con mensaje recuperable |

Los errores no incluyen el documento completo. `close()` cierra la conexión; `versionchange` también la cierra para permitir upgrades seguros.

## Exclusiones

El repositorio no almacena Blobs, imágenes, videos, ZIP, tokens, credenciales, historial completo de edición, preview, selección, undo/redo ni estado DOM. Tampoco sincroniza ni publica.
