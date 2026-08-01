import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStudioApp } from '../../src/studio/ui.js';
import { createStudioController } from '../../src/studio/controller.js';

function fakeRoot() {
  const listeners = new Map();
  return {
    html: '',
    set innerHTML(value) { this.html = value; },
    get innerHTML() { return this.html; },
    addEventListener(type, fn) {
      const set = listeners.get(type) ?? new Set();
      set.add(fn);
      listeners.set(type, set);
    },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    replaceChildren() { this.html = ''; },
    listenerCount() { return [...listeners.values()].reduce((total, set) => total + set.size, 0); }
  };
}

test('StudioApp mounts preview shell and destroys listeners', () => {
  const root = fakeRoot();
  const controller = createStudioController();
  const app = createStudioApp(root, { controller, ownsController: false });
  assert.match(root.html, /product-context">Studio/);
  assert.match(root.html, /data-preview/);
  assert.match(root.html, /data-export>Descargar presentación/);
  assert.match(root.html, /Formato JSON/);
  assert.match(root.html, /id="export-status" role="status" aria-live="polite"/);
  assert.match(root.html, /validation-panel/);
  assert.match(root.html, /preview-host/);
  assert.match(root.html, /data-onboarding/);
  assert.match(root.html, /data-help-dialog/);
  assert.match(root.html, /product-version">1\.0/);
  assert.match(root.html, /Volver a Biblioteca/);
  assert.match(root.html, /no se sincronizan/);
  assert.match(root.html, /El borrador se guarda en este navegador/);
  assert.match(root.html, new RegExp(`© ${new Date().getFullYear()} NEXUS`));
  assert.ok(root.listenerCount() > 0);
  app.destroy();
  assert.equal(root.html, '');
  assert.equal(root.listenerCount(), 0);
  app.destroy();
  assert.equal(controller.getState().draft.title, 'Nueva presentación');
});

test('Studio UI declares accessible preview and excludes forbidden capabilities', () => {
  const source = readFileSync(new URL('../../src/studio/ui.js', import.meta.url), 'utf8');
  assert.match(source, /<dialog data-confirm aria-labelledby="confirm-title"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /data-error-path/);
  assert.match(source, /createPreviewBridge/);
  assert.match(source, /previewBridge\.destroy/);
  assert.equal((source.match(/controller\.subscribe\(/g) ?? []).length, 1);
  assert.match(source, /bindStudioExport/);
  assert.match(source, /bindStudioGuidance/);
  assert.match(source, /<label>Diseño/);
  assert.match(source, /layoutLabel\(layout\)/);
  assert.doesNotMatch(source, /Tipo interno:/);
  assert.match(source, /on\('input', '\[data-meta\]'/);
  assert.match(source, /on\('input', '\[data-block\]'/);
  assert.doesNotMatch(source, /window\.confirm|localStorage|sessionStorage|indexedDB|Blob|createObjectURL|fetch\(/);
});
