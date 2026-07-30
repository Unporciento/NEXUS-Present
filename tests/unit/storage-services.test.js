import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackupService } from '../../src/storage/backup-service.js';
import { createDraftRepository } from '../../src/storage/draft-repository.js';
import { createMigrationRegistry } from '../../src/storage/migration-registry.js';
import { createStudioController, createStudioDraft } from '../../src/studio/controller.js';
import { createPersistenceSession } from '../../src/studio/persistence-session.js';
import { createMemoryDraftAdapter } from './memory-draft-adapter.js';

function repository(sequence = { value: 0 }) {
  const value = createDraftRepository({
    adapter: createMemoryDraftAdapter(),
    createKey: () => `key-${++sequence.value}`,
    now: () => '2026-07-29T12:00:00Z'
  });
  return value;
}

test('BackupService exports deterministic sources and restores copies atomically', async () => {
  const first = repository();
  await first.open();
  await first.create(createStudioDraft());
  const backup = createBackupService({ first, repository: first, now: () => '2026-07-29T12:00:00Z' });
  const exported = await backup.exportAll();
  assert.equal(exported.ok, true);
  assert.equal(exported.value.records.length, 1);
  const second = repository();
  await second.open();
  const restore = createBackupService({ repository: second, createKey: () => 'restored-key' });
  const restored = await restore.restore(exported.value);
  assert.equal(restored.ok, true);
  assert.deepEqual(restored.draftKeys, ['restored-key']);
  assert.equal((await second.count()).value, 1);
});

test('BackupService rejects manipulated backups and invalid sources', async () => {
  const repo = repository();
  await repo.open();
  const service = createBackupService({ repository: repo });
  assert.equal((await service.restore({ backupVersion: '2.0.0' })).error.code, 'backup-version-incompatible');
  const unsafe = JSON.parse('{"backupVersion":"1.0.0","product":"NEXUS Present","records":[],"__proto__":{}}');
  assert.equal((await service.restore(unsafe)).error.code, 'unsafe-backup');
});

test('MigrationRegistry runs deterministic chains without mutating originals', () => {
  const registry = createMigrationRegistry();
  registry.register({
    from: 1,
    to: 2,
    migrate(record) { return { ...record, schemaVersion: 2 }; }
  });
  const original = { schemaVersion: 1, sourceDocument: createStudioDraft() };
  const migrated = registry.migrate(original, 2);
  assert.equal(migrated.ok, true);
  assert.equal(migrated.value.schemaVersion, 2);
  assert.equal(original.schemaVersion, 1);
  assert.equal(registry.migrate(original, 3).error.code, 'migration-unavailable');
});

test('PersistenceSession saves, marks clean, warns on unload and detects conflicts', async () => {
  const repo = repository();
  await repo.open();
  const created = await repo.create(createStudioDraft());
  const controller = createStudioController({ draft: created.value.sourceDocument });
  const windowListeners = new Map();
  const windowApi = {
    addEventListener(type, listener) { windowListeners.set(type, listener); },
    removeEventListener(type) { windowListeners.delete(type); }
  };
  const channelListeners = new Map();
  const channel = {
    sent: [],
    addEventListener(type, listener) { channelListeners.set(type, listener); },
    removeEventListener(type) { channelListeners.delete(type); },
    postMessage(value) { this.sent.push(value); },
    close() {}
  };
  const session = createPersistenceSession({
    controller,
    repository: repo,
    draftKey: created.value.draftKey,
    revision: 1,
    channel,
    windowApi
  });
  controller.dispatch({ type: 'set-metadata', field: 'title', value: 'Editada' });
  const event = { prevented: false, preventDefault() { this.prevented = true; }, returnValue: null };
  windowListeners.get('beforeunload')(event);
  assert.equal(event.prevented, true);
  assert.equal((await session.save()).ok, true);
  assert.equal(controller.getState().dirty, false);
  channelListeners.get('message')({ data: { draftKey: created.value.draftKey, revision: 3 } });
  assert.equal(session.getState().status, 'conflict');
  session.destroy();
  assert.equal(windowListeners.size, 0);
});
