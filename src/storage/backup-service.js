import { createDefaultRegistry, validateSourcePresentation } from '../contracts/index.js';

export const BACKUP_VERSION = '1.0.0';
const failure = (code, message, diagnostics = []) => ({
  ok: false,
  error: { code, message },
  diagnostics
});
const dangerous = new Set(['__proto__', 'prototype', 'constructor']);

function inspect(value, depth = 0) {
  if (depth > 64) return false;
  if (!value || typeof value !== 'object') return true;
  return Object.entries(value).every(([key, child]) =>
    !dangerous.has(key) && inspect(child, depth + 1));
}

export function createBackupService({
  repository,
  now = () => new Date().toISOString(),
  createKey = () => globalThis.crypto.randomUUID()
} = {}) {
  return {
    exportSource(sourceDocument) {
      createDefaultRegistry();
      const validation = validateSourcePresentation(sourceDocument);
      if (!validation.valid) return failure('invalid-source', 'El borrador no puede respaldarse.', validation.diagnostics);
      const value = structuredClone(sourceDocument);
      return {
        ok: true,
        value,
        text: `${JSON.stringify(value, null, 2)}\n`,
        mime: 'application/json',
        filename: 'nexus-borrador.json'
      };
    },
    async exportAll() {
      const listed = await repository.list();
      if (!listed.ok) return listed;
      const records = [];
      for (const summary of listed.value) {
        const record = await repository.get(summary.draftKey);
        if (!record.ok) return record;
        records.push({
          draftKey: record.value.draftKey,
          schemaVersion: record.value.schemaVersion,
          revision: record.value.revision,
          sourceDocument: record.value.sourceDocument,
          createdAt: record.value.createdAt,
          updatedAt: record.value.updatedAt
        });
      }
      const value = {
        backupVersion: BACKUP_VERSION,
        product: 'NEXUS Present',
        createdAt: now(),
        records
      };
      const text = `${JSON.stringify(value, null, 2)}\n`;
      if (new TextEncoder().encode(text).byteLength > 50 * 1024 * 1024) {
        return failure('backup-too-large', 'El respaldo supera el límite de 50 MiB.');
      }
      return { ok: true, value, text, mime: 'application/json', filename: 'nexus-respaldo-completo.json' };
    },
    async restore(input) {
      if (!inspect(input)) return failure('unsafe-backup', 'El respaldo contiene claves no permitidas.');
      if (input?.backupVersion !== BACKUP_VERSION || input?.product !== 'NEXUS Present') {
        return failure('backup-version-incompatible', 'El respaldo no es compatible.');
      }
      if (!Array.isArray(input.records) || input.records.length > 100) {
        return failure('invalid-backup-records', 'El respaldo contiene una cantidad no admitida.');
      }
      createDefaultRegistry();
      const entries = [];
      for (const [index, record] of input.records.entries()) {
        const validation = validateSourcePresentation(record?.sourceDocument);
        if (!validation.valid) {
          return failure('invalid-backup-source', `El borrador ${index + 1} no es válido.`, validation.diagnostics);
        }
        entries.push({
          draftKey: createKey(),
          sourceDocument: structuredClone(record.sourceDocument)
        });
      }
      const restored = await repository.bulkCreate(entries);
      return restored.ok
        ? { ok: true, restored: restored.value.length, draftKeys: restored.value.map((item) => item.draftKey) }
        : restored;
    }
  };
}
