import {
  createDefaultRegistry,
  createPublicPresentation,
  validatePublicPresentation,
  validateSourcePresentation
} from '../contracts/index.js';

export const exportStates = Object.freeze([
  'idle',
  'validating',
  'invalid',
  'preparing',
  'ready',
  'stale',
  'recoverable-error',
  'destroyed'
]);

const clone = (value) => structuredClone(value);
const failure = (code, message, context = {}) => ({
  ok: false,
  error: { code, path: '', message, severity: 'error', context }
});
const localPath = /^(?:[a-z]:[\\/]|file:\/{2,3}|\/users\/|\\\\)/i;

export function createExportFilename(title, maxSlugLength = 64) {
  const slug = String(title ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxSlugLength)
    .replace(/-$/g, '') || 'presentacion';
  return `nexus-${slug}.json`;
}

function findLocalResource(document) {
  return (document.resources ?? []).find((resource) =>
    typeof resource?.url === 'string' && localPath.test(resource.url));
}

export function createExportService() {
  let destroyed = false;
  let listeners = new Set();
  let state = {
    status: 'idle',
    diagnostics: [],
    canRetry: false,
    downloaded: false,
    current: false
  };
  const emit = () => {
    if (!destroyed) listeners.forEach((listener) => listener(clone(state)));
  };
  const setState = (status, patch = {}) => {
    state = {
      status,
      diagnostics: [],
      canRetry: ['invalid', 'stale', 'recoverable-error'].includes(status),
      downloaded: false,
      current: status === 'ready',
      ...patch
    };
    emit();
  };
  return {
    getState() {
      return clone(state);
    },
    subscribe(listener) {
      if (destroyed || typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    prepare(draft) {
      if (destroyed) return failure('export-destroyed', 'La exportación ya fue cerrada.');
      createDefaultRegistry();
      setState('validating');
      const source = validateSourcePresentation(draft);
      if (!source.valid) {
        setState('invalid', { diagnostics: clone(source.diagnostics), canRetry: true });
        return { ok: false, diagnostics: clone(source.diagnostics) };
      }
      setState('preparing');
      try {
        const converted = createPublicPresentation(draft);
        if (!converted.valid) {
          setState('invalid', { diagnostics: clone(converted.diagnostics), canRetry: true });
          return { ok: false, diagnostics: clone(converted.diagnostics) };
        }
        const publicCheck = validatePublicPresentation(converted.value);
        if (!publicCheck.valid) {
          setState('invalid', { diagnostics: clone(publicCheck.diagnostics), canRetry: true });
          return { ok: false, diagnostics: clone(publicCheck.diagnostics) };
        }
        const unsafe = findLocalResource(converted.value);
        if (unsafe) {
          const result = failure(
            'local-resource-path',
            'La presentación contiene una ruta local privada que no puede exportarse.',
            { resourceId: unsafe.id }
          );
          setState('invalid', { diagnostics: [result.error], canRetry: true });
          return result;
        }
        const text = `${JSON.stringify(converted.value, null, 2).replace(/\r\n?/g, '\n')}\n`;
        const bytes = new TextEncoder().encode(text);
        const value = clone(converted.value);
        setState('ready');
        return {
          ok: true,
          value,
          text,
          bytes,
          filename: createExportFilename(value.title),
          mime: 'application/json'
        };
      } catch (error) {
        const result = failure('export-prepare-failed', 'No fue posible preparar la exportación.', {
          name: error?.name ?? 'Error'
        });
        setState('recoverable-error', { diagnostics: [result.error], canRetry: true });
        return result;
      }
    },
    markStale() {
      if (destroyed || !['ready', 'stale'].includes(state.status)) return false;
      setState('stale', { canRetry: true, current: false });
      return true;
    },
    destroy() {
      if (destroyed) return;
      state = {
        status: 'destroyed',
        diagnostics: [],
        canRetry: false,
        downloaded: false,
        current: false
      };
      destroyed = true;
      listeners.clear();
    }
  };
}
