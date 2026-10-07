import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';
import { admission, Fault, Store, type Channel } from './store.js';
import type { ServerMessage } from '../contracts/lobby.js';

interface Options { store?: Store; origin?: string; host?: string; port?: number }
const cookieName = 'sr_dev_session';
const assets = new Map([
  ['/', ['../../../public/index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['../../../public/styles.css', 'text/css; charset=utf-8']],
  ['/client.js', ['../client/main.js', 'text/javascript; charset=utf-8']]
]);
function token(req: IncomingMessage, name: string): string | undefined {
  return req.headers.cookie?.split(';').map(p => p.trim()).find(p => p.startsWith(`${name}=`))?.slice(name.length + 1);
}
function json(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
async function body(req: IncomingMessage): Promise<unknown> {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new Fault('INVALID_INPUT', 415);
  if (Number(req.headers['content-length']) > 8192) throw new Fault('INVALID_INPUT', 413);
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8192) throw new Fault('INVALID_INPUT', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new Fault('INVALID_INPUT'); }
}
export async function createApplication(options: Options = {}) {
  const store = options.store ?? new Store();
  const host = options.host ?? '127.0.0.1';
  let origin = options.origin ?? '';
  if (origin && new URL(origin).origin !== origin) throw new Error('APP_ORIGIN must be an exact origin.');
  const secure = origin.startsWith('https://');
  if (!secure && (host !== '127.0.0.1' || (origin && new URL(origin).hostname !== '127.0.0.1'))) {
    throw new Error('Non-loopback operation requires an HTTPS APP_ORIGIN.');
  }
  const name = secure ? '__Host-sr_session' : cookieName;
  const setCookie = (res: ServerResponse, capability: string) => res.setHeader('Set-Cookie',
    `${name}=${capability}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200${secure ? '; Secure' : ''}`);
  const staticFiles = new Map<string, { data: Buffer; type: string }>();
  for (const [path, [file, type]] of assets) {
    staticFiles.set(path, { data: await readFile(fileURLToPath(new URL(file!, import.meta.url))), type: type! });
  }
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      const path = req.url ?? '';
      if (req.method === 'GET' && (path === '/health/live' || path === '/health/ready')) {
        json(res, 200, { ok: true, releaseId: store.releaseId, bootId: store.bootId }); return;
      }
      if (req.method === 'GET' && staticFiles.has(path)) {
        const asset = staticFiles.get(path)!;
        res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-store' }); res.end(asset.data); return;
      }
      if (req.method === 'GET' && path === '/api/session') {
        json(res, 200, { ok: true, context: store.context(store.require(token(req, name))) }); return;
      }
      if (req.method !== 'POST' || !['/api/session', '/api/rooms', '/api/rooms/join', '/api/controller/takeover'].includes(path)) {
        json(res, 404, { ok: false, error: 'NOT_FOUND' }); return;
      }
      if (req.headers.origin !== origin) throw new Fault('NOT_AUTHORIZED', 403);
      const input = await body(req);
      const capability = token(req, name);
      if (path === '/api/session') {
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Fault('INVALID_INPUT');
        const result = store.bootstrap(capability);
        if (result.token) setCookie(res, result.token);
        json(res, 200, { ok: true, context: store.context(result.session) }); return;
      }
      const session = store.require(capability);
      const action = path === '/api/rooms' ? 'create' : path === '/api/rooms/join' ? 'join' : 'takeover';
      const context = store.admit(session, admission(input, action === 'join'), action);
      if (action !== 'takeover') setCookie(res, capability!);
      json(res, 200, { ok: true, context });
    } catch (error) {
      const fault = error instanceof Fault ? error : new Fault('SERVER_BUSY', 500);
      if (!res.headersSent) json(res, fault.status, { ok: false, error: fault.code });
      else res.end();
    }
  });
  server.requestTimeout = 10_000; server.headersTimeout = 10_000;
  const wss = new WebSocketServer({ noServer: true, maxPayload: 8192, perMessageDeflate: false });
  const lastPong = new Map<WebSocket, number>();
  server.on('upgrade', (req, socket, head) => {
    try {
      if (req.url !== '/ws' || req.headers.origin !== origin) throw new Fault('NOT_AUTHORIZED', 403);
      const session = store.require(token(req, name)); store.canConnect(session);
      wss.handleUpgrade(req, socket, head, ws => {
        const channel: Channel = {
          send(message: ServerMessage) {
            if (ws.readyState !== WebSocket.OPEN) return;
            if (ws.bufferedAmount > 262_144) { ws.terminate(); return; }
            ws.send(JSON.stringify(message));
          },
          close(code, reason) { ws.close(code, reason); }
        };
        let credit = 20; let last = performance.now();
        lastPong.set(ws, performance.now());
        ws.on('pong', () => lastPong.set(ws, performance.now()));
        ws.on('error', () => { /* Do not log frames or credentials. Close handles lifecycle. */ });
        ws.on('close', () => { lastPong.delete(ws); store.disconnect(session, channel); });
        ws.on('message', (data, binary) => {
          const now = performance.now(); credit = Math.min(20, credit + (now - last) / 100); last = now;
          if (credit < 1) { channel.send({ type: 'error', error: 'RATE_LIMITED' }); ws.close(4008, 'Rate limited'); return; }
          credit--;
          try {
            if (binary) throw new Fault('INVALID_INPUT');
            let input: unknown;
            try { input = JSON.parse(data.toString()); } catch { throw new Fault('INVALID_INPUT'); }
            store.receive(session, channel, input);
          } catch (error) { channel.send({ type: 'error', error: error instanceof Fault ? error.code : 'SERVER_BUSY' }); }
        });
        try { store.connect(session, channel); }
        catch (error) { channel.send({ type: 'error', error: error instanceof Fault ? error.code : 'SERVER_BUSY' }); ws.close(4003, 'Connection rejected'); }
      });
    } catch (error) {
      const fault = error instanceof Fault ? error : new Fault('SERVER_BUSY', 503);
      socket.end(`HTTP/1.1 ${fault.status} Rejected\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
    }
  });
  const timer = setInterval(() => {
    store.sweep();
    for (const [ws, last] of lastPong) {
      if (performance.now() - last >= 30_000) ws.terminate();
      else if (ws.readyState === WebSocket.OPEN) ws.ping();
    }
  }, 15_000);
  timer.unref();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject); server.listen(options.port ?? 0, host, resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No listening address');
  if (!origin) origin = `http://127.0.0.1:${address.port}`;
  return { store, server, origin, async close() {
    clearInterval(timer); store.shutdown();
    for (const ws of lastPong.keys()) ws.terminate();
    await new Promise<void>(resolve => wss.close(() => resolve()));
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  } };
}
