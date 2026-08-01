import { validatePublicPresentation } from '../contracts/index.js';
import { createEventBus } from './events.js';
import { createNavigation } from './navigation.js';
import { createStateMachine } from './state-machine.js';
import { ENGINE_VERSION } from '../version.js';

export function createPlayer({ engineVersion = ENGINE_VERSION } = {}) {
  const machine = createStateMachine(), events = createEventBus(), cleanups = new Set(); let document = null, navigation = null;
  const emitScene = () => events.emit('scene-changed', { index: navigation.index, sceneId: navigation.scene.id, progress: navigation.progress });
  const fail = (diagnostics) => { machine.transition('error'); events.emit('player-error', { diagnostics }); return { valid: false, diagnostics }; };
  return {
    loadPresentation(value) {
      if (machine.state === 'error') machine.transition('idle');
      if (!machine.can('loading')) throw new Error('Player cannot load in its current state.'); machine.transition('loading');
      const check = validatePublicPresentation(value, engineVersion); if (!check.valid) return fail(check.diagnostics);
      document = structuredClone(value); navigation = createNavigation(document.scenes); machine.transition('ready'); events.emit('presentation-loaded', { presentationId: document.id, total: navigation.total }); return { valid: true };
    },
    start() { if (!navigation || !machine.can('presenting')) return false; machine.transition('presenting'); events.emit('presentation-started', { sceneId: navigation.scene.id }); emitScene(); return true; },
    next() { if (machine.state !== 'presenting' || !navigation.next()) { if (machine.state === 'presenting' && navigation?.index === navigation.total - 1) { machine.transition('completed'); events.emit('presentation-completed'); } return false; } emitScene(); return true; },
    previous() { if (machine.state !== 'presenting' || !navigation.previous()) return false; emitScene(); return true; },
    goToScene(index) { if (machine.state !== 'presenting' || !navigation.goTo(index)) return false; emitScene(); return true; },
    pause() { if (!machine.can('paused')) return false; machine.transition('paused'); events.emit('presentation-paused'); return true; },
    resume() { if (!machine.can('presenting')) return false; machine.transition('presenting'); events.emit('presentation-resumed'); return true; },
    restart() { if (!navigation || !['presenting','completed','paused'].includes(machine.state)) return false; navigation.restart(); if (machine.state !== 'presenting') machine.transition(machine.state === 'completed' ? 'presenting' : 'presenting'); emitScene(); return true; },
    destroy() { if (machine.state === 'destroyed') return; machine.transition('destroyed'); [...cleanups].forEach((cleanup) => cleanup()); cleanups.clear(); document = null; navigation = null; events.emit('player-destroyed'); events.clear(); },
    addCleanup(cleanup) { cleanups.add(cleanup); return () => cleanups.delete(cleanup); },
    getState() { return machine.state; }, getProgress() { return navigation?.progress ?? { current: 0, total: 0, ratio: 0 }; }, getScene() { return navigation?.scene ?? null; }, subscribe: events.subscribe
  };
}
