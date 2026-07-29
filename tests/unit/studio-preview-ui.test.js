import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../../src/studio/ui.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../../styles.css', import.meta.url), 'utf8');

test('Studio preview UI exposes validation, stale, refresh and close controls', () => {
  for (const expected of [
    'Previsualizar',
    'vista previa está desactualizada',
    'data-refresh-preview',
    'data-close-preview',
    'data-error-path',
    'preview-host'
  ]) assert.match(ui, new RegExp(expected));
});

test('Studio preview UI provides responsive edit and preview modes with focus', () => {
  assert.match(ui, /data-show-edit/);
  assert.match(ui, /data-show-preview/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(ui, /tabindex="-1"/);
  assert.match(styles, /data-studio-view=preview/);
  assert.match(styles, /@media \(max-width: 800px\)/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /preview-host:focus-visible/);
});

test('Studio preview remains free of download, storage and publication internals', () => {
  assert.doesNotMatch(ui, /localStorage|sessionStorage|indexedDB|Blob|URL\.createObjectURL|fetch\(/);
  assert.doesNotMatch(ui, /GitHub|ServiceWorker|navigator\.storage/);
});
