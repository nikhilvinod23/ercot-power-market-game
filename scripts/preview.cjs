const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
function start(port = 8765) {
  const root = path.resolve(__dirname, '..');
  const allowed = new Set(['index.html', 'game.js', 'game.css', 'market-model.js', 'learning-guide.js', 'level-lessons.js', 'ui-polish.js']);
  const server = http.createServer((req, res) => {
    const file = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!allowed.has(file)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(path.join(root, file)).pipe(res);
  });
  server.listen(port, '127.0.0.1');
  return server;
}
module.exports = start;
if (require.main === module) { start(); console.log('Game preview: http://127.0.0.1:8765'); }
