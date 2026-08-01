import { createAssetRepository } from './asset-repository.js';
import { createAssetIndexedDbAdapter } from './asset-indexeddb-adapter.js';

export function createBrowserAssetRepository(options = {}) {
  return createAssetRepository({
    adapter: createAssetIndexedDbAdapter(options),
    ...options
  });
}
