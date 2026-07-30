import { createLibraryApp } from './src/library/ui.js';
import { createBrowserDraftRepository } from './src/storage/browser-repository.js';

const repository = createBrowserDraftRepository();
const app = createLibraryApp(document.querySelector('#app'), { repository });
addEventListener('pagehide', () => app.destroy(), { once: true });
