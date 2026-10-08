// Development-only wire client for inspecting A's UI when only one browser profile is available.
// Not served, not started by the application, and not a game mode or a human playtest.
import { WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
const code = process.argv[2];
if (!/^[A-Z2-9]{6}$/.test(code ?? '')) throw new Error('Provide a disposable local room code.');
const origin = 'http://127.0.0.1:3000';
async function post(path, payload, cookie) {
  const r = await fetch(origin + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(payload) });
  const data = await r.json(); if (!data.ok) throw new Error(data.error);
  return { data, cookie: r.headers.get('set-cookie')?.split(';')[0] };
}
const session = await post('/api/session', {});
await post('/api/rooms/join', { requestId: randomUUID(), expectedContextVersion: 0, code }, session.cookie);
const ws = new WebSocket(origin.replace('http', 'ws') + '/ws', { headers: { Origin: origin, Cookie: session.cookie } });
let view, pending, missionId, step = 0;
// Optional scripted UI inspection: B requests, A declines, A cancels, then B agrees.
let restartReview = process.argv[3] === 'restart-review' ? 0 : 5;
function send(action) {
  pending = randomUUID();
  ws.send(JSON.stringify({ type: 'command', requestId: pending, sequence: view.self.nextCommandSequence,
    roomId: view.room.id, controllerEpoch: view.self.controllerEpoch, ...action }));
}
function drive() {
  if (!view || pending || view.room.phase === 'paused') return;
  if (view.room.phase === 'waiting') {
    if (view.room.players.length === 2 && view.room.players.every(p => p.connected) && !view.room.startAgreements.B) send({ action: 'startAgreement', lobbyRevision: view.room.lobbyRevision });
    return;
  }
  const m = view.mission;
  if (missionId !== m.id) { missionId = m.id; step = 0; }
  if (view.room.phase === 'planning' && m.foundry?.movement === 'independent' && restartReview < 5) {
    const requested = view.restart.requestedBy;
    if (restartReview === 0 && m.positions.A === 1) {
      restartReview = 1; send({action:'restartAgreement',missionId:m.id,restartRevision:view.restart.revision});return;
    }
    if (restartReview === 1 && requested === null) restartReview = 2;
    if (restartReview === 2 && requested === 'A') restartReview = 3;
    if (restartReview === 3 && requested === null) restartReview = 4;
    if (restartReview === 4 && requested === 'A') {
      restartReview = 5; send({action:'restartAgreement',missionId:m.id,restartRevision:view.restart.revision});return;
    }
  }
  if (view.room.phase === 'terminal') {
    if (m.foundry?.choices.A === 'next' && m.foundry.choices.B !== 'next') send({ action: 'nextAgreement', missionId: m.id });
    else if (m.retryAgreements.A && !m.retryAgreements.B) send({ action: 'retryAgreement', missionId: m.id });
    return;
  }
  const base = { missionId: m.id, turn: m.turn, planningRevision: m.planningRevision };
  if (m.foundry?.movement === 'independent') {
    const from = m.positions.B;
    if (m.foundry.stage === 3) {
      const route = [{cell:9},{cell:8},{cell:3},{cell:2,a:6},{cell:1},{cell:0},{cell:1,cargo:8},{cell:6,cargo:8},{cell:11,cargo:8},{cell:10,cargo:8}];
      while (route[step]?.cell === from) step++;
      const target = route[step];
      if (target && (target.a === undefined || m.positions.A === target.a)
          && (target.cargo === undefined || m.foundry.crate.cell === target.cargo)) {
        send({ action: 'crateMove', missionId: m.id, from, crateFrom: m.foundry.crate.cell, destination: target.cell, kind: 'move' });
      }
      return;
    }
    if (m.foundry.stage === 2) {
      const route = [{cell:13},{cell:8,a:6},{cell:13,a:12},{cell:14,a:12},{cell:13,a:8},{cell:12,a:8},{cell:11,a:8},{cell:10,a:3}];
      while (route[step]?.cell === from) step++;
      const target = route[step];
      if (target && (target.a === undefined || m.positions.A === target.a || (target.a === 3 && m.positions.A === 4))) send({ action: 'move', missionId: m.id, from, destination: target.cell });
      return;
    }
    const gate = m.foundry.gates.find(g => g.cell === from + 1);
    if (from < m.exits.B && (!gate || gate.open)) send({ action: 'move', missionId: m.id, from, destination: from + 1 });
    return;
  }
  const foundry = m.ruleVersion === 'SF-T1-v2';
  if (!foundry && m.turn <= 2 && !m.signals.B) { send({ ...base, action: 'signal', cell: m.turn === 1 ? 1 : 7 }); return; }
  const a = (foundry ? [1,2,2,2,3] : [3,3,0,0,3,4,5])[m.turn - 1];
  const b = (foundry ? [8,8,9,10,11] : [5,5,4,3,6,3,3])[m.turn - 1];
  if (b === undefined) return;
  if (m.proposals.B !== b) { send({ ...base, action: 'propose', destination: b }); return; }
  if (m.ready.A && !m.ready.B && m.proposals.A === a) send({ ...base, action: 'ready' });
}
ws.on('message', raw => {
  const m = JSON.parse(raw.toString());
  if (m.type === 'ack' && m.requestId === pending) { pending = undefined; if (!m.ok) console.log('Test command rejected:', m.error); }
  if (m.type === 'snapshot') { view = m.context.view; drive(); }
});
ws.on('open', () => console.log(`Development test partner joined ${code}; no human participation is claimed.`));
ws.on('error', error => console.log('Test connection ended:', error.message));
ws.on('close', () => process.exit(0));
setTimeout(() => { ws.close(); }, 600_000).unref();
