import { createLibraryApp } from './src/library/ui.js';
import { createBrowserDraftRepository } from './src/storage/browser-repository.js';
import { createBrowserAssetRepository } from './src/storage/browser-asset-repository.js';
import { createPackageImportService } from './src/package/package-import-service.js';

const repository = createBrowserDraftRepository();
const assetRepository = createBrowserAssetRepository();
await assetRepository.open();
const packageImportService = createPackageImportService({ assetRepository, draftRepository: repository });
const app = createLibraryApp(document.querySelector('#app'), { repository, packageImportService });
addEventListener('pagehide', () => app.destroy(), { once: true });
