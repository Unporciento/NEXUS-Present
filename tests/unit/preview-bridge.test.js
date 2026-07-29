import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudioDraft } from '../../src/studio/controller.js';
import { createPreviewBridge, previewStates } from '../../src/studio/preview-bridge.js';

function container() {
  const listeners = new Map();
  const ids = new Map();
  const make = (id) => ({ id, textContent: '', disabled: false, onclick: null });
  return {
    set innerHTML(_) {
      ['player-status', 'player-title', 'scene-body', 'previous', 'progress', 'next', 'restart', 'year']
        .forEach((id) => ids.set(id, make(id)));
    },
    querySelector(selector) { return ids.get(selector.slice(1)); },
    replaceChildren() { ids.clear(); },
    addEventListener(type, fn) { listeners.set(type, (listeners.get(type) ?? new Set()).add(fn)); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    listenerCount() { return [...listeners.values()].reduce((total, set) => total + set.size, 0); },
    ids
  };
}

test('PreviewBridge validates, transforms and excludes all Studio-private state', () => {
  const draft = createStudioDraft();
  draft.presenter = { notes: 'private' };
  draft.history = [{ title: 'old' }];
  const host = container();
  const bridge = createPreviewBridge();
  const result = bridge.preview(draft, host);
  assert.equal(result.ok, true);
  assert.equal(bridge.getState().status, 'ready');
  for (const field of ['presenter', 'editorial', 'history', 'privateData', 'dirty', 'selection', 'preview']) {
    assert.equal(field in result.value, false);
  }
  assert.notEqual(result.value, draft);
  assert.equal(host.listenerCount(), 4);
});

test('PreviewBridge accumulates invalid diagnostics and never starts Player', () => {
  let created = 0;
  const draft = createStudioDraft();
  draft.title = '';
  draft.scenes = [];
  const bridge = createPreviewBridge({ playerFactory() { created += 1; } });
  const result = bridge.preview(draft, container());
  assert.equal(result.ok, false);
  assert.equal(bridge.getState().status, 'invalid');
  assert.ok(bridge.getState().diagnostics.length >= 2);
  assert.equal(created, 0);
});

test('PreviewBridge is deterministic, becomes stale and refreshes manually', () => {
  const bridge = createPreviewBridge();
  const draft = createStudioDraft();
  const first = bridge.preview(draft, container());
  bridge.markStale();
  assert.equal(bridge.getState().status, 'stale');
  const second = bridge.preview(draft, container());
  assert.deepEqual(first.value, second.value);
  assert.equal(bridge.getState().status, 'ready');
});

test('PreviewBridge destroys prior Player, closes, reopens and double-destroys safely', () => {
  const players = [];
  const bridge = createPreviewBridge({
    playerFactory() {
      const player = {
        destroyed: 0, cleanups: [], state: 'idle',
        loadPresentation() { this.state = 'ready'; return { valid: true }; },
        start() { this.state = 'presenting'; return true; },
        addCleanup(fn) { this.cleanups.push(fn); },
        destroy() { this.destroyed += 1; this.cleanups.splice(0).forEach((fn) => fn()); },
        subscribe() { return () => {}; },
        getScene() { return { type: 'cover', blocks: [] }; },
        getProgress() { return { current: 1, total: 1 }; },
        getState() { return this.state; },
        previous() {}, next() {}, restart() {}
      };
      players.push(player);
      return player;
    },
    viewFactory() {},
    keyboardBinder() { return () => {}; },
    touchBinder() { return () => {}; }
  });
  assert.equal(bridge.preview(createStudioDraft(), container()).ok, true);
  assert.equal(bridge.preview(createStudioDraft({ theme: 'neutral' }), container()).ok, true);
  assert.equal(players[0].destroyed, 1);
  assert.equal(bridge.close(), true);
  assert.equal(players[1].destroyed, 1);
  assert.equal(bridge.preview(createStudioDraft(), container()).ok, true);
  bridge.destroy();
  bridge.destroy();
  assert.equal(players[2].destroyed, 1);
  assert.equal(bridge.getState().status, 'destroyed');
  assert.equal(bridge.preview(createStudioDraft(), container()).ok, false);
});

test('PreviewBridge exposes recoverable and fatal errors without traces', () => {
  const recoverable = createPreviewBridge({ playerFactory() { throw new Error('secret trace'); } });
  const failed = recoverable.preview(createStudioDraft(), container());
  assert.equal(failed.ok, false);
  assert.equal(recoverable.getState().status, 'recoverable-error');
  assert.doesNotMatch(recoverable.getState().diagnostics[0].message, /secret trace/);
  const fatal = createPreviewBridge({ playerFactory() { const error = new Error('fatal'); error.fatal = true; throw error; } });
  fatal.preview(createStudioDraft(), container());
  assert.equal(fatal.getState().status, 'fatal-error');
  assert.equal(fatal.getState().canRetry, false);
});

test('Preview states are complete and no forbidden capability exists', () => {
  assert.deepEqual(previewStates, [
    'idle', 'validating', 'invalid', 'transforming', 'rendering',
    'ready', 'stale', 'recoverable-error', 'fatal-error', 'destroyed'
  ]);
  const source = createPreviewBridge.toString();
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|download|export|fetch/);
});
