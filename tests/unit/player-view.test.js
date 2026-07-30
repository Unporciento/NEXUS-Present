import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRegistry } from '../../src/contracts/index.js';
import { createPlayer } from '../../src/player/player.js';
import { createRendererRegistry, createTextRenderers } from '../../src/player/renderers.js';
import { createPlayerView } from '../../src/ui/player-view.js';
import { demoPresentation } from '../../demo/public-demo.js';

function fakeRoot() { const ids = new Map(); const make = (id) => ({ id, textContent: '', disabled: false, onclick: null }); return { html:'', set innerHTML(value) { this.html=value; ['player-status','player-title','scene-body','previous','progress','next','restart','year'].forEach((id) => ids.set(id, make(id))); }, querySelector(selector) { return ids.get(selector.slice(1)); }, replaceChildren() { ids.clear(); this.html=''; }, ids }; }
function setup() { createDefaultRegistry(); const player = createPlayer(), registry = createRendererRegistry(), root = fakeRoot(); createTextRenderers().forEach((renderer) => registry.register(renderer)); const view = createPlayerView(root, { player, renderers: registry }); player.loadPresentation(demoPresentation); player.start(); return { player, root, view }; }
test('DOM adapter renders demo scenes, controls and progress visibly', () => { const { player, root } = setup(); assert.equal(root.ids.get('player-title').textContent, 'NEXUS'); assert.equal(root.ids.get('previous').disabled, true); assert.equal(root.ids.get('progress').textContent, '1 de 7'); root.ids.get('next').onclick(); assert.equal(root.ids.get('progress').textContent, '2 de 7'); player.goToScene(6); assert.equal(root.ids.get('next').disabled, false); root.ids.get('next').onclick(); assert.equal(root.ids.get('player-status').textContent, 'Presentación finalizada. Puedes reiniciar.'); assert.equal(root.ids.get('next').disabled, true); root.ids.get('restart').onclick(); assert.equal(root.ids.get('progress').textContent, '1 de 7'); });
test('DOM adapter exposes invalid documents, unsupported renderers and renderer errors', () => { const player = createPlayer(), root = fakeRoot(), registry = createRendererRegistry(); createPlayerView(root, { player, renderers: registry }); player.loadPresentation({}); assert.match(root.ids.get('player-status').textContent,/No fue posible cargar/); createDefaultRegistry(); player.loadPresentation({ ...demoPresentation, scenes: [] }); assert.match(root.ids.get('player-status').textContent,/No fue posible cargar/); player.loadPresentation(demoPresentation); player.start(); assert.equal(root.ids.get('player-title').textContent, 'NEXUS'); registry.register({ typeId: 'cover', render() { throw new Error('renderer failure'); } }); player.restart(); assert.match(root.ids.get('player-status').textContent,/No fue posible mostrar/); assert.equal(root.ids.get('player-title').textContent, 'NEXUS'); });

test('DOM adapter removes visible controls and subscriptions on destroy', () => { const { player, root } = setup(); player.destroy(); assert.equal(root.ids.size, 0); assert.equal(player.next(), false); });

test('Player copyright and heading hierarchy are explicit for standalone and embedded use', () => {
  createDefaultRegistry();
  const player = createPlayer(), registry = createRendererRegistry();
  createTextRenderers().forEach((renderer) => registry.register(renderer));
  const standalone = fakeRoot();
  createPlayerView(standalone, { player, renderers: registry });
  assert.match(standalone.html, /Todos los derechos reservados/);
  assert.match(standalone.html, /<h1 id="player-title"/);
  const embedded = fakeRoot();
  createPlayerView(embedded, { player, renderers: registry, showCopyright: false, embedded: true });
  assert.doesNotMatch(embedded.html, /Todos los derechos reservados/);
  assert.doesNotMatch(embedded.html, /<h1 id="player-title"/);
  assert.match(embedded.html, /<h3 id="player-title"/);
});
