export const DATABASE_NAME = 'nexus-present';
export const DATABASE_VERSION = 2;

function createDraftStores(database) {
  if (!database.objectStoreNames.contains('drafts')) {
    const drafts = database.createObjectStore('drafts', { keyPath: 'draftKey' });
    drafts.createIndex('updatedAt', 'updatedAt');
    drafts.createIndex('titleIndex', 'titleIndex');
    drafts.createIndex('theme', 'theme');
    drafts.createIndex('status', 'status');
  }
  if (!database.objectStoreNames.contains('recovery')) {
    const recovery = database.createObjectStore('recovery', { keyPath: 'recoveryKey' });
    recovery.createIndex('draftKey', 'draftKey');
    recovery.createIndex('createdAt', 'createdAt');
    recovery.createIndex('draftRevision', ['draftKey', 'revision'], { unique: true });
  }
  if (!database.objectStoreNames.contains('meta')) {
    database.createObjectStore('meta', { keyPath: 'key' });
  }
}

function createAssetStore(database) {
  if (database.objectStoreNames.contains('assets')) return;
  const assets = database.createObjectStore('assets', { keyPath: 'assetId' });
  assets.createIndex('draftKey', 'draftKey');
  assets.createIndex('scopeHash', ['draftKey', 'hash'], { unique: true });
  assets.createIndex('hash', 'hash');
  assets.createIndex('kind', 'kind');
  assets.createIndex('updatedAt', 'updatedAt');
}

export function upgradeDatabase(database) {
  createDraftStores(database);
  createAssetStore(database);
}
