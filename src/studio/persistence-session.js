const messages = {
  clean: 'Todos los cambios están guardados.',
  dirty: 'Hay cambios pendientes.',
  saving: 'Guardando en este dispositivo…',
  saved: 'Borrador guardado.',
  conflict: 'Este borrador cambió en otra pestaña.',
  error: 'No fue posible guardar. Tus cambios siguen abiertos.',
  destroyed: 'La sesión de guardado fue cerrada.'
};

export function createPersistenceSession({
  controller,
  repository,
  draftKey = null,
  revision = 0,
  channel = null,
  windowApi = globalThis.window
} = {}) {
  let currentKey = draftKey;
  let currentRevision = revision;
  let destroyed = false;
  let status = controller.getState().dirty ? 'dirty' : 'clean';
  let listeners = new Set();
  const emit = (next) => {
    status = next;
    if (!destroyed) listeners.forEach((listener) => listener({ status, message: messages[status] }));
  };
  const stopController = controller.subscribe((state) => {
    if (state.dirty && !['saving', 'conflict'].includes(status)) emit('dirty');
  });
  const onMessage = (event) => {
    if (event.data?.draftKey === currentKey && event.data.revision > currentRevision) emit('conflict');
  };
  channel?.addEventListener?.('message', onMessage);
  const beforeUnload = (event) => {
    if (!controller.getState().dirty) return;
    event.preventDefault();
    event.returnValue = '';
  };
  windowApi?.addEventListener?.('beforeunload', beforeUnload);
  return {
    getState: () => ({ status, message: messages[status], draftKey: currentKey, revision: currentRevision }),
    subscribe(listener) {
      if (destroyed || typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async save() {
      if (destroyed || status === 'saving') return false;
      emit('saving');
      const source = controller.getState().draft;
      const saved = currentKey
        ? await repository.update(currentKey, source, currentRevision)
        : await repository.create(source);
      if (!saved.ok) {
        emit(saved.error.code === 'revision-conflict' ? 'conflict' : 'error');
        return saved;
      }
      currentKey = saved.value.draftKey;
      currentRevision = saved.value.revision;
      controller.markSaved();
      emit('saved');
      channel?.postMessage?.({ draftKey: currentKey, revision: currentRevision });
      return { ok: true, value: structuredClone(saved.value) };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopController();
      listeners.clear();
      channel?.removeEventListener?.('message', onMessage);
      channel?.close?.();
      windowApi?.removeEventListener?.('beforeunload', beforeUnload);
      status = 'destroyed';
    }
  };
}
