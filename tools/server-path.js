import { join, normalize } from 'node:path';

export function resolveRequestPath(root, requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  return normalize(join(root, pathname === '/' ? 'index.html' : pathname));
}
