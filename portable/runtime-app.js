import { createDefaultRegistry } from '../src/contracts/index.js';
import { bindKeyboard } from '../src/input/keyboard.js';
import { bindTouch } from '../src/input/touch.js';
import { createStaticResourceManager } from '../src/package/static-resource-manager.js';
import { createPlayer } from '../src/player/player.js';
import { createRendererRegistry, createVisualRenderers } from '../src/player/renderers.js';
import { createPlayerView } from '../src/ui/player-view.js';

async function boot() {
  const root = document.querySelector('#app');
  try {
    const response = await fetch(new URL('../../presentation.json', import.meta.url), { cache: 'no-store' });
    if (!response.ok) throw new Error('presentation-unavailable');
    const presentation = await response.json();
    createDefaultRegistry();
    const player = createPlayer({ engineVersion: document.documentElement.dataset.engineVersion });
    const renderers = createRendererRegistry();
    createVisualRenderers().forEach((renderer) => renderers.register(renderer));
    const resourceManager = createStaticResourceManager({ resources: presentation.resources });
    createPlayerView(root, { player, renderers, theme: presentation.theme, resourceManager });
    const loaded = player.loadPresentation(presentation);
    if (!loaded.valid) throw new Error('presentation-invalid');
    player.start();
    player.addCleanup(bindKeyboard(document, player));
    player.addCleanup(bindTouch(document, player));
    addEventListener('pagehide', () => player.destroy(), { once: true });
  } catch {
    root.innerHTML = '<main class="player"><section class="scene"><h1>No fue posible abrir la presentación</h1><p>Comprueba que el paquete conserva todos sus archivos y se sirve mediante HTTP.</p></section></main>';
  }
}

boot();
