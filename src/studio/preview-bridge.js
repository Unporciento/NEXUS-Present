import {
  createDefaultRegistry,
  createPublicPresentation,
  validateSourcePresentation,
  validatePublicPresentation
} from '../contracts/index.js';
import { bindKeyboard } from '../input/keyboard.js';
import { bindTouch } from '../input/touch.js';
import { createPlayer } from '../player/player.js';
import { createRendererRegistry, createVisualRenderers } from '../player/renderers.js';
import { createPlayerView } from '../ui/player-view.js';

export const previewStates = Object.freeze([
  'idle',
  'validating',
  'invalid',
  'transforming',
  'rendering',
  'ready',
  'stale',
  'recoverable-error',
  'fatal-error',
  'destroyed'
]);

const clone = (value) => structuredClone(value);
const previewError = (code, message, context = {}) => ({
  code,
  path: '',
  message,
  severity: 'error',
  context
});

export function createPreviewBridge({
  playerFactory = createPlayer,
  rendererFactory = createVisualRenderers,
  viewFactory = createPlayerView,
  keyboardBinder = bindKeyboard,
  touchBinder = bindTouch
} = {}) {
  let active = null;
  let destroyed = false;
  let listeners = new Set();
  let state = {
    status: 'idle',
    diagnostics: [],
    canPreview: true,
    canRetry: false,
    current: false
  };

  const emit = () => {
    if (!destroyed) listeners.forEach((listener) => listener(clone(state)));
  };
  const setState = (status, patch = {}) => {
    state = {
      status,
      diagnostics: [],
      canPreview: ['idle', 'invalid', 'stale', 'recoverable-error'].includes(status),
      canRetry: ['invalid', 'stale', 'recoverable-error'].includes(status),
      current: status === 'ready',
      ...patch
    };
    emit();
  };
  const release = () => {
    if (!active) return [];
    const errors = [];
    try {
      active.player.destroy();
    } catch (error) {
      errors.push(previewError('preview-destroy-failed', 'No fue posible liberar completamente la vista previa.', {
        name: error?.name ?? 'Error'
      }));
    }
    active = null;
    return errors;
  };

  const api = {
    getState() {
      return clone(state);
    },
    getPublicDocument() {
      return active ? clone(active.publicDocument) : null;
    },
    getPlayer() {
      return active?.player ?? null;
    },
    subscribe(listener) {
      if (destroyed || typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    preview(draft, container) {
      if (destroyed) {
        return { ok: false, error: previewError('preview-destroyed', 'La vista previa ya fue cerrada definitivamente.') };
      }
      release();
      createDefaultRegistry();
      setState('validating');
      const source = validateSourcePresentation(draft);
      if (!source.valid) {
        setState('invalid', { diagnostics: clone(source.diagnostics), canPreview: false, canRetry: true });
        return { ok: false, diagnostics: clone(source.diagnostics) };
      }
      setState('transforming');
      let converted;
      try {
        converted = createPublicPresentation(draft);
      } catch (error) {
        const diagnostic = previewError('preview-transform-failed', 'No fue posible preparar una copia pública segura.', {
          name: error?.name ?? 'Error'
        });
        setState(error?.fatal ? 'fatal-error' : 'recoverable-error', {
          diagnostics: [diagnostic],
          canPreview: !error?.fatal,
          canRetry: !error?.fatal
        });
        return { ok: false, error: diagnostic };
      }
      if (!converted.valid) {
        setState('invalid', { diagnostics: clone(converted.diagnostics), canPreview: false, canRetry: true });
        return { ok: false, diagnostics: clone(converted.diagnostics) };
      }
      const publicCheck = validatePublicPresentation(converted.value);
      if (!publicCheck.valid) {
        setState('invalid', { diagnostics: clone(publicCheck.diagnostics), canPreview: false, canRetry: true });
        return { ok: false, diagnostics: clone(publicCheck.diagnostics) };
      }
      if (!container?.querySelector || !container?.addEventListener) {
        const diagnostic = previewError('preview-container-missing', 'No existe un área disponible para mostrar la vista previa.');
        setState('fatal-error', { diagnostics: [diagnostic], canPreview: false, canRetry: false });
        return { ok: false, error: diagnostic };
      }
      setState('rendering');
      try {
        const player = playerFactory();
        const renderers = createRendererRegistry();
        rendererFactory().forEach((renderer) => renderers.register(renderer));
        viewFactory(container, { player, renderers, theme: converted.value.theme });
        const loaded = player.loadPresentation(converted.value);
        if (!loaded.valid || !player.start()) throw new Error('Player rejected the public document.');
        player.addCleanup(keyboardBinder(container, player));
        player.addCleanup(touchBinder(container, player));
        active = { player, publicDocument: clone(converted.value) };
        setState('ready');
        return { ok: true, value: clone(converted.value) };
      } catch (error) {
        release();
        const diagnostic = previewError('preview-render-failed', 'No fue posible iniciar la vista previa. Puedes intentarlo nuevamente.', {
          name: error?.name ?? 'Error'
        });
        setState(error?.fatal ? 'fatal-error' : 'recoverable-error', {
          diagnostics: [diagnostic],
          canPreview: !error?.fatal,
          canRetry: !error?.fatal
        });
        return { ok: false, error: diagnostic };
      }
    },
    markStale() {
      if (destroyed || !['ready', 'stale'].includes(state.status)) return false;
      setState('stale', { canPreview: true, canRetry: true, current: false });
      return true;
    },
    close() {
      if (destroyed) return false;
      const errors = release();
      setState(errors.length ? 'recoverable-error' : 'idle', {
        diagnostics: errors,
        canPreview: true,
        canRetry: errors.length > 0
      });
      return errors.length === 0;
    },
    destroy() {
      if (destroyed) return;
      release();
      state = {
        status: 'destroyed',
        diagnostics: [],
        canPreview: false,
        canRetry: false,
        current: false
      };
      destroyed = true;
      listeners.clear();
    }
  };
  return api;
}
