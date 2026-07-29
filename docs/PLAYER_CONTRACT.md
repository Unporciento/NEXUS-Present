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

## Límites de Fase 3

No implementa Studio, Presenter completo, segunda pantalla, temas, multimedia avanzada, almacenamiento, publicación, PWA, Service Worker, Pages, backend, salas ni IA.

```js
const player = createPlayer();
player.loadPresentation(publicDocument);
player.start();
```
