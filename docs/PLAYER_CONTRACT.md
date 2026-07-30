# Contrato del Player

## Responsabilidad

Player Core recibe solo `PublicPresentationDocument`, valida compatibilidad, clona datos y nunca los muta. Sus estados son `idle`, `loading`, `ready`, `presenting`, `paused`, `completed`, `error` y `destroyed`; las transiciones imposibles se rechazan.

## Componentes separados

- **Player Core:** estado, navegación, eventos y ciclo de vida.
- **Renderer Registry:** asocia `type` a un renderer de escena.
- **DOM Adapter:** representa texto público, estado, progreso y controles.
- **Input Adapters:** teclado y tacto; devuelven una limpieza registrable.
- **Demo:** datos sintéticos independientes del motor.

## API y eventos

API: `loadPresentation`, `start`, `next`, `previous`, `goToScene`, `pause`, `resume`, `restart`, `destroy`, `getState`, `getProgress`, `getScene`, `subscribe` y `addCleanup`.

Eventos: `presentation-loaded`, `presentation-started`, `scene-changed`, `presentation-paused`, `presentation-resumed`, `presentation-completed`, `player-error` y `player-destroyed`. No incluyen el documento completo ni notas privadas.

Los renderers actuales son `cover`, `statement`, `content` y `closing`. Un tipo no registrado representa una escena segura. Una excepción de renderer muestra un error recuperable sin ejecutar código del documento.

## Entradas, accesibilidad y limpieza

Teclado: flechas, Inicio, Fin y Escape, ignorando controles editables o interactivos. Tacto: swipe horizontal claro, cancelable, no vertical, no sobre interactivos, respetando movimiento reducido y sin impedir el desplazamiento normal. Los botones siguen visibles.

El DOM Adapter conserva contenido semántico, foco visible, nombres accesibles, progreso comprensible y `aria-live` breve. `destroy` ejecuta limpiezas registradas, borra suscripciones y referencias internas, y bloquea navegación posterior.

El área de progreso es visualmente independiente de los botones. Marca, estado, escena, controles, estados deshabilitados y footer consumen tokens del tema. En `completed`, permanece visible la última escena, el progreso conserva el total real, Anterior y Reiniciar siguen disponibles y Siguiente queda deshabilitado. La demo vigente confirma `7 de 7`; la combinación observada previamente `completed` + `1 de 4` + Siguiente activo no se reproduce con el adaptador actual.

## Límites de Fase 3

No implementa Studio, Presenter completo, segunda pantalla, temas, multimedia avanzada, almacenamiento, publicación, PWA, Service Worker, Pages, backend, salas ni IA.

Fase 4 añadió renderers públicos visuales y layouts, sin cambiar las responsabilidades del Player Core. Los estados de recurso faltante, renderer no soportado y error de renderer se representan con mensajes recuperables. El hotfix posterior a 5B solo corrige tokens, contraste y jerarquía visual; no incorpora PreviewBridge ni capacidades de 5C.

En Fase 5C, PreviewBridge reutiliza esta misma implementación dentro del Studio. El Player recibe exclusivamente `PublicPresentationDocument`, enlaza teclado y tacto al contenedor embebido y conserva navegación, progreso, reinicio, temas, movimiento reducido, completed y destroy. No existe un Player paralelo.

Fase 5E añade opciones explícitas de presentación: `showCopyright` es `true` por defecto y `embedded` es `false`. Studio usa `showCopyright: false` y `embedded: true`, conserva un único `h1` de página y adapta los encabezados internos del Player a la jerarquía del panel. El Player independiente mantiene un `h1` y su copyright.

```js
const player = createPlayer();
player.loadPresentation(publicDocument);
player.start();
```
