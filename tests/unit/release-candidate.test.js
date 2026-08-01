import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENGINE_VERSION, NEXUS_VERSION, PACKAGE_FORMAT_VERSION } from '../../src/version.js';
import { createPackageExportService } from '../../src/package/package-export-service.js';
import { demoPresentation } from '../../demo/public-demo.js';

test('release version is centralized and package format stays compatible', async () => {
  assert.equal(NEXUS_VERSION, '1.0.0');
  assert.equal(ENGINE_VERSION, NEXUS_VERSION);
  assert.equal(PACKAGE_FORMAT_VERSION, '1.0.0');
  const draft = structuredClone(demoPresentation); draft.editorial = { studio: { local: true } };
  const service = createPackageExportService({ assetRepository: {}, runtimeProvider: { collect: async () => [] } });
  const result = await service.prepare(draft, 'draft');
  assert.equal(result.manifest.engineVersion, NEXUS_VERSION);
  assert.equal(result.manifest.packageVersion, PACKAGE_FORMAT_VERSION);
});

test('static build is allowlisted, keeps 404 and contains no deployment command', () => {
  const build = readFileSync(new URL('../../tools/build-static.js', import.meta.url), 'utf8');
  const packageRc = readFileSync(new URL('../../tools/package-release-candidate.js', import.meta.url), 'utf8');
  const notFound = readFileSync(new URL('../../404.html', import.meta.url), 'utf8');
  assert.match(build, /const entries = \[/);
  assert.match(build, /'404\.html'/);
  assert.match(notFound, /Página no encontrada/);
  assert.doesNotMatch(`${build}\n${packageRc}`, /gh\s+pages|npm\s+run\s+deploy|git\s+push|pages:write|force-push/i);
});

test('production sources do not use dynamic code execution', () => {
  const candidates = ['app.js','studio.js','library.js','src/player/player.js','src/ui/player-view.js','src/package/package-import-service.js'];
  for (const path of candidates) {
    const source = readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\beval\s*\(|new\s+Function\s*\(/);
  }
});

test('static build cleans generated contents without removing the dist root', () => {
  const source = readFileSync(new URL('../../tools/build-static.js', import.meta.url), 'utf8');
  assert.match(source, /readdir\(output\)/);
  assert.doesNotMatch(source, /rm\(output,/);
});

test('static build normalizes text files for cross-platform reproducibility', () => {
  const source = readFileSync(new URL('../../tools/build-static.js', import.meta.url), 'utf8');
  assert.match(source, /replaceAll\('\\r\\n', '\\n'\)/);
  assert.match(source, /textExtensions/);
});
