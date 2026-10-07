import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createApplication } from '../src/server/app.js';
import type { ServerMessage, SessionContext } from '../src/contracts/lobby.js';

test('actual HTTP and WebSocket flow: two cookie contexts, third rejection, isolation, takeover, leave', async t => {
  const app = await createApplication(); t.after(() => app.close());
  async function post(path: string, value: unknown, cookie?: string, origin = app.origin) {
    const response = await fetch(app.origin + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(value) });
    const data = await response.json() as { ok: boolean; error?: string; context: SessionContext };
    return { response, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  const a = await post('/api/session', {}), b = await post('/api/session', {}), c = await post('/api/session', {});
  assert.equal(a.response.status, 200); assert.match(a.response.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict/);
  assert.notEqual(a.cookie, b.cookie);
  const payload = { requestId: 'create_001', expectedContextVersion: 0 };
  const made = await post('/api/rooms', payload, a.cookie);
  const code = made.data.context.view!.room.code;
  assert.equal((await post('/api/rooms', payload, a.cookie)).data.context.view!.room.id, made.data.context.view!.room.id);
  const joins = await Promise.all([b, c].map((user, i) => post('/api/rooms/join', { requestId: `join_000${i}`, expectedContextVersion: 0, code }, user.cookie)));
  assert.equal(joins.filter(r => r.data.ok).length, 1); assert.equal(joins.filter(r => r.data.error === 'ROOM_FULL').length, 1);
  const second = joins[0]!.data.ok ? b : c;
  const unseated = joins[0]!.data.ok ? c : b;
  assert.equal((await post('/api/rooms', { requestId: 'wrongorg1', expectedContextVersion: 0 }, unseated.cookie, 'https://evil.example')).response.status, 403);
  assert.equal((await fetch(app.origin + '/api/session', { headers: { Cookie: `sr_dev_session=${code}` } })).status, 401);
  for (const path of ['/src/server/store.ts', '/research/signal_rescue_rules.py', '/content/mission.json', '/../docs/decisions.md']) assert.equal((await fetch(app.origin + path)).status, 404);
  assert.equal((await fetch(app.origin + '/')).status, 200);
  const js = await fetch(app.origin + '/client.js'); assert.equal(js.status, 200); assert.match(await js.text(), /STALE_PLAN/);
  assert.equal((await post('/api/rooms', { requestId: 'oversize1', expectedContextVersion: 0, pad: 'x'.repeat(9000) }, unseated.cookie)).response.status, 413);

  function connect(cookie: string, origin = app.origin) {
    const ws = new WebSocket(app.origin.replace('http', 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
    const queue: ServerMessage[] = []; const waiting: ((m: ServerMessage) => void)[] = [];
    ws.on('message', raw => { const m = JSON.parse(raw.toString()) as ServerMessage; const waiter = waiting.shift(); if (waiter) waiter(m); else queue.push(m); });
    ws.on('error', () => {});
    const next = (): Promise<ServerMessage> => queue.length ? Promise.resolve(queue.shift()!) : new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Snapshot timeout')), 2000);
      waiting.push(m => { clearTimeout(timeout); resolve(m); });
    });
    t.after(() => ws.terminate()); return { ws, next };
  }
  const one = connect(a.cookie!), two = connect(second.cookie!);
  const initial = await one.next(); assert.equal(initial.type, 'snapshot');
  const paired = await two.next(); assert.equal(paired.type, 'snapshot');
  if (paired.type !== 'snapshot' || initial.type !== 'snapshot') throw new Error('Expected views');
  assert.equal(paired.context.view!.self.role, 'B'); assert.ok(paired.context.view!.room.players.every(p => p.connected));
  assert.notEqual(paired.context.view!.self.role, initial.context.view!.self.role);
  await one.next(); // Partner connection update.
  const duplicate = connect(a.cookie!);
  const rejected = await new Promise<number>(resolve => duplicate.ws.once('unexpected-response', (_req, response) => { response.resume(); resolve(response.statusCode!); }));
  assert.equal(rejected, 409);
  const forbidden = connect(unseated.cookie!, 'https://evil.example');
  assert.equal(await new Promise<number>(resolve => forbidden.ws.once('unexpected-response', (_req, response) => { response.resume(); resolve(response.statusCode!); })), 403);
  one.ws.send(JSON.stringify({ type: 'command', action: 'leave', requestId: 'crossroom1', sequence: 1, roomId: 'wrong', controllerEpoch: initial.context.view!.self.controllerEpoch }));
  const denied = await one.next(); assert.equal(denied.type, 'error'); if (denied.type === 'error') assert.equal(denied.error, 'NOT_AUTHORIZED');
  const takeover = await post('/api/controller/takeover', { requestId: 'take_0001', expectedContextVersion: 1 }, a.cookie);
  assert.equal(takeover.response.status, 200);
  const replaced = connect(a.cookie!); const current = await replaced.next(); assert.equal(current.type, 'snapshot');
  if (current.type !== 'snapshot') throw new Error('Expected snapshot');
  assert.ok(current.context.view!.self.controllerEpoch > initial.context.view!.self.controllerEpoch);
  replaced.ws.send(JSON.stringify({ type: 'command', action: 'leave', requestId: 'leave_001', sequence: 1, roomId: current.context.view!.room.id, controllerEpoch: current.context.view!.self.controllerEpoch }));
  const ack = await replaced.next(); assert.equal(ack.type, 'ack');
  const ended = await replaced.next(); assert.equal(ended.type, 'snapshot'); if (ended.type === 'snapshot') assert.equal(ended.context.view, null);
  const remaining = await fetch(app.origin + '/api/session', { headers: { Cookie: second.cookie! } });
  const remainingData = await remaining.json() as { context: SessionContext };
  assert.equal(remainingData.context.view!.room.owner, 'B');
});

test('oversized WebSocket frame closes without mutating a seat', async t => {
  const app = await createApplication(); t.after(() => app.close());
  const bootstrap = await fetch(app.origin + '/api/session', { method: 'POST', headers: { Origin: app.origin, 'Content-Type': 'application/json' }, body: '{}' });
  const cookie = bootstrap.headers.get('set-cookie')!.split(';')[0]!;
  await fetch(app.origin + '/api/rooms', { method: 'POST', headers: { Cookie: cookie, Origin: app.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: 'create_001', expectedContextVersion: 0 }) });
  const ws = new WebSocket(app.origin.replace('http', 'ws') + '/ws', { headers: { Cookie: cookie, Origin: app.origin } });
  ws.on('error', () => {}); t.after(() => ws.terminate());
  await new Promise<void>(resolve => ws.once('message', () => resolve()));
  const closed = new Promise<number>(resolve => ws.once('close', code => resolve(code)));
  ws.send('x'.repeat(9000)); assert.equal(await closed, 1009);
  const response = await fetch(app.origin + '/api/session', { headers: { Cookie: cookie } });
  const { context } = await response.json() as { context: SessionContext };
  assert.equal(context.view!.self.nextCommandSequence, 1); assert.equal(context.view!.room.phase, 'paused');
});

test('insecure public startup is rejected', async () => {
  await assert.rejects(createApplication({ host: '0.0.0.0' }), /HTTPS/);
});
