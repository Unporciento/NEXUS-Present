import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../../src/library/ui.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../../library.html', import.meta.url), 'utf8');
const studio = readFileSync(new URL('../../studio.js', import.meta.url), 'utf8');

test('Library exposes required local operations without direct IndexedDB access', () => {
  for (const action of ['data-new', 'data-import', 'data-open', 'data-rename', 'data-duplicate', 'data-delete', 'data-backup', 'data-restore']) {
    assert.match(ui, new RegExp(action));
  }
  assert.doesNotMatch(ui, /indexedDB|localStorage|sessionStorage/);
  assert.match(ui, /Eliminar presentación/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(html, /Biblioteca · NEXUS/);
});

test('Studio bootstraps persistence through repository and keeps storage outside UI', () => {
  assert.match(studio, /createBrowserDraftRepository/);
  assert.match(studio, /createPersistenceSession/);
  assert.match(studio, /BroadcastChannel/);
  assert.doesNotMatch(studio, /indexedDB|localStorage/);
});
