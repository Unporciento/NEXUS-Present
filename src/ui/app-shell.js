import { NEXUS_VERSION } from '../version.js';

const YEAR = new Date().getFullYear();

export function productHeader({ context, description, actions = '', status = '' }) {
  return `<header class="product-header">
    <div class="product-heading">
      <a class="product-identity" href="library.html" aria-label="NEXUS · Biblioteca">
        <span class="product-mark">NEXUS</span>
        <span class="product-context">${context}</span>
        <span class="product-version">${NEXUS_VERSION}</span>
      </a>
      <p class="product-description">${description}</p>
    </div>
    <div class="product-header-side">
      ${status ? `<div class="product-status-area">${status}</div>` : ''}
      <nav class="product-navigation" aria-label="Navegación de NEXUS">${actions}</nav>
    </div>
  </header>`;
}

export function productFooter() {
  return `<footer class="product-footer">
    <p>© ${YEAR} NEXUS. Todos los derechos reservados.</p>
    <p>Crea, organiza y presenta experiencias web estructuradas.</p>
  </footer>`;
}
