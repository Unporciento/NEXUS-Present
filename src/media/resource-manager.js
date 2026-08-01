import { createMediaCapabilityDetector } from './media-capability.js';
import { createObjectUrlPool } from './object-url-pool.js';
import { resourceFallback } from './resource-state.js';

const clone = (value) => structuredClone(value);

export function createResourceManager({
  repository,
  draftKey,
  pool = createObjectUrlPool(),
  capability = createMediaCapabilityDetector(),
  documentApi = globalThis.document
} = {}) {
  const active = new Map();
  const mountedElements = new Set();
  const listeners = new Set();
  let destroyed = false;
  let generation = 0;
  const states = new Map();
  const emit = (assetId, state, context = {}) => {
    const value = { assetId, state, ...context };
    states.set(assetId, value);
    if (!destroyed) listeners.forEach((listener) => listener(clone(value)));
    return value;
  };
  const supported = (asset) => {
    if (asset.kind === 'image') return capability.supportsImage(asset.mime);
    if (asset.kind === 'video') return capability.supportsVideo(asset.mime).supported;
    if (asset.kind === 'captions') return capability.supportsCaptions(asset.mime);
    return false;
  };
  const resolve = async (assetId, expectedGeneration = generation) => {
    if (destroyed) return { ok: false, ...emit(assetId, 'failed') };
    emit(assetId, 'loading');
    const stored = await repository.get(assetId);
    if (destroyed || expectedGeneration !== generation) return { ok: false, cancelled: true };
    if (!stored.ok) return { ok: false, ...emit(assetId, 'failed', { error: stored.error }) };
    if (stored.value.draftKey !== draftKey) {
      return { ok: false, ...emit(assetId, 'failed', { error: { code: 'asset-scope-mismatch' } }) };
    }
    if (!supported(stored.value)) {
      return { ok: false, ...emit(assetId, 'unsupported', { mime: stored.value.mime }) };
    }
    const url = pool.acquire(stored.value);
    active.set(assetId, (active.get(assetId) ?? 0) + 1);
    emit(assetId, 'ready', { mime: stored.value.mime });
    return { ok: true, url, asset: stored.value };
  };
  const releaseAsset = (assetId) => {
    const references = active.get(assetId) ?? 0;
    if (!references) return;
    if (references === 1) active.delete(assetId);
    else active.set(assetId, references - 1);
    pool.release(assetId);
  };
  const releaseScene = () => {
    generation += 1;
    mountedElements.forEach((element) => {
      element.pause?.();
      element.removeAttribute?.('src');
      element.load?.();
    });
    mountedElements.clear();
    for (const [assetId, references] of active) {
      for (let index = 0; index < references; index += 1) pool.release(assetId);
    }
    active.clear();
  };
  const showFallback = (element, state) => {
    const status = element.closest?.('[data-resource-container]')?.querySelector?.('[data-resource-status]');
    if (status) {
      status.hidden = false;
      status.textContent = resourceFallback(state).message;
    }
  };
  const mountImage = async (element, assetId, currentGeneration) => {
    const result = await resolve(assetId, currentGeneration);
    if (!result.ok) return showFallback(element, result.state ?? 'failed');
    const status = element.closest?.('[data-resource-container]')?.querySelector?.('[data-resource-status]');
    const loaded = () => {
      if (status) status.hidden = true;
    };
    const failed = () => {
      releaseAsset(assetId);
      showFallback(element, 'failed');
    };
    element.addEventListener?.('load', loaded, { once: true });
    element.addEventListener?.('error', failed, { once: true });
    element.src = result.url;
    mountedElements.add(element);
  };
  const mountVideo = async (element, assetId, currentGeneration) => {
    const result = await resolve(assetId, currentGeneration);
    if (!result.ok) return showFallback(element, result.state ?? 'failed');
    const metadata = result.asset.metadata ?? {};
    element.preload = metadata.preload ?? 'metadata';
    element.controls = true;
    element.src = result.url;
    mountedElements.add(element);
    const status = element.closest?.('[data-resource-container]')?.querySelector?.('[data-resource-status]');
    element.addEventListener?.('loadedmetadata', () => {
      if (status) status.hidden = true;
    }, { once: true });
    element.addEventListener?.('error', () => {
      releaseAsset(assetId);
      showFallback(element, 'failed');
    }, { once: true });
    const posterAssetId = element.dataset?.posterAsset ?? metadata.posterAssetId;
    if (posterAssetId) {
      const poster = await resolve(posterAssetId, currentGeneration);
      if (poster.ok) element.poster = poster.url;
    }
    const captionsAssetId = element.dataset?.captionsAsset ?? metadata.captionsAssetId;
    if (captionsAssetId && documentApi?.createElement) {
      const captions = await resolve(captionsAssetId, currentGeneration);
      if (captions.ok) {
        const track = documentApi.createElement('track');
        track.kind = 'captions';
        track.label = 'Español';
        track.srclang = 'es';
        track.default = true;
        track.src = captions.url;
        element.append(track);
      }
    }
  };
  const onVisibility = () => {
    if (!documentApi?.hidden) return;
    documentApi.querySelectorAll?.('video[data-nexus-asset]').forEach((video) => video.pause?.());
  };
  documentApi?.addEventListener?.('visibilitychange', onVisibility);
  return {
    subscribe(listener) {
      if (destroyed || typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getState(assetId) {
      return clone(states.get(assetId) ?? { assetId, state: 'idle' });
    },
    resolve,
    async mount(root) {
      if (destroyed || !root?.querySelectorAll) return false;
      releaseScene();
      const currentGeneration = generation;
      const tasks = [...root.querySelectorAll('[data-nexus-asset]')].map((element) => {
        const assetId = element.dataset.nexusAsset;
        return element.dataset.assetKind === 'video'
          ? mountVideo(element, assetId, currentGeneration)
          : mountImage(element, assetId, currentGeneration);
      });
      await Promise.allSettled(tasks);
      return currentGeneration === generation && !destroyed;
    },
    releaseScene,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      releaseScene();
      listeners.clear();
      documentApi?.removeEventListener?.('visibilitychange', onVisibility);
      pool.destroy();
      states.clear();
    }
  };
}
