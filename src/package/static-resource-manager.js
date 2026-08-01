import { createMediaCapabilityDetector } from '../media/media-capability.js';

export function createStaticResourceManager({ resources = [], documentApi = globalThis.document } = {}) {
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  const mounted = new Set();
  let destroyed = false;
  const fallback = (element, message) => {
    const status = element.closest?.('[data-resource-container]')?.querySelector?.('[data-resource-status]');
    if (status) status.textContent = message;
  };
  const mountOne = (element) => {
    const resource = byId.get(element.dataset.nexusAsset);
    if (!resource) return fallback(element, 'Recurso no incluido. Puedes continuar.');
    const capability = createMediaCapabilityDetector();
    const supported = resource.type === 'video'
      ? capability.supportsVideo(resource.mime).supported
      : capability.supportsImage(resource.mime);
    if (!supported) return fallback(element, 'Formato no compatible. Puedes continuar.');
    element.src = new URL(resource.url, documentApi.baseURI).href;
    if (element.tagName === 'VIDEO') {
      const poster = byId.get(element.dataset.posterAsset);
      if (poster) element.poster = new URL(poster.url, documentApi.baseURI).href;
      const captions = byId.get(element.dataset.captionsAsset);
      if (captions) {
        const track = documentApi.createElement('track');
        track.kind = 'captions'; track.label = 'Español'; track.srclang = 'es'; track.default = true;
        track.src = new URL(captions.url, documentApi.baseURI).href;
        element.append(track);
      }
    }
    mounted.add(element);
    const status = element.closest?.('[data-resource-container]')?.querySelector?.('[data-resource-status]');
    if (status) status.hidden = true;
  };
  const releaseScene = () => {
    mounted.forEach((element) => { element.pause?.(); element.removeAttribute?.('src'); element.load?.(); });
    mounted.clear();
  };
  return {
    async mount(root) {
      if (destroyed) return false;
      releaseScene();
      root?.querySelectorAll?.('[data-nexus-asset]').forEach(mountOne);
      return true;
    },
    destroy() { if (!destroyed) { destroyed = true; releaseScene(); byId.clear(); } }
  };
}
