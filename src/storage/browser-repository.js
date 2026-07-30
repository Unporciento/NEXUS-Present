import { createDraftRepository } from './draft-repository.js';
import { createIndexedDbAdapter } from './indexeddb-adapter.js';

export function createBrowserDraftRepository(options = {}) {
  return createDraftRepository({
    adapter: createIndexedDbAdapter(options),
    ...options
  });
}
