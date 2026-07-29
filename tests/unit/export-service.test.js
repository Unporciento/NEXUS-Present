import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudioDraft } from '../../src/studio/controller.js';
import {
  createExportFilename,
  createExportService,
  exportStates
} from '../../src/studio/export-service.js';

function draftWithResource(url) {
  const draft = createStudioDraft({ title: 'Mantenimiento Predictivo Komatsu' });
  draft.resources = [{
    id: 'asset-cover',
    type: 'image',
    mime: 'image/png',
    url,
    alt: 'Portada'
  }];
  return draft;
}

test('ExportService creates deterministic valid UTF-8 public JSON', () => {
  const service = createExportService();
  const draft = createStudioDraft({ title: 'Mantenimiento Predictivo Komatsu' });
  draft.presenter = { notes: 'privadas' };
  draft.history = [{ title: 'anterior' }];
  draft.privateData = { token: 'no-exportar' };
  const first = service.prepare(draft);
  const second = service.prepare(draft);
  assert.equal(first.ok, true);
  assert.equal(first.mime, 'application/json');
  assert.equal(first.filename, 'nexus-mantenimiento-predictivo-komatsu.json');
  assert.deepEqual(first.bytes, second.bytes);
  assert.equal(first.text, second.text);
  assert.equal(first.text.endsWith('\n'), true);
  assert.doesNotMatch(first.text, /\r|\t|privadas|anterior|no-exportar/);
  assert.match(first.text, /\n  "id":/);
  assert.notDeepEqual([...first.bytes.slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.deepEqual(JSON.parse(new TextDecoder().decode(first.bytes)), first.value);
  assert.equal(first.value.contractVersion, '1.0.0');
  for (const field of ['presenter', 'editorial', 'history', 'privateData', 'dirty', 'preview']) {
    assert.equal(field in first.value, false);
  }
});

test('ExportService preserves meaningful order and relative resource routes', () => {
  const service = createExportService();
  const draft = draftWithResource('assets/images/portada.png');
  draft.scenes.push(structuredClone(draft.scenes[0]));
  draft.scenes[1].id = 'scene-cover-two';
  draft.scenes[1].blocks[0].id = 'block-cover-two';
  const result = service.prepare(draft);
  assert.equal(result.ok, true);
  assert.equal(result.value.resources[0].url, 'assets/images/portada.png');
  assert.deepEqual(result.value.scenes.map((scene) => scene.id), ['scene-cover', 'scene-cover-two']);
});

test('ExportService rejects invalid drafts and local absolute routes safely', () => {
  const service = createExportService();
  const invalid = createStudioDraft();
  invalid.title = '';
  invalid.scenes = [];
  const failed = service.prepare(invalid);
  assert.equal(failed.ok, false);
  assert.ok(failed.diagnostics.length >= 2);
  assert.equal(service.getState().status, 'invalid');
  const windowsPath = ['C:', 'Users', 'julio', 'secret.png'].join('\\');
  for (const url of [windowsPath, 'file:///C:/secret.png', '/Users/julio/secret.png']) {
    const result = service.prepare(draftWithResource(url));
    assert.equal(result.ok, false);
  }
  assert.doesNotMatch(JSON.stringify(service.getState()), /C:\\Users|file:|\/Users\//);
});

test('Export filename slug is safe, normalized, bounded and has fallback', () => {
  assert.equal(createExportFilename('Árbol Único & Seguro'), 'nexus-arbol-unico-seguro.json');
  assert.equal(createExportFilename('../../ NEXUS: Demo?'), 'nexus-nexus-demo.json');
  assert.equal(createExportFilename(''), 'nexus-presentacion.json');
  const long = createExportFilename('a'.repeat(100));
  assert.equal(long, `nexus-${'a'.repeat(64)}.json`);
  assert.equal(long.includes('/'), false);
});

test('ExportService exposes structured lifecycle and safe destroy', () => {
  const service = createExportService();
  const events = [];
  const stop = service.subscribe((state) => events.push(state.status));
  assert.equal(service.prepare(createStudioDraft()).ok, true);
  assert.equal(service.markStale(), true);
  stop();
  service.destroy();
  service.destroy();
  assert.equal(service.getState().status, 'destroyed');
  const result = service.prepare(createStudioDraft());
  assert.equal(result.error.code, 'export-destroyed');
  assert.ok(events.includes('validating') && events.includes('preparing') && events.includes('ready'));
  assert.deepEqual(exportStates, [
    'idle', 'validating', 'invalid', 'preparing', 'ready',
    'stale', 'recoverable-error', 'destroyed'
  ]);
});
