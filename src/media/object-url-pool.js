export function createObjectUrlPool({ urlApi = globalThis.URL } = {}) {
  const entries = new Map();
  let destroyed = false;
  const revoke = (assetId) => {
    const entry = entries.get(assetId);
    if (!entry) return false;
    urlApi.revokeObjectURL(entry.url);
    entries.delete(assetId);
    return true;
  };
  return {
    acquire(asset) {
      if (destroyed) throw Object.assign(new Error('Object URL pool destroyed'), { code: 'object-url-pool-destroyed' });
      const current = entries.get(asset.assetId);
      if (current) {
        current.references += 1;
        return current.url;
      }
      const url = urlApi.createObjectURL(asset.blob);
      entries.set(asset.assetId, { url, references: 1 });
      return url;
    },
    release(assetId) {
      const current = entries.get(assetId);
      if (!current) return false;
      current.references -= 1;
      return current.references <= 0 ? revoke(assetId) : true;
    },
    revoke,
    size() {
      return entries.size;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      [...entries.keys()].forEach(revoke);
    }
  };
}
