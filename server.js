/* 개발용 초간단 정적 서버 (의존성 없음) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = require('path').join(__dirname, 'docs');
const PORT = 8321;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  // 개발 전용: 브라우저 캔버스로 만든 에셋을 assets/ 폴더로 저장
  if (req.method === 'POST' && req.url === '/dev/save-asset') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      try {
        const { name, dataUrl } = JSON.parse(body);
        if (!/^[a-z0-9-]+\.png$/.test(name)) throw new Error('bad name');
        const b64 = String(dataUrl || '').split(',')[1];
        if (!b64) throw new Error('bad data');
        const dir = path.join(__dirname, 'assets');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, name), Buffer.from(b64, 'base64'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('bad request');
      }
    });
    return;
  }
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^([.][.][/\\])+/, ''));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('사주첩 dev server: http://localhost:' + PORT));
