# PreviewBridge — Fase 5C

## Responsabilidad

`PreviewBridge` conecta un borrador fuente del Studio con el Player real sin convertir a ninguno en dependencia interna del otro. Recibe una copia del borrador y un contenedor; no consulta historial, selección, dirty state ni DOM del editor.

Flujo único:

```text
SourcePresentationDocument
→ validateSourcePresentation
→ createPublicPresentation
→ validatePublicPresentation
→ Player + Renderer Registry + DOM Adapter + Input Adapters
```

La conversión pública es determinista, clona datos y excluye `presenter`, `editorial`, `history`, campos privados y cualquier estado temporal de Studio. El Player vuelve a clonar su entrada. PreviewBridge no modifica el borrador ni devuelve referencias mutables.

## Estados

| Estado | Significado | Acción |
|---|---|---|
| `idle` | aún no existe preview | previsualizar |
| `validating` | contratos de fuente en ejecución | esperar |
| `invalid` | hay errores bloqueantes | corregir y reintentar |
| `transforming` | creando documento público | esperar |
| `rendering` | montando Player real | esperar |
| `ready` | preview vigente | navegar o cerrar |
| `stale` | el borrador cambió | actualizar manualmente |
| `recoverable-error` | montaje o liberación recuperable | reintentar o cerrar |
| `fatal-error` | no puede continuar la sesión | volver al editor |
| `destroyed` | instancia liberada | crear otro bridge |

Los diagnósticos mantienen `code`, `path`, `message`, `severity` y contexto mínimo seguro. La UI traduce los casos conocidos y nunca muestra trazas.

## API y ciclo de vida

- `preview(draft, container)`: valida, transforma, destruye la instancia anterior y monta una nueva.
- `markStale()`: conserva el Player visible, pero declara que ya no representa el borrador actual.
- `close()`: destruye Player, vista, teclado y tacto; vuelve a `idle`.
- `getState()`: snapshot defensivo del estado.
- `getPublicDocument()`: clon defensivo de la copia pública activa.
- `getPlayer()`: referencia operativa solo para integración controlada y pruebas.
- `subscribe(listener)`: suscripción cancelable.
- `destroy()`: liberación idempotente y definitiva.

Cada reconstrucción destruye primero el Player anterior. El `destroy` del Player ejecuta la limpieza del DOM Adapter y de los adaptadores de entrada. No quedan listeners, referencias al documento anterior ni emisiones posteriores al destroy.

## Teclado y aislamiento

El teclado se enlaza al contenedor del preview, no al documento completo. Los eventos de `input`, `textarea`, `select`, `button`, enlaces y contenido editable se ignoran. El Player conserva flechas, Inicio, Fin y Escape solo cuando la interacción pertenece a su área.

## Errores y límites

Un borrador inválido nunca crea Player. Un contenedor ausente produce error fatal seguro. Un fallo de montaje es recuperable salvo que la dependencia lo declare fatal. Renderer desconocido, renderer fallido y recurso ausente conservan los fallbacks del Player.

Fase 5C no incluye exportación, importación, descarga, almacenamiento, autosave, publicación, PWA, Service Worker, backend, cuentas, colaboración, IA ni Presenter completo.
