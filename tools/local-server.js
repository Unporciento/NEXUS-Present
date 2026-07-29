import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = createServer((request, response) => {
  const path = normalize(join(root, request.url === '/' ? 'index.html' : request.url));
  if (!path.startsWith(root)) return response.writeHead(403).end();
  try {
    if (!statSync(path).isFile()) return response.writeHead(404).end();
    response.writeHead(200, { 'Content-Type': `${types[extname(path)] ?? 'application/octet-stream'}; charset=utf-8` });
    createReadStream(path).pipe(response);
  } catch { response.writeHead(404).end(); }
});

server.listen(4173, '127.0.0.1', () => console.log('NEXUS local: http://127.0.0.1:4173'));
