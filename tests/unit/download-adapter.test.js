import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserDownloadAdapter } from '../../src/studio/browser-download-adapter.js';

function environment({ failUrl = false } = {}) {
  const calls = { blobs: [], created: [], revoked: [], clicks: 0, appended: 0, removed: 0 };
  class BlobType {
    constructor(parts, options) {
      calls.blobs.push({ parts, options });
    }
  }
  const URLApi = {
    createObjectURL() {
      if (failUrl) throw new Error('blocked');
      const value = `blob:${calls.created.length + 1}`;
      calls.created.push(value);
      return value;
    },
    revokeObjectURL(value) {
      calls.revoked.push(value);
    }
  };
  const documentApi = {
    body: { append() { calls.appended += 1; } },
    createElement() {
      return {
        click() { calls.clicks += 1; },
        remove() { calls.removed += 1; }
      };
    }
  };
  return { calls, BlobType, URLApi, documentApi };
}

test('BrowserDownloadAdapter creates one Blob, click and revoked URL per export', () => {
  const env = environment();
  const adapter = createBrowserDownloadAdapter(env);
  const first = adapter.download({ text: '{}\n', filename: 'nexus-demo.json', mime: 'application/json' });
  const second = adapter.download({ text: '{}\n', filename: 'nexus-demo.json', mime: 'application/json' });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(env.calls.blobs.length, 2);
  assert.equal(env.calls.blobs[0].options.type, 'application/json');
  assert.equal(env.calls.clicks, 2);
  assert.equal(env.calls.appended, 2);
  assert.equal(env.calls.removed, 2);
  assert.deepEqual(env.calls.revoked, env.calls.created);
});

test('BrowserDownloadAdapter returns structured blocked error without leaking data', () => {
  const env = environment({ failUrl: true });
  const adapter = createBrowserDownloadAdapter(env);
  const result = adapter.download({ text: 'private', filename: 'nexus-demo.json' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'download-blocked');
  assert.doesNotMatch(JSON.stringify(result), /private|blocked$/);
  assert.equal(env.calls.clicks, 0);
});

test('BrowserDownloadAdapter double destroy and post-destroy operation are safe', () => {
  const env = environment();
  const adapter = createBrowserDownloadAdapter(env);
  adapter.destroy();
  adapter.destroy();
  const result = adapter.download({ text: '{}', filename: 'nexus-demo.json' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'download-destroyed');
  assert.equal(env.calls.clicks, 0);
});
