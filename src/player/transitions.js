const definitions = Object.freeze({
  cut: { duration: 0, keyframes: [] },
  fade: { duration: 180, keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  slide: {
    duration: 220,
    keyframes: [{ opacity: 0, transform: 'translateX(1rem)' }, { opacity: 1, transform: 'none' }]
  },
  focus: {
    duration: 200,
    keyframes: [{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'scale(1)' }]
  }
});

export function createTransitionRegistry(initial = definitions) {
  const transitions = new Map(Object.entries(initial));
  return {
    get(name) {
      return transitions.get(name) ?? transitions.get('cut');
    },
    register(name, definition) {
      if (!name || transitions.has(name) || !Array.isArray(definition?.keyframes)) return false;
      transitions.set(name, structuredClone(definition));
      return true;
    },
    list() {
      return [...transitions.keys()];
    }
  };
}

export function createTransitionController({
  registry = createTransitionRegistry(),
  windowApi = globalThis.window,
  documentApi = globalThis.document
} = {}) {
  let current = null;
  let destroyed = false;
  const cancel = () => {
    current?.cancel?.();
    current = null;
  };
  const reduced = () => windowApi?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const onVisibility = () => {
    if (documentApi?.hidden) cancel();
  };
  documentApi?.addEventListener?.('visibilitychange', onVisibility);
  return {
    run(element, name = 'fade') {
      if (destroyed) return { applied: 'none' };
      cancel();
      const applied = reduced() || documentApi?.hidden ? 'cut' : name;
      const definition = registry.get(applied);
      if (applied === 'cut' || !definition.duration || !element?.animate) return { applied: 'cut' };
      current = element.animate(definition.keyframes, {
        duration: definition.duration,
        easing: 'ease-out',
        fill: 'none'
      });
      current.finished?.catch?.(() => {}).finally?.(() => {
        current = null;
      });
      return { applied };
    },
    cancel,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancel();
      documentApi?.removeEventListener?.('visibilitychange', onVisibility);
    }
  };
}
