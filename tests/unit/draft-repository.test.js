import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraftRepository } from '../../src/storage/draft-repository.js';
import { createStudioDraft } from '../../src/studio/controller.js';
import { createMemoryDraftAdapter } from './memory-draft-adapter.js';

function setup(options = {}) {
  let sequence = 0;
  const adapter = createMemoryDraftAdapter(options);
  const repository = createDraftRepository({
    adapter,
    createKey: () => `local-key-${++sequence}`,
    now: () => `2026-07-29T12:00:0${sequence}Z`
  });
  return { adapter, repository };
}

test('DraftRepository creates, reads, lists, renames and counts defensive records', async () => {
  const { repository } = setup();
  assert.equal((await repository.open()).ok, true);
  const source = createStudioDraft();
  const created = await repository.create(source);
  assert.equal(created.value.revision, 1);
  source.title = 'Mutación externa';
  const stored = await repository.get(created.value.draftKey);
  assert.equal(stored.value.sourceDocument.title, 'Nueva presentación');
  const renamed = await repository.rename(created.value.draftKey, 'Renombrada', 1);
  assert.equal(renamed.value.revision, 2);
  assert.equal((await repository.count()).value, 1);
  assert.equal((await repository.list()).value[0].title, 'Renombrada');
});

test('DraftRepository enforces revision conflicts, recovery and transactional deletion', async () => {
  const { repository } = setup();
  await repository.open();
  const created = await repository.create(createStudioDraft());
  const changed = structuredClone(created.value.sourceDocument);
  changed.title = 'Guardada';
  const saved = await repository.update(created.value.draftKey, changed, 1);
  assert.equal(saved.value.revision, 2);
  const conflict = await repository.update(created.value.draftKey, changed, 1);
  assert.equal(conflict.error.code, 'revision-conflict');
  const recovery = await repository.listRecovery(created.value.draftKey);
  assert.equal(recovery.value.length, 1);
  assert.equal(recovery.value[0].sourceDocument.title, 'Nueva presentación');
  assert.equal((await repository.delete(created.value.draftKey, 1)).error.code, 'revision-conflict');
  assert.equal((await repository.delete(created.value.draftKey, 2)).ok, true);
});

test('DraftRepository duplicates identities and requires explicit clear confirmation', async () => {
  const { repository } = setup();
  await repository.open();
  const created = await repository.create(createStudioDraft());
  const duplicated = await repository.duplicate(created.value.draftKey);
  assert.notEqual(duplicated.value.draftKey, created.value.draftKey);
  assert.notEqual(duplicated.value.sourceDocument.id, created.value.sourceDocument.id);
  assert.match(duplicated.value.sourceDocument.title, /copia/);
  assert.equal((await repository.clear()).error.code, 'confirmation-required');
  assert.equal((await repository.clear({ confirmed: true })).ok, true);
  assert.equal((await repository.count()).value, 0);
});

test('DraftRepository reports unavailable, corrupt and destroyed states safely', async () => {
  const unavailable = setup({ unavailable: true }).repository;
  assert.equal((await unavailable.open()).error.code, 'indexeddb-unavailable');
  const { adapter, repository } = setup();
  await repository.open();
  adapter.corrupt('broken', { draftKey: 'broken', sourceDocument: {}, revision: 1 });
  assert.equal((await repository.get('broken')).error.code, 'invalid-source-document');
  repository.destroy();
  repository.destroy();
  assert.equal((await repository.count()).error.code, 'repository-destroyed');
});
