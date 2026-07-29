# Contrato del Player

Player Core recibe solo `PublicPresentationDocument`, valida compatibilidad y no muta contenido. Estados: `idle`, `loading`, `ready`, `presenting`, `paused`, `completed`, `error`, `destroyed`; transiciones imposibles se rechazan.

API: `loadPresentation`, `start`, `next`, `previous`, `goToScene`, `pause`, `resume`, `restart`, `destroy`, `getState`, `getProgress`, `subscribe` y `addCleanup`.

Eventos: `presentation-loaded`, `presentation-started`, `scene-changed`, `presentation-paused`, `presentation-resumed`, `presentation-completed`, `player-error`, `player-destroyed`. Nunca incluyen notas privadas ni el documento completo.

Player Core gestiona ciclo de vida; Renderer Registry asocia tipo a renderer; DOM Adapter representa texto y controles; Input Adapters gestionan teclado/tacto limpiable; Demo usa datos sintéticos. Renderers actuales: cover, statement, content y closing. Otros tipos informan estado no soportado.

Teclado: flechas, Home, End y Escape, ignorando controles editables. Tacto: swipe horizontal claro, cancelable, no vertical, no sobre interactivos y con botones visibles. `destroy` ejecuta limpiezas y elimina suscriptores.

La interfaz mantiene contenido semántico, foco visible, controles nombrados, progreso comprensible y estado anunciado. Fase 3 excluye Studio, Presenter completo, publicación, PWA, persistencia, multimedia avanzada y temas cinematográficos.

```js
const player = createPlayer();
player.loadPresentation(publicDocument);
player.start();
```
