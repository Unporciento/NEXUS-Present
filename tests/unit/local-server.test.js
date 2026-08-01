import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRequestPath } from '../../tools/server-path.js';

test('local server resolves query parameters without treating them as filenames', () => {
  const path = resolveRequestPath('C:\\project', '/studio.html?draft=local-key');
  assert.match(path, /studio\.html$/);
  assert.doesNotMatch(path, /\?/);
});
