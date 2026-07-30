import { createStudioController } from './src/studio/controller.js';
import { createPersistenceSession } from './src/studio/persistence-session.js';
import { bindPersistenceUi } from './src/studio/persistence-ui.js';
import { createStudioApp } from './src/studio/ui.js';
import { createBrowserDraftRepository } from './src/storage/browser-repository.js';
import { createBrowserAssetRepository } from './src/storage/browser-asset-repository.js';
import { bindStudioAssets } from './src/studio/assets-ui.js';
import { createPreviewBridge } from './src/studio/preview-bridge.js';
import { createResourceManager } from './src/media/resource-manager.js';

async function boot() {
  const root = document.querySelector('#app');
  const repository = createBrowserDraftRepository();
  const assetRepository = createBrowserAssetRepository();
  const opened = await repository.open();
  await assetRepository.open();
  const draftKey = new URL(location.href).searchParams.get('draft');
  const stored = opened.ok && draftKey ? await repository.get(draftKey) : null;
  const controller = createStudioController({
    ...(stored?.ok ? { draft: stored.value.sourceDocument } : {})
  });
  let session;
  const previewBridge = createPreviewBridge({
    resourceManagerFactory: () => createResourceManager({
      repository: assetRepository,
      draftKey: session?.getState().draftKey
    })
  });
  const app = createStudioApp(root, { controller, ownsController: false, previewBridge });
  const channel = typeof BroadcastChannel === 'function'
    ? new BroadcastChannel('nexus-drafts')
    : null;
  session = createPersistenceSession({
    controller,
    repository,
    draftKey: stored?.ok ? stored.value.draftKey : null,
    revision: stored?.ok ? stored.value.revision : 0,
    channel
  });
  const persistence = bindPersistenceUi(root, session);
  const assets = bindStudioAssets(root, {
    controller,
    repository: assetRepository,
    getDraftKey: () => session.getState().draftKey
  });
  addEventListener('pagehide', () => {
    assets.destroy();
    persistence.destroy();
    app.destroy();
    previewBridge.destroy();
    controller.destroy();
    assetRepository.destroy();
    repository.destroy();
  }, { once: true });
}

boot();
