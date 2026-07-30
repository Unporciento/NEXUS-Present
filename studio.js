import { createStudioController } from './src/studio/controller.js';
import { createPersistenceSession } from './src/studio/persistence-session.js';
import { bindPersistenceUi } from './src/studio/persistence-ui.js';
import { createStudioApp } from './src/studio/ui.js';
import { createBrowserDraftRepository } from './src/storage/browser-repository.js';

async function boot() {
  const root = document.querySelector('#app');
  const repository = createBrowserDraftRepository();
  const opened = await repository.open();
  const draftKey = new URL(location.href).searchParams.get('draft');
  const stored = opened.ok && draftKey ? await repository.get(draftKey) : null;
  const controller = createStudioController({
    ...(stored?.ok ? { draft: stored.value.sourceDocument } : {})
  });
  const app = createStudioApp(root, { controller, ownsController: false });
  const channel = typeof BroadcastChannel === 'function'
    ? new BroadcastChannel('nexus-drafts')
    : null;
  const session = createPersistenceSession({
    controller,
    repository,
    draftKey: stored?.ok ? stored.value.draftKey : null,
    revision: stored?.ok ? stored.value.revision : 0,
    channel
  });
  const persistence = bindPersistenceUi(root, session);
  addEventListener('pagehide', () => {
    persistence.destroy();
    app.destroy();
    controller.destroy();
    repository.destroy();
  }, { once: true });
}

boot();
