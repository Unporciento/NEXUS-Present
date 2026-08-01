import test from 'node:test';
import assert from 'node:assert/strict';
import { createResourceManager } from '../../src/media/resource-manager.js';
import { createTransitionController, createTransitionRegistry } from '../../src/player/transitions.js';
import { createVisualRenderers } from '../../src/player/renderers.js';

function fakeDocument() {
  const listeners = new Map();
  return {
    hidden: false,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
    dispatch(type) { listeners.get(type)?.(); },
    querySelectorAll() { return []; },
    createElement() { return { append() {} }; },
    listeners
  };
}

test('ResourceManager resolves scoped assets and revokes them on scene release', async () => {
  const releases = [];
  const pool = {
    acquire(asset) { return `blob:${asset.assetId}`; },
    release(assetId) { releases.push(assetId); },
    destroy() {}
  };
  const repository = {
    async get(assetId) {
      return {
        ok: true,
        value: {
          assetId, draftKey: 'draft-one', kind: 'image', mime: 'image/png',
          blob: new Blob(['a']), metadata: {}
        }
      };
    }
  };
  const manager = createResourceManager({
    repository,
    draftKey: 'draft-one',
    pool,
    capability: { supportsImage: () => true, supportsVideo: () => ({ supported: true }), supportsCaptions: () => true },
    documentApi: fakeDocument()
  });
  const resolved = await manager.resolve('asset-one');
  assert.equal(resolved.url, 'blob:asset-one');
  assert.equal(manager.getState('asset-one').state, 'ready');
  manager.releaseScene();
  assert.deepEqual(releases, ['asset-one']);
  manager.destroy();
  manager.destroy();
});

test('ResourceManager reports missing, unsupported and wrong-scope assets as recoverable', async () => {
  const records = {
    missing: { ok: false, error: { code: 'asset-not-found' } },
    video: { ok: true, value: { assetId: 'video', draftKey: 'draft', kind: 'video', mime: 'video/mp4', blob: new Blob(['a']) } },
    private: { ok: true, value: { assetId: 'private', draftKey: 'other', kind: 'image', mime: 'image/png', blob: new Blob(['a']) } }
  };
  const manager = createResourceManager({
    repository: { get: async (id) => records[id] },
    draftKey: 'draft',
    pool: { acquire() {}, release() {}, destroy() {} },
    capability: { supportsImage: () => true, supportsVideo: () => ({ supported: false }), supportsCaptions: () => true },
    documentApi: fakeDocument()
  });
  assert.equal((await manager.resolve('missing')).state, 'failed');
  assert.equal((await manager.resolve('video')).state, 'unsupported');
  assert.equal((await manager.resolve('private')).state, 'failed');
  manager.destroy();
});

test('hidden documents pause managed videos and destroy removes the listener', () => {
  let pauses = 0;
  const documentApi = fakeDocument();
  documentApi.querySelectorAll = () => [{ pause() { pauses += 1; } }];
  const manager = createResourceManager({
    repository: {},
    draftKey: 'draft',
    pool: { destroy() {} },
    documentApi
  });
  documentApi.hidden = true;
  documentApi.dispatch('visibilitychange');
  assert.equal(pauses, 1);
  manager.destroy();
  assert.equal(documentApi.listeners.has('visibilitychange'), false);
});

test('mounted video uses native controls, poster, captions and releases media on navigation', async () => {
  let pauses = 0, resets = 0;
  const appended = [];
  const video = {
    dataset: {
      nexusAsset: 'video-one',
      assetKind: 'video',
      posterAsset: 'poster-one',
      captionsAsset: 'captions-one'
    },
    addEventListener() {},
    append(value) { appended.push(value); },
    closest() { return { querySelector: () => ({ hidden: false, textContent: '' }) }; },
    pause() { pauses += 1; },
    removeAttribute(name) { if (name === 'src') this.src = ''; },
    load() { resets += 1; }
  };
  const records = {
    'video-one': { kind: 'video', mime: 'video/mp4' },
    'poster-one': { kind: 'image', mime: 'image/png' },
    'captions-one': { kind: 'captions', mime: 'text/vtt' }
  };
  const documentApi = fakeDocument();
  documentApi.createElement = () => ({});
  const manager = createResourceManager({
    repository: {
      get: async (assetId) => ({
        ok: true,
        value: {
          assetId,
          draftKey: 'draft',
          blob: new Blob([assetId]),
          metadata: {},
          ...records[assetId]
        }
      })
    },
    draftKey: 'draft',
    pool: {
      acquire: (asset) => `blob:${asset.assetId}`,
      release() {},
      destroy() {}
    },
    capability: {
      supportsImage: () => true,
      supportsVideo: () => ({ supported: true }),
      supportsCaptions: () => true
    },
    documentApi
  });
  await manager.mount({ querySelectorAll: () => [video] });
  assert.equal(video.controls, true);
  assert.equal(video.preload, 'metadata');
  assert.equal(video.src, 'blob:video-one');
  assert.equal(video.poster, 'blob:poster-one');
  assert.equal(appended[0].src, 'blob:captions-one');
  manager.releaseScene();
  assert.equal(pauses, 1);
  assert.equal(resets, 1);
  manager.destroy();
});

test('TransitionRegistry exposes only the restrained initial motion set', () => {
  const registry = createTransitionRegistry();
  assert.deepEqual(registry.list(), ['cut', 'fade', 'slide', 'focus']);
  assert.equal(registry.register('fade', { keyframes: [] }), false);
});

test('rapid transitions cancel the previous animation and reduced motion uses cut', () => {
  const documentApi = fakeDocument();
  let cancellations = 0;
  const element = {
    animate() {
      return {
        finished: new Promise(() => {}),
        cancel() { cancellations += 1; }
      };
    }
  };
  const controller = createTransitionController({
    documentApi,
    windowApi: { matchMedia: () => ({ matches: false }) }
  });
  assert.equal(controller.run(element, 'fade').applied, 'fade');
  assert.equal(controller.run(element, 'slide').applied, 'slide');
  assert.equal(cancellations, 1);
  controller.destroy();
  assert.equal(cancellations, 2);
  const reduced = createTransitionController({
    documentApi: fakeDocument(),
    windowApi: { matchMedia: () => ({ matches: true }) }
  });
  assert.equal(reduced.run(element, 'focus').applied, 'cut');
  reduced.destroy();
});

test('renderers produce inert asset hooks and never inline executable error handlers', () => {
  const renderer = createVisualRenderers().find((item) => item.typeId === 'media');
  const output = renderer.render({
    type: 'media',
    layout: 'media-right',
    blocks: [
      { id: 'image', type: 'image', assetId: 'asset-image', alt: 'Vista segura' },
      {
        id: 'video',
        type: 'video',
        assetId: 'asset-video',
        posterAssetId: 'asset-poster',
        captionsAssetId: 'asset-captions',
        title: 'Demostración'
      }
    ]
  }).html;
  assert.match(output, /data-nexus-asset="asset-image"/);
  assert.match(output, /data-nexus-asset="asset-video"/);
  assert.match(output, /data-poster-asset="asset-poster"/);
  assert.match(output, /data-captions-asset="asset-captions"/);
  assert.doesNotMatch(output, /onerror=|javascript:|<script/i);
});
