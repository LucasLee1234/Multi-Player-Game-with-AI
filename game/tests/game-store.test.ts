import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, type Channel } from '../src/server/store.js';
import type { Command, ServerMessage, Role } from '../src/contracts/lobby.js';
function setup() {
  let now = 0; const store = new Store(() => now);
  const sessions = { A: store.bootstrap().session, B: store.bootstrap().session };
  const initial = store.admit(sessions.A, { requestId: 'create_001', expectedContextVersion: 0 }, 'create');
  store.admit(sessions.B, { requestId: 'join_0001', expectedContextVersion: 0, code: initial.view!.room.code }, 'join');
  const messages = { A: [] as ServerMessage[], B: [] as ServerMessage[] };
  const channels: Record<Role, Channel> = { A: { send: m => messages.A.push(m), close() {} }, B: { send: m => messages.B.push(m), close() {} } };
  store.connect(sessions.A, channels.A); store.connect(sessions.B, channels.B);
  const view = (role: Role = 'A') => store.context(sessions[role]).view!;
  let id = 0;
  function envelope(role: Role, action: Record<string, unknown>): Command {
    const v = view(role);
    return { type: 'command', requestId: `request_${++id}`, sequence: v.self.nextCommandSequence, roomId: v.room.id, controllerEpoch: v.self.controllerEpoch, ...action } as Command;
  }
  function send(role: Role, action: Record<string, unknown>) {
    const cmd = envelope(role, action); store.receive(sessions[role], channels[role], cmd); return cmd;
  }
  function start() { send('A', { action: 'startAgreement', lobbyRevision: view().room.lobbyRevision }); send('B', { action: 'startAgreement', lobbyRevision: view().room.lobbyRevision }); }
  function game(role: Role, action: string, extra = {}) {
    const m = view(role).mission!; return send(role, { action, missionId: m.id, turn: m.turn, planningRevision: m.planningRevision, ...extra });
  }
  return { store, sessions, messages, channels, view, envelope, send, start, game, advance: (ms: number) => { now += ms; } };
}
function lastAck(messages: ServerMessage[]) { const found = messages.filter(m => m.type === 'ack').at(-1); if (!found || found.type !== 'ack') throw new Error('No acknowledgement'); return found; }
test('start needs both connected players on current lobby revision; no private mission in waiting', () => {
  const f = setup(); const rev = f.view().room.lobbyRevision;
  assert.equal(f.view().mission, null); f.send('A', { action: 'startAgreement', lobbyRevision: rev });
  assert.equal(f.view().mission, null); f.send('B', { action: 'startAgreement', lobbyRevision: rev - 1 });
  assert.equal(lastAck(f.messages.B).error, 'STALE_PLAN'); f.send('B', { action: 'startAgreement', lobbyRevision: rev });
  assert.equal(f.view().room.phase, 'planning'); assert.deepEqual(f.view('A').mission!.partnerHazards, [0,7]); assert.deepEqual(f.view('B').mission!.partnerHazards, [1,7]);
});
test('second current ready resolves once; retries after commit return original acknowledgement', () => {
  const f = setup(); f.start(); f.game('A', 'ready'); assert.equal(f.view().mission!.turnsResolved, 0);
  const second = f.game('B', 'ready'); assert.equal(f.view().mission!.turnsResolved, 1);
  f.store.receive(f.sessions.B, f.channels.B, second); assert.equal(f.view().mission!.turnsResolved, 1);
  assert.equal(lastAck(f.messages.B).ok, true); assert.equal(f.view().mission!.turn, 2);
});
test('edit invalidates both ready; stale ready consumes sequence but cannot resolve', () => {
  const f = setup(); f.start(); f.game('A', 'ready');
  const m = f.view().mission!; const stale = f.envelope('A', { action: 'ready', missionId: m.id, turn: m.turn, planningRevision: m.planningRevision });
  f.game('B', 'propose', { destination: 4 }); assert.deepEqual(f.view().mission!.ready, { A: false, B: false });
  f.store.receive(f.sessions.A, f.channels.A, stale); assert.equal(lastAck(f.messages.A).error, 'STALE_PLAN');
  assert.equal(f.view().mission!.turnsResolved, 0); assert.equal(f.view().self.nextCommandSequence, stale.sequence + 1);
  f.store.receive(f.sessions.A, f.channels.A, stale); assert.equal(lastAck(f.messages.A).error, 'STALE_PLAN');
});
test('signal quota and input authority are enforced; cannot inject a safety label', () => {
  const f = setup(); f.start(); f.game('A', 'signal', { cell: 0 }); f.game('A', 'signal', { cell: 1 });
  assert.equal(lastAck(f.messages.A).error, 'SIGNAL_UNAVAILABLE'); assert.equal(f.view('B').mission!.ownKnownCells[0]!.safety, 'Danger');
  assert.throws(() => f.game('B', 'signal', { cell: 1, safety: 'Safe' }));
  assert.equal(f.view('A').mission!.ownKnownCells[1], null);
});
test('recovery preserves mission/knowledge/positions, clears readiness, rejects paused mutations and fences stale plans', () => {
  const f = setup(); f.start(); f.game('B', 'signal', { cell: 1 }); f.game('A', 'ready');
  const before = f.view().mission!; f.store.disconnect(f.sessions.B, f.channels.B);
  f.game('A', 'ready'); assert.equal(lastAck(f.messages.A).error, 'PAUSED'); f.advance(59_000);
  f.store.connect(f.sessions.B, f.channels.B); const after = f.view().mission!;
  assert.equal(f.view().room.phase, 'planning'); assert.equal(after.id, before.id);
  assert.deepEqual(after.positions, before.positions); assert.deepEqual(after.ownKnownCells, before.ownKnownCells);
  assert.deepEqual(after.ready, { A: false, B: false }); assert.ok(after.planningRevision > before.planningRevision);
});
test('reconnect can replay a committed command with current epoch and same semantic intent', () => {
  const f = setup(); f.start(); const clue = f.game('B', 'signal', { cell: 1 });
  f.store.disconnect(f.sessions.B, f.channels.B); f.store.connect(f.sessions.B, f.channels.B);
  f.store.receive(f.sessions.B, f.channels.B, { ...clue, controllerEpoch: f.view('B').self.controllerEpoch });
  assert.equal(lastAck(f.messages.B).ok, true); assert.deepEqual(f.view().mission!.ownKnownCells[1], { safety: 'Danger', source: 'signal' });
});
test('payload conflict, out-of-order, and evicted old requests cannot apply', () => {
  const f = setup(); f.start(); const original = f.game('A', 'propose', { destination: 4 });
  assert.throws(() => f.store.receive(f.sessions.A, f.channels.A, { ...original, destination: 0 } as Command), /REQUEST_CONFLICT/);
  for (let i = 0; i < 130; i++) f.game('A', 'propose', { destination: 4 });
  assert.throws(() => f.store.receive(f.sessions.A, f.channels.A, original), /REQUEST_TOO_OLD/);
  assert.equal(f.view().mission!.turnsResolved, 0);
});
test('complete route, terminal immutability and mutual retry reset mission but preserve seat sequence', () => {
  const f = setup(); f.start();
  for (const [a,b] of [[0,4],[0,3],[3,6],[4,3],[5,3]]) {
    f.game('A','propose',{ destination:a }); f.game('B','propose',{ destination:b }); f.game('A','ready'); f.game('B','ready');
  }
  const old = f.view().mission!; assert.equal(old.result, 'success'); assert.equal(f.view().room.phase, 'terminal');
  f.game('A','ready'); assert.equal(lastAck(f.messages.A).error, 'NOT_PLANNING');
  f.send('A',{ action:'retryAgreement',missionId:old.id }); assert.equal(f.view().mission!.id, old.id);
  f.send('B',{ action:'retryAgreement',missionId:old.id }); const next = f.view().mission!;
  assert.notEqual(next.id, old.id); assert.deepEqual(next.positions,{ A:3,B:5 }); assert.equal(next.turnsResolved,0);
  assert.equal(next.ownKnownCells[0],null); assert.deepEqual(next.signals,{ A:null,B:null });
  assert.ok(f.view().self.nextCommandSequence > 1);
  f.send('A',{ action:'retryAgreement',missionId:old.id }); assert.equal(lastAck(f.messages.A).error,'STALE_MISSION');
});
test('active leave closes both; no anonymous replacement after a mission starts', () => {
  const f = setup(); f.start();
  const third = f.store.bootstrap().session;
  assert.throws(() => f.store.admit(third, {requestId:'third_join',expectedContextVersion:0,code:f.view().room.code},'join'), /ROOM_FULL/);
  f.send('A',{ action:'leave' });
  assert.equal(f.store.context(f.sessions.A).view,null); assert.equal(f.store.context(f.sessions.B).view,null);
});
test('terminal recovery clears retry agreements; expiry preserves the committed outcome without hazard content', () => {
  const f = setup(); f.start();
  for (let i=0;i<8;i++) { f.game('A','ready'); f.game('B','ready'); }
  const mission=f.view().mission!; assert.equal(mission.result,'turns');
  f.send('A',{action:'retryAgreement',missionId:mission.id});
  f.store.disconnect(f.sessions.B,f.channels.B); f.store.connect(f.sessions.B,f.channels.B);
  assert.equal(f.view().room.phase,'terminal'); assert.deepEqual(f.view().mission!.retryAgreements,{A:false,B:false});
  f.store.disconnect(f.sessions.B,f.channels.B); f.advance(60_000); f.store.sweep();
  const ended=f.store.context(f.sessions.A).ended!;
  assert.deepEqual(ended.outcome,{result:'turns',turnsResolved:8,strikes:0});
  assert.ok(!JSON.stringify(ended).includes('hazards'));
});
