import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productFooter, productHeader } from '../../src/ui/app-shell.js';

test('shared shell exposes one product identity, context and relative navigation', () => {
  const html = productHeader({ context: 'Studio', description: 'Descripción', actions: '<a href="library.html">Biblioteca</a>' });
  assert.match(html, /product-header/);
  assert.match(html, /NEXUS/);
  assert.match(html, /Studio/);
  assert.match(html, /1\.0/);
  assert.match(html, /href="library\.html"/);
  assert.doesNotMatch(html, /https?:\/\//);
  assert.match(productFooter(), /Todos los derechos reservados/);
});

test('application shell stays separate from presentation themes', () => {
  const studio = readFileSync(new URL('../../src/studio/ui.js', import.meta.url), 'utf8');
  const appCss = readFileSync(new URL('../../app-shell.css', import.meta.url), 'utf8');
  assert.doesNotMatch(studio, /applyTheme\(root/);
  assert.match(appCss, /\.app-surface/);
  assert.match(appCss, /--app-bg/);
  assert.match(appCss, /\.product-identity:focus-visible/);
});

test('application palette separates primary, editorial and semantic colors', () => {
  const appCss = readFileSync(new URL('../../app-shell.css', import.meta.url), 'utf8');
  for (const token of ['--app-accent','--app-highlight','--app-success','--app-warning','--app-danger']) {
    assert.match(appCss, new RegExp(`${token}:`));
  }
  assert.match(appCss, /\.primary-action[\s\S]*background:\s*var\(--app-accent\)/);
  assert.match(appCss, /\.validation-error[\s\S]*var\(--app-danger\)/);
});

test('public entry opens the Library and standalone Player has its own route', () => {
  const entry = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const player = readFileSync(new URL('../../player.html', import.meta.url), 'utf8');
  assert.match(entry, /href="library\.html"/);
  assert.match(entry, /Abrir NEXUS/);
  assert.match(player, /src="app\.js"/);
});

test('public HTML applies the static security policy and centralizes the visible version', () => {
  for (const file of ['index.html', 'library.html', 'studio.html', 'player.html', '404.html']) {
    const html = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /object-src 'none'/);
  }
  const entry = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  assert.match(entry, /data-nexus-version/);
  assert.doesNotMatch(entry, />1\.0\.0</);
});
