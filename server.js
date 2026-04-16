/**
 * G17 营销美术管理系统 - 局域网服务器
 * 功能：
 *   1. 静态文件服务（局域网可访问）
 *   2. /api/data  GET/POST  — 读写 data.json（实时同步）
 *   3. /api/sync-status     — 当前数据统计
 *   4. SSE /api/events      — 服务端推送，任意客户端修改数据后广播通知其他客户端刷新
 */

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

const PORT      = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ROOT      = __dirname;

// ── SSE 客户端池
const sseClients = new Set();

// ── MIME 类型表
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

// ── 获取本机局域网 IP
function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

// ── 广播 SSE 事件给所有连接的客户端
function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try { res.write(msg); } catch(_) { sseClients.delete(res); }
  }
}

// ── 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // ── CORS & 公共头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API: SSE 实时推送通道
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(`event: connected\ndata: {"msg":"已连接实时同步通道"}\n\n`);
    sseClients.add(res);
    console.log(`[SSE] 新客户端连接，当前 ${sseClients.size} 个连接`);

    // 心跳保活（每 25 秒）
    const hb = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch(_) { clearInterval(hb); }
    }, 25000);

    req.on('close', () => {
      sseClients.delete(res);
      clearInterval(hb);
      console.log(`[SSE] 客户端断开，剩余 ${sseClients.size} 个连接`);
    });
    return;
  }

  // ── API: 读取数据
  if (pathname === '/api/data' && req.method === 'GET') {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(content);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    }
    return;
  }

  // ── API: 保存数据（POST）
  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body); // 校验 JSON 合法性
        const out    = JSON.stringify(parsed, null, 2);
        fs.writeFileSync(DATA_FILE, out, 'utf8');
        const stats = {
          versions:  (parsed.versions  || []).length,
          materials: (parsed.materials || []).length,
          savedAt:   new Date().toLocaleString('zh-CN'),
          from:      req.socket.remoteAddress,
        };
        console.log(`[SAVE] ${stats.savedAt} | ${stats.versions}个版本 ${stats.materials}个素材 | 来自 ${stats.from}`);
        // 广播通知其他客户端
        broadcast('dataUpdated', stats);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ...stats }));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ── API: 同步状态
  if (pathname === '/api/sync-status') {
    let stats = { exists: false };
    if (fs.existsSync(DATA_FILE)) {
      try {
        const d  = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const st = fs.statSync(DATA_FILE);
        stats = {
          exists:    true,
          versions:  (d.versions  || []).length,
          materials: (d.materials || []).length,
          savedAt:   d.savedAt || null,
          fileSize:  (st.size / 1024).toFixed(1) + ' KB',
          clients:   sseClients.size,
        };
      } catch(_) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }

  // ── 静态文件服务
  let filePath = path.join(ROOT, pathname === '/' ? '/login.html' : pathname);
  // 防止目录穿越
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  // 如果是目录，尝试 index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<h2>404 Not Found</h2><p>${pathname}</p>`);
    return;
  }

  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   G17 营销美术管理系统 - 局域网服务器 已启动     ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  本机访问:   http://localhost:${PORT}/login.html       ║`);
  console.log(`║  局域网访问: http://${ip}:${PORT}/login.html  ║`);
  console.log('║                                                  ║');
  console.log('║  把局域网地址发给团队，即可多人实时协作           ║');
  console.log('║  Ctrl+C 停止服务器                               ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
});
