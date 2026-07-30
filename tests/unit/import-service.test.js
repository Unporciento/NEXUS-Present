import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRegistry, createPublicPresentation } from '../../src/contracts/index.js';
import { createImportService } from '../../src/import/import-service.js';
import { createPublicToSourceConverter } from '../../src/import/public-to-source.js';
import { createStudioDraft } from '../../src/studio/controller.js';

const publicDocument = () => {
  createDefaultRegistry();
  return createPublicPresentation(createStudioDraft()).value;
};
const file = (value, name = 'presentacion.json', type = 'application/json') =>
  new File([typeof value === 'string' ? value : JSON.stringify(value)], name, { type });

test('ImportService imports current NEXUS public JSON and isolates its Source', async () => {
  const keys = ['draft-local'];
  const converter = createPublicToSourceConverter({
    createKey: () => keys.shift(),
    now: () => '2026-07-29T12:00:00Z'
  });
  const service = createImportService({ converter });
  const original = publicDocument();
  const imported = await service.importFile(file(`\uFEFF${JSON.stringify(original)}`));
  assert.equal(imported.ok, true);
  assert.equal(imported.draftKey, 'draft-local');
  assert.equal(imported.sourceDocument.id, original.id);
  assert.equal(imported.sourceDocument.editorial.studio.origin, 'import');
  imported.sourceDocument.title = 'Cambiado';
  assert.notEqual(original.title, 'Cambiado');
  assert.equal('history' in imported.sourceDocument, false);
});

test('ImportService rejects extension, MIME and size before reading', async () => {
  const service = createImportService();
  assert.equal((await service.importFile(file('{}', 'demo.txt'))).diagnostics[0].code, 'invalid-file-extension');
  assert.equal((await service.importFile(file('{}', 'demo.json', 'text/plain'))).diagnostics[0].code, 'invalid-file-type');
  let reads = 0;
  const huge = { name: 'huge.json', type: 'application/json', size: 6 * 1024 * 1024, async arrayBuffer() { reads += 1; } };
  assert.equal((await service.importFile(huge)).diagnostics[0].code, 'file-too-large');
  assert.equal(reads, 0);
});

test('ImportService blocks dangerous keys, private state, unknown fields and local paths', () => {
  const service = createImportService();
  const dangerous = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.equal(service.prepare(dangerous).diagnostics[0].code, 'dangerous-key');
  const privateValue = { ...publicDocument(), history: [] };
  assert.equal(service.prepare(privateValue).diagnostics[0].code, 'private-field-import');
  const unknown = { ...publicDocument(), surprise: true };
  assert.equal(service.prepare(unknown).diagnostics[0].code, 'unknown-import-field');
  const local = publicDocument();
  local.resources = [{ id: 'asset-one', type: 'image', mime: 'image/png', url: 'file:///C:/private.png', alt: 'Imagen' }];
  assert.equal(service.prepare(local).diagnostics[0].code, 'private-local-path');
  assert.equal({}.polluted, undefined);
});

test('ImportService reports incompatible contracts, invalid JSON and destroy', async () => {
  const service = createImportService();
  const incompatible = publicDocument();
  incompatible.contractVersion = '2.0.0';
  assert.equal(service.prepare(incompatible).diagnostics[0].code, 'contract-version-incompatible');
  assert.equal((await service.importFile(file('{'))).diagnostics[0].code, 'invalid-json');
  service.destroy();
  service.destroy();
  assert.equal((await service.importFile(file('{}'))).diagnostics[0].code, 'import-destroyed');
});
