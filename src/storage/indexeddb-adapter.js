const requestResult = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
});

const transactionResult = (transaction) => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  transaction.onerror = () => {};
});

function createStores(database) {
  if (!database.objectStoreNames.contains('drafts')) {
    const drafts = database.createObjectStore('drafts', { keyPath: 'draftKey' });
    drafts.createIndex('updatedAt', 'updatedAt');
    drafts.createIndex('titleIndex', 'titleIndex');
    drafts.createIndex('theme', 'theme');
    drafts.createIndex('status', 'status');
  }
  if (!database.objectStoreNames.contains('recovery')) {
    const recovery = database.createObjectStore('recovery', { keyPath: 'recoveryKey' });
    recovery.createIndex('draftKey', 'draftKey');
    recovery.createIndex('createdAt', 'createdAt');
    recovery.createIndex('draftRevision', ['draftKey', 'revision'], { unique: true });
  }
  if (!database.objectStoreNames.contains('meta')) {
    database.createObjectStore('meta', { keyPath: 'key' });
  }
}

export function createIndexedDbAdapter({
  indexedDBApi = globalThis.indexedDB,
  databaseName = 'nexus-present',
  databaseVersion = 1
} = {}) {
  let database = null;
  let destroyed = false;
  const ensure = () => {
    if (destroyed) throw Object.assign(new Error('Repository destroyed'), { code: 'repository-destroyed' });
    if (!database) throw Object.assign(new Error('Repository unavailable'), { code: 'repository-unavailable' });
  };
  const transaction = (stores, mode = 'readonly') => {
    ensure();
    return database.transaction(stores, mode);
  };
  return {
    async open() {
      if (destroyed) throw Object.assign(new Error('Repository destroyed'), { code: 'repository-destroyed' });
      if (database) return true;
      if (!indexedDBApi?.open) throw Object.assign(new Error('IndexedDB unavailable'), { code: 'indexeddb-unavailable' });
      database = await new Promise((resolve, reject) => {
        const request = indexedDBApi.open(databaseName, databaseVersion);
        request.onupgradeneeded = () => createStores(request.result);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
        request.onblocked = () => reject(Object.assign(new Error('IndexedDB upgrade blocked'), { code: 'upgrade-blocked' }));
      });
      database.onversionchange = () => {
        database.close();
        database = null;
      };
      return true;
    },
    async get(draftKey) {
      const tx = transaction(['drafts']);
      return requestResult(tx.objectStore('drafts').get(draftKey));
    },
    async list() {
      const tx = transaction(['drafts']);
      const records = await requestResult(tx.objectStore('drafts').getAll());
      return records.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async count() {
      const tx = transaction(['drafts']);
      return requestResult(tx.objectStore('drafts').count());
    },
    async write(record, { expectedRevision, createOnly = false, recoveryRecord } = {}) {
      const tx = transaction(['drafts', 'recovery'], 'readwrite');
      const drafts = tx.objectStore('drafts');
      const current = await requestResult(drafts.get(record.draftKey));
      if (createOnly && current) {
        tx.abort();
        throw Object.assign(new Error('Draft already exists'), { code: 'draft-exists' });
      }
      if (!createOnly && (!current || current.revision !== expectedRevision)) {
        tx.abort();
        throw Object.assign(new Error('Revision conflict'), {
          code: 'revision-conflict',
          actualRevision: current?.revision ?? null
        });
      }
      if (recoveryRecord) {
        const recovery = tx.objectStore('recovery');
        recovery.put(recoveryRecord);
        const previous = await requestResult(recovery.index('draftKey').getAll(record.draftKey));
        previous
          .sort((left, right) => right.revision - left.revision)
          .slice(3)
          .forEach((entry) => recovery.delete(entry.recoveryKey));
      }
      drafts.put(record);
      await transactionResult(tx);
      return structuredClone(record);
    },
    async delete(draftKey, expectedRevision) {
      const tx = transaction(['drafts', 'recovery'], 'readwrite');
      const current = await requestResult(tx.objectStore('drafts').get(draftKey));
      if (!current || current.revision !== expectedRevision) {
        tx.abort();
        throw Object.assign(new Error('Revision conflict'), { code: 'revision-conflict' });
      }
      tx.objectStore('drafts').delete(draftKey);
      const index = tx.objectStore('recovery').index('draftKey');
      const keys = await requestResult(index.getAllKeys(draftKey));
      keys.forEach((key) => tx.objectStore('recovery').delete(key));
      await transactionResult(tx);
      return true;
    },
    async clear() {
      const tx = transaction(['drafts', 'recovery'], 'readwrite');
      tx.objectStore('drafts').clear();
      tx.objectStore('recovery').clear();
      await transactionResult(tx);
      return true;
    },
    async listRecovery(draftKey) {
      const tx = transaction(['recovery']);
      const records = await requestResult(tx.objectStore('recovery').index('draftKey').getAll(draftKey));
      return records.sort((left, right) => right.revision - left.revision);
    },
    async bulkCreate(records) {
      const tx = transaction(['drafts'], 'readwrite');
      records.forEach((record) => tx.objectStore('drafts').add(record));
      await transactionResult(tx);
      return records.map(structuredClone);
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
