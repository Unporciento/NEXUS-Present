import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRegistry } from '../../src/contracts/index.js';
import { createPlayer } from '../../src/player/player.js';

const document = () => ({ contractVersion: '1.0.0', id: 'player-demo', version: '1.0.0', minimumEngineVersion: '1.0.0', title: 'Demo', createdAt: '2026-07-29T00:00:00Z', updatedAt: '2026-07-29T00:00:00Z', theme: 'default', resources: [], scenes: [
  { id: 'scene-cover', type: 'cover', layout: 'hero', blocks: [{ id: 'block-one', type: 'heading', text: 'One' }] },
  { id: 'scene-closing', type: 'closing', layout: 'centered', blocks: [{ id: 'block-two', type: 'heading', text: 'Two' }] }
] });
test.beforeEach(() => createDefaultRegistry());
test('loads, starts, navigates and reports progress without mutation', () => { const value = document(), player = createPlayer(); assert.equal(player.loadPresentation(value).valid, true); assert.equal(player.getState(), 'ready'); assert.equal(player.start(), true); assert.equal(player.next(), true); assert.deepEqual(player.getProgress(), { current: 2, total: 2, ratio: 1 }); assert.equal(player.previous(), true); assert.equal(value.scenes[0].id, 'scene-cover'); });
test('enforces limits, completion, pause, resume, restart and destroy', () => { const player = createPlayer(); player.loadPresentation(document()); player.start(); assert.equal(player.previous(), false); player.next(); assert.equal(player.next(), false); assert.equal(player.getState(), 'completed'); assert.equal(player.restart(), true); assert.equal(player.pause(), true); assert.equal(player.resume(), true); player.destroy(); assert.equal(player.getState(), 'destroyed'); });
test('rejects invalid loads, recovers and emits controlled events', () => { const player = createPlayer(), events = []; player.subscribe('presentation-loaded', (event) => events.push(event.type)); player.subscribe('scene-changed', (event) => events.push(event.type)); assert.equal(player.loadPresentation({}).valid, false); assert.equal(player.getState(), 'error'); assert.equal(player.loadPresentation(document()).valid, true); player.start(); assert.deepEqual(events, ['presentation-loaded', 'scene-changed']); });
test('destroy runs cleanups, clears subscriptions and prevents navigation', () => { const player = createPlayer(), events = [], cleanup = []; player.subscribe('scene-changed', () => events.push('changed')); player.addCleanup(() => cleanup.push('done')); player.loadPresentation(document()); player.start(); player.destroy(); assert.deepEqual(cleanup, ['done']); assert.equal(player.next(), false); assert.deepEqual(events, ['changed']); });
