const clone = (value) => structuredClone(value);

export function createMemoryDraftAdapter({ unavailable = false } = {}) {
  const drafts = new Map();
  const recovery = new Map();
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
    async get(key) { ensure(); return clone(drafts.get(key)); },
    async list() {
      ensure();
      return [...drafts.values()].map(clone)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async count() { ensure(); return drafts.size; },
    async write(record, { expectedRevision, createOnly, recoveryRecord } = {}) {
      ensure();
      const current = drafts.get(record.draftKey);
      if (createOnly && current) throw Object.assign(new Error('exists'), { code: 'draft-exists' });
      if (!createOnly && (!current || current.revision !== expectedRevision)) {
        throw Object.assign(new Error('conflict'), {
          code: 'revision-conflict',
          actualRevision: current?.revision ?? null
        });
      }
      if (recoveryRecord) {
        recovery.set(recoveryRecord.recoveryKey, clone(recoveryRecord));
        [...recovery.values()]
          .filter((item) => item.draftKey === record.draftKey)
          .sort((left, right) => right.revision - left.revision)
          .slice(3)
          .forEach((item) => recovery.delete(item.recoveryKey));
      }
      drafts.set(record.draftKey, clone(record));
      return clone(record);
    },
    async delete(key, expectedRevision) {
      ensure();
      const current = drafts.get(key);
      if (!current || current.revision !== expectedRevision) {
        throw Object.assign(new Error('conflict'), { code: 'revision-conflict' });
      }
      drafts.delete(key);
      [...recovery.entries()].filter(([, item]) => item.draftKey === key)
        .forEach(([recoveryKey]) => recovery.delete(recoveryKey));
      return true;
    },
    async clear() { ensure(); drafts.clear(); recovery.clear(); return true; },
    async listRecovery(key) {
      ensure();
      return [...recovery.values()].filter((item) => item.draftKey === key)
        .sort((left, right) => right.revision - left.revision).map(clone);
    },
    async bulkCreate(records) {
      ensure();
      if (records.some((item) => drafts.has(item.draftKey))) {
        throw Object.assign(new Error('exists'), { code: 'draft-exists' });
      }
      records.forEach((item) => drafts.set(item.draftKey, clone(item)));
      return records.map(clone);
    },
    close() { opened = false; },
    destroy() { destroyed = true; opened = false; drafts.clear(); recovery.clear(); },
    corrupt(key, value) { drafts.set(key, clone(value)); }
  };
}
