import { applyTheme } from '../themes/themes.js';
import { createTransitionController } from '../player/transitions.js';
import { NEXUS_VERSION } from '../version.js';
const normalizeSceneHeading = (html, embedded) =>
  html.replace(/<(\/?)h1(?=[\s>])/g, `<$1h${embedded ? 3 : 2}`);
const sceneRenderError = 'No fue posible mostrar esta escena. Puedes continuar o reiniciar.';
const safeReturnUrl = (value) => typeof value === 'string' && /^(?![a-z]+:|\/\/|\/)[\w./?#=&-]+$/i.test(value)
  ? value
  : null;
export function createPlayerView(root, {
  player,
  renderers,
  theme = 'nexus',
  showCopyright = true,
  embedded = false,
  resourceManager = null,
  transitionController = createTransitionController(),
  returnUrl = null
}) {
  const returnLink = safeReturnUrl(returnUrl);
  applyTheme(root, theme); root.innerHTML = `<main class="player" aria-labelledby="player-title">
    <header class="player-header"><p class="brand">NEXUS <span class="player-context">Reproductor</span> <span class="player-version">${NEXUS_VERSION}</span></p><div class="player-header-actions"><p id="player-status" role="status"></p>${returnLink ? `<a class="button-link" href="${returnLink}">Volver a NEXUS</a>` : ''}</div></header>
    <section id="scene" aria-live="polite"><${embedded ? 'h3' : 'h1'} id="player-title" class="sr-only"></${embedded ? 'h3' : 'h1'}><div id="scene-body"></div></section>
    <footer>
      <nav aria-label="Presentación"><button id="previous" type="button">Anterior</button><span id="progress"></span><button id="next" type="button">Siguiente</button><button id="restart" type="button">Reiniciar</button></nav>
      ${showCopyright ? '<small>© <span id="year"></span> NEXUS. Todos los derechos reservados.</small>' : ''}
    </footer>
  </main>`;
  const $ = (id) => root.querySelector(`#${id}`), status = $('player-status'), title = $('player-title'), body = $('scene-body'); const year = $('year'); if (year) year.textContent = new Date().getFullYear();
  let activeRenderer = null;
  const update = () => {
    const scene = player.getScene(), progress = player.getProgress(), renderer = renderers.get(scene?.type);
    let output = { html: '<article class="scene"><h1>Escena no soportada</h1><p>Este tipo no está disponible.</p></article>' };
    try {
      activeRenderer?.dispose?.();
      activeRenderer = renderer;
      if (renderer) output = renderer.render(scene);
      if (status.textContent === sceneRenderError) status.textContent = 'Presentación lista';
    } catch {
      status.textContent = sceneRenderError;
      output = { html: '<article class="scene"><h1>Escena no disponible</h1><p>Intenta continuar o reiniciar.</p></article>' };
    }
    title.textContent = scene?.blocks?.find((item) => item.type === 'heading')?.text ?? 'NEXUS';
    body.innerHTML = normalizeSceneHeading(output.html, embedded);
    resourceManager?.mount?.(body);
    transitionController.run(body.firstElementChild ?? body, scene?.transition ?? 'fade');
    $('progress').textContent = `${progress.current} de ${progress.total}`;
    $('previous').disabled = progress.current <= 1;
    $('next').disabled = player.getState() === 'completed';
  };
  $('previous').onclick = () => player.previous(); $('next').onclick = () => player.next(); $('restart').onclick = () => player.restart();
  const subscriptions = [player.subscribe('presentation-loaded', () => { status.textContent = 'Presentación lista'; update(); }), player.subscribe('scene-changed', update), player.subscribe('presentation-completed', () => { status.textContent = 'Presentación finalizada. Puedes reiniciar.'; update(); }), player.subscribe('player-error', () => { status.textContent = 'No fue posible cargar la presentación. Revisa el documento e inténtalo de nuevo.'; })];
  const destroy = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
    activeRenderer?.dispose?.();
    activeRenderer = null;
    resourceManager?.destroy?.();
    transitionController.destroy();
    root.replaceChildren();
  };
  player.addCleanup(destroy); return { update, destroy };
}
