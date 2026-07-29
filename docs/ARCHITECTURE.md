# Arquitectura

## Implementado en Fase 3

`src/contracts/` valida documentos públicos y compatibilidad. `src/player/` reúne la máquina de estados, navegación, eventos y ciclo de vida. `src/ui/player-view.js` es el DOM Adapter mínimo: pinta texto público, progreso y controles. `src/input/` adapta teclado y tacto sin tomar control de elementos interactivos. `demo/` solo contiene datos sintéticos; no es una dependencia del motor.

```text
src/
  contracts/   validación, versión y datos públicos
  player/      Player Core, estados, navegación y eventos
  ui/          DOM Adapter
  input/       adaptadores de teclado y tacto
demo/          documento demostrativo
tests/         contratos, Player, entradas, DOM simulado y documentos
```

El Player recibe un `PublicPresentationDocument`, lo clona y no lo muta. El Renderer Registry resuelve el tipo de escena. El DOM Adapter no valida, no navega globalmente por sí mismo y nunca recibe notas privadas. Los Input Adapters devuelven una función de limpieza que el Player ejecuta mediante `destroy`.

## Reglas mantenidas

- HTML mínimo y semántico; CSS y JavaScript fuera de HTML.
- Un archivo, una responsabilidad y menos de 400 líneas.
- Sin dependencias circulares, almacenamiento directo desde la UI ni dependencias de producción.
- Eventos públicos pequeños; no incluyen documento completo ni notas privadas.
- `destroy` elimina suscripciones, listeners registrados, referencias al documento y navegación; no se programan temporizadores.

## Futuro reservado

Studio, Presenter, multimedia, temas, almacenamiento, PWA, publicación y Laboratory conservan su separación documental, pero no tienen implementación en esta fase.

## Extensión visual de Fase 4

`src/themes/` aplica tokens al contenedor de interfaz; `src/layouts/` valida composición; renderers transforman bloques públicos en HTML semántico. Esta capa no modifica el estado del Player ni accede a notas. La demostración queda en `demo/` y el estilo global en `styles.css`.

## Studio y preview — Fases 5A–5C

`src/studio/controller.js` es la autoridad del borrador y del historial privado. `src/studio/ui.js` representa edición, validación y modo responsive. `src/studio/preview-bridge.js` es el único puente hacia la conversión pública y el Player.

```text
StudioController → StudioApp → PreviewBridge → PublicPresentationDocument
                                           → Player existente
```

StudioApp mantiene una suscripción al Controller y otra al PreviewBridge. La UI no crea documentos públicos ni controla internamente el Player. El bridge no conoce selección, historial, dirty state ni formularios. La referencia contractual completa está en [PREVIEW_BRIDGE.md](PREVIEW_BRIDGE.md).
