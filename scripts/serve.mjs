import http from 'node:http';
import { readFile } from 'node:fs/promises';
const port = Number(process.env.PORT || 4173);
http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  const file = { '/': 'index.html', '/index.html': 'index.html', '/color.html': 'color.html' }[req.url?.split('?')[0]];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(await readFile(new URL('../' + file, import.meta.url))); }
  catch { res.writeHead(503); res.end('Run npm run build first.'); }
}).listen(port, '127.0.0.1', () => console.log(`Holos: http://127.0.0.1:${port}`));
