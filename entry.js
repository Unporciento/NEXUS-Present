import { NEXUS_VERSION } from './src/version.js';

const version = document.querySelector('[data-nexus-version]');
if (version) version.textContent = NEXUS_VERSION;
