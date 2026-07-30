import { createDefaultRegistry, validateSourcePresentation } from '../contracts/index.js';

const MAX_DRAFTS = 100;
const MAX_BYTES = 5 * 1024 * 1024;
const clone = (value) => structuredClone(value);
const normalizeTitle = (value) => String(value ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
const failure = (error, fallback = 'repository-error') => ({
  ok: false,
  error: {
    code: error?.code ?? (error?.name === 'QuotaExceededError' ? 'quota-exceeded' : fallback),
    message: {
      'revision-conflict': 'El borrador cambió en otra pestaña.',
      'quota-exceeded': 'No hay espacio local suficiente.',
      'indexeddb-unavailable': 'El almacenamiento local no está disponible.',
      'repository-destroyed': 'El repositorio ya fue cerrado.'
    }[error?.code] ?? 'No fue posible completar la operación local.',
    context: error?.actualRevision === undefined ? {} : { actualRevision: error.actualRevision }
  }
});

function assertSource(sourceDocument) {
  createDefaultRegistry();
  const validation = validateSourcePresentation(sourceDocument);
  if (!validation.valid) {
    const error = Object.assign(new Error('Invalid source document'), {
      code: 'invalid-source-document',
      diagnostics: validation.diagnostics
    });
    throw error;
  }
  const bytes = new TextEncoder().encode(JSON.stringify(sourceDocument)).byteLength;
  if (bytes > MAX_BYTES) throw Object.assign(new Error('Draft too large'), { code: 'draft-too-large' });
}

function recordFrom(sourceDocument, {
  draftKey,
  revision = 1,
  createdAt,
  updatedAt,
  status = 'editable'
}) {
  return {
    draftKey,
    sourceDocument: clone(sourceDocument),
    revision,
    titleIndex: normalizeTitle(sourceDocument.title),
    theme: sourceDocument.theme,
    createdAt,
    updatedAt,
    status,
    schemaVersion: 1
  };
}

export function createDraftRepository({
  adapter,
  createKey = () => globalThis.crypto.randomUUID(),
  now = () => new Date().toISOString()
} = {}) {
  let destroyed = false;
  let listeners = new Set();
  let status = 'closed';
  const emit = (next, context = {}) => {
    status = next;
    if (!destroyed) listeners.forEach((listener) => listener({ status, ...context }));
  };
  const ensure = () => {
    if (destroyed) throw Object.assign(new Error('Repository destroyed'), { code: 'repository-destroyed' });
  };
  const execute = async (operation, busy = 'loading') => {
    try {
      ensure();
      emit(busy);
      const value = await operation();
      emit('ready');
      return { ok: true, value: clone(value) };
    } catch (error) {
      const result = failure(error);
      emit(result.error.code === 'revision-conflict' ? 'conflict' : 'error', result);
      return { ...result, diagnostics: clone(error?.diagnostics ?? []) };
    }
  };
  const updateDraft = (draftKey, sourceDocument, expectedRevision) => execute(async () => {
    assertSource(sourceDocument);
    const current = await adapter.get(draftKey);
    if (!current) throw Object.assign(new Error('Draft missing'), { code: 'draft-not-found' });
    const timestamp = now();
    const record = recordFrom(sourceDocument, {
      draftKey,
      revision: expectedRevision + 1,
      createdAt: current.createdAt,
      updatedAt: timestamp
    });
    const recoveryRecord = {
      recoveryKey: `${draftKey}:${current.revision}`,
      draftKey,
      revision: current.revision,
      sourceDocument: clone(current.sourceDocument),
      createdAt: timestamp,
      schemaVersion: 1
    };
    return adapter.write(record, { expectedRevision, recoveryRecord });
  }, 'saving');
  return {
    getStatus: () => status,
    subscribe(listener) {
      if (destroyed || typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    open: () => execute(async () => {
      await adapter.open();
      return true;
    }, 'opening'),
    get: (draftKey) => execute(async () => {
      const record = await adapter.get(draftKey);
      if (!record) throw Object.assign(new Error('Draft missing'), { code: 'draft-not-found' });
      assertSource(record.sourceDocument);
      return record;
    }),
    list: () => execute(async () => (await adapter.list()).map((record) => ({
      draftKey: record.draftKey,
      title: record.sourceDocument.title,
      revision: record.revision,
      theme: record.theme,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      status: record.status
    }))),
    exists: (draftKey) => execute(async () => Boolean(await adapter.get(draftKey))),
    count: () => execute(() => adapter.count()),
    create: (sourceDocument, { draftKey = createKey() } = {}) => execute(async () => {
      assertSource(sourceDocument);
      if (await adapter.count() >= MAX_DRAFTS) throw Object.assign(new Error('Draft limit'), { code: 'draft-limit' });
      const timestamp = now();
      const record = recordFrom(sourceDocument, { draftKey, createdAt: timestamp, updatedAt: timestamp });
      return adapter.write(record, { createOnly: true });
    }, 'saving'),
    update: updateDraft,
    rename: (draftKey, title, expectedRevision) => execute(async () => {
      const current = await adapter.get(draftKey);
      if (!current) throw Object.assign(new Error('Draft missing'), { code: 'draft-not-found' });
      const source = clone(current.sourceDocument);
      source.title = String(title ?? '').trim();
      source.updatedAt = now();
      assertSource(source);
      const timestamp = now();
      const record = recordFrom(source, {
        draftKey,
        revision: expectedRevision + 1,
        createdAt: current.createdAt,
        updatedAt: timestamp
      });
      const recoveryRecord = {
        recoveryKey: `${draftKey}:${current.revision}`,
        draftKey,
        revision: current.revision,
        sourceDocument: clone(current.sourceDocument),
        createdAt: timestamp,
        schemaVersion: 1
      };
      return adapter.write(record, { expectedRevision, recoveryRecord });
    }, 'saving'),
    duplicate: (draftKey) => execute(async () => {
      const current = await adapter.get(draftKey);
      if (!current) throw Object.assign(new Error('Draft missing'), { code: 'draft-not-found' });
      const source = clone(current.sourceDocument);
      const timestamp = now();
      source.id = `presentation-${createKey()}`.slice(0, 64);
      source.title = `${source.title} (copia)`.slice(0, 120);
      source.createdAt = timestamp;
      source.updatedAt = timestamp;
      assertSource(source);
      const record = recordFrom(source, {
        draftKey: createKey(),
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return adapter.write(record, { createOnly: true });
    }, 'saving'),
    delete: (draftKey, expectedRevision) => execute(
      () => adapter.delete(draftKey, expectedRevision), 'saving'
    ),
    clear: ({ confirmed = false } = {}) => confirmed
      ? execute(() => adapter.clear(), 'saving')
      : Promise.resolve(failure({ code: 'confirmation-required' })),
    listRecovery: (draftKey) => execute(() => adapter.listRecovery(draftKey)),
    restoreRecovery: (draftKey, recoveryRevision, expectedRevision) => execute(async () => {
      const recovery = (await adapter.listRecovery(draftKey))
        .find((entry) => entry.revision === recoveryRevision);
      if (!recovery) throw Object.assign(new Error('Recovery missing'), { code: 'recovery-not-found' });
      const current = await adapter.get(draftKey);
      const record = recordFrom(recovery.sourceDocument, {
        draftKey,
        revision: expectedRevision + 1,
        createdAt: current.createdAt,
        updatedAt: now()
      });
      return adapter.write(record, { expectedRevision });
    }, 'recovering'),
    bulkCreate: (entries) => execute(async () => {
      const timestamp = now();
      const records = entries.map(({ sourceDocument, draftKey = createKey() }) => {
        assertSource(sourceDocument);
        return recordFrom(sourceDocument, { draftKey, createdAt: timestamp, updatedAt: timestamp });
      });
      if ((await adapter.count()) + records.length > MAX_DRAFTS) {
        throw Object.assign(new Error('Draft limit'), { code: 'draft-limit' });
      }
      return adapter.bulkCreate(records);
    }, 'saving'),
    close() {
      adapter.close();
      emit('closed');
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.clear();
      adapter.destroy();
      status = 'destroyed';
    }
  };
}
