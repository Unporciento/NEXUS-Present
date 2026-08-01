import { DATABASE_NAME, DATABASE_VERSION, upgradeDatabase } from './database-schema.js';

const requestResult = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
});

const transactionResult = (transaction) => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  transaction.onerror = () => {};
});

export function createAssetIndexedDbAdapter({
  indexedDBApi = globalThis.indexedDB,
  databaseName = DATABASE_NAME,
  databaseVersion = DATABASE_VERSION
} = {}) {
  let database = null;
  let destroyed = false;
  const ensure = () => {
    if (destroyed) throw Object.assign(new Error('Asset repository destroyed'), { code: 'repository-destroyed' });
    if (!database) throw Object.assign(new Error('Asset repository unavailable'), { code: 'repository-unavailable' });
  };
  const store = (mode = 'readonly') => {
    ensure();
    return database.transaction(['assets'], mode);
  };
  return {
    async open() {
      if (destroyed) throw Object.assign(new Error('Asset repository destroyed'), { code: 'repository-destroyed' });
      if (database) return true;
      if (!indexedDBApi?.open) {
        throw Object.assign(new Error('IndexedDB unavailable'), { code: 'indexeddb-unavailable' });
      }
      database = await new Promise((resolve, reject) => {
        const request = indexedDBApi.open(databaseName, databaseVersion);
        request.onupgradeneeded = () => upgradeDatabase(request.result);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
        request.onblocked = () => reject(Object.assign(
          new Error('IndexedDB upgrade blocked'),
          { code: 'upgrade-blocked' }
        ));
      });
      database.onversionchange = () => {
        database.close();
        database = null;
      };
      return true;
    },
    async get(assetId) {
      return requestResult(store().objectStore('assets').get(assetId));
    },
    async list(draftKey) {
      const tx = store();
      const records = await requestResult(tx.objectStore('assets').index('draftKey').getAll(draftKey));
      return records.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async findByScopeHash(draftKey, hash) {
      return requestResult(store().objectStore('assets').index('scopeHash').get([draftKey, hash]));
    },
    async write(record, { createOnly = false } = {}) {
      const tx = store('readwrite');
      const assets = tx.objectStore('assets');
      if (createOnly && await requestResult(assets.get(record.assetId))) {
        tx.abort();
        throw Object.assign(new Error('Asset already exists'), { code: 'asset-exists' });
      }
      assets.put(record);
      await transactionResult(tx);
      return structuredClone(record);
    },
    async delete(assetId) {
      const tx = store('readwrite');
      tx.objectStore('assets').delete(assetId);
      await transactionResult(tx);
      return true;
    },
    async bulkDelete(assetIds) {
      const tx = store('readwrite');
      assetIds.forEach((assetId) => tx.objectStore('assets').delete(assetId));
      await transactionResult(tx);
      return assetIds.length;
    },
    close() {
      database?.close();
      database = null;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      database?.close();
      database = null;
    }
  };
}
