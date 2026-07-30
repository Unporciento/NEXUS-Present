const clone = (value) => structuredClone(value);

export function createMemoryAssetAdapter({ unavailable = false } = {}) {
  const assets = new Map();
  let opened = false;
  let destroyed = false;
  const ensure = () => {
    if (destroyed) throw Object.assign(new Error('destroyed'), { code: 'repository-destroyed' });
    if (!opened) throw Object.assign(new Error('unavailable'), { code: 'repository-unavailable' });
  };
  return {
    async open() {
      if (unavailable) throw Object.assign(new Error('unavailable'), { code: 'indexeddb-unavailable' });
      if (destroyed) throw Object.assign(new Error('destroyed'), { code: 'repository-destroyed' });
      opened = true;
      return true;
    },
    async get(assetId) {
      ensure();
      return clone(assets.get(assetId));
    },
    async list(draftKey) {
      ensure();
      return [...assets.values()].filter((asset) => asset.draftKey === draftKey).map(clone);
    },
    async findByScopeHash(draftKey, hash) {
      ensure();
      return clone([...assets.values()].find((asset) => asset.draftKey === draftKey && asset.hash === hash));
    },
    async write(record, { createOnly = false } = {}) {
      ensure();
      if (createOnly && assets.has(record.assetId)) {
        throw Object.assign(new Error('exists'), { code: 'asset-exists' });
      }
      assets.set(record.assetId, clone(record));
      return clone(record);
    },
    async delete(assetId) {
      ensure();
      assets.delete(assetId);
      return true;
    },
    async bulkDelete(assetIds) {
      ensure();
      assetIds.forEach((assetId) => assets.delete(assetId));
      return assetIds.length;
    },
    close() {
      opened = false;
    },
    destroy() {
      destroyed = true;
      opened = false;
      assets.clear();
    }
  };
}
