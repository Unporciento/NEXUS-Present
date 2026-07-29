export function createEventBus() {
  const listeners = new Map();
  return {
    emit(type, detail = {}) { [...(listeners.get(type) ?? [])].forEach((listener) => listener({ type, detail })); },
    subscribe(type, listener) { const set = listeners.get(type) ?? new Set(); set.add(listener); listeners.set(type, set); return () => set.delete(listener); },
    clear() { listeners.clear(); }
  };
}
