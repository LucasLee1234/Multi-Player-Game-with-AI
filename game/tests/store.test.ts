import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, Fault, admission, type Channel } from '../src/server/store.js';
import type { ErrorCode, ServerMessage } from '../src/contracts/lobby.js';

function fixture(limits = {}) {
  let time = 0; const store = new Store(() => time, limits);
  const a = store.bootstrap(), b = store.bootstrap(), c = store.bootstrap();
  const create = { requestId: 'create_001', expectedContextVersion: 0 };
  const room = store.admit(a.session, create, 'create').view!;
  const join = { requestId: 'join_0001', expectedContextVersion: 0, code: room.room.code };
  const channel = () => {
    const messages: ServerMessage[] = []; const closes: number[] = [];
    const value: Channel = { send: m => messages.push(m), close: code => closes.push(code) };
    return { value, messages, closes };
  };
  return { store, a, b, c, create, join, room, channel, advance: (amount: number) => { time += amount; } };
}
const throws = (run: () => unknown, code: ErrorCode) => assert.throws(run, error => error instanceof Fault && error.code === code);
test('create/join deduplication, conflicts and occupied seats', () => {
  const f = fixture();
  assert.equal(f.store.admit(f.a.session, f.create, 'create').view!.room.id, f.room.room.id);
  throws(() => f.store.admit(f.a.session, { ...f.create, expectedContextVersion: 1 }, 'create'), 'REQUEST_CONFLICT');
  const b = f.store.admit(f.b.session, f.join, 'join');
  assert.equal(b.view!.self.role, 'B');
  assert.equal(f.store.admit(f.b.session, f.join, 'join').view!.room.id, f.room.room.id);
  throws(() => f.store.admit(f.c.session, { ...f.join, requestId: 'third_001' }, 'join'), 'ROOM_FULL');
  throws(() => f.store.admit(f.a.session, { requestId: 'stale_001', expectedContextVersion: 0 }, 'create'), 'STALE_CONTEXT');
});
test('lobby projections contain no credentials or internal state and lookup needs a capability', () => {
  const f = fixture(); f.store.admit(f.b.session, f.join, 'join');
  const view = f.store.context(f.a.session).view!;
  assert.deepEqual(Object.keys(view).sort(), ['bootId','gameplayImplemented','protocolVersion','releaseId','room','self','timers'].sort());
  assert.equal(view.gameplayImplemented, false);
  const text = JSON.stringify(view);
  assert.ok(!text.includes(f.a.token!) && !text.includes(f.b.token!));
  assert.ok(!text.includes('admissions') && !text.includes('hazards') && !text.includes('mission'));
  throws(() => f.store.require(f.room.room.code), 'NOT_AUTHORIZED');
});
test('duplicate controller rejection, explicit takeover and old channel fencing', () => {
  const f = fixture(); const old = f.channel(), replacement = f.channel();
  const epoch = f.store.connect(f.a.session, old.value);
  throws(() => f.store.connect(f.a.session, replacement.value), 'CONTROLLER_ACTIVE');
  const take = { requestId: 'take_0001', expectedContextVersion: 1 };
  f.store.admit(f.a.session, take, 'takeover');
  assert.deepEqual(old.closes, [4002]);
  f.store.admit(f.a.session, take, 'takeover');
  const newEpoch = f.store.connect(f.a.session, replacement.value);
  assert.ok(newEpoch > epoch);
  f.store.disconnect(f.a.session, old.value);
  assert.equal(f.store.context(f.a.session).view!.room.phase, 'waiting');
  throws(() => f.store.receive(f.a.session, old.value, { type: 'command', action: 'leave', requestId: 'leave_001', sequence: 1, roomId: f.room.room.id, controllerEpoch: epoch }), 'CONTROLLER_REPLACED');
});
test('disconnect reserves seats and repeated disconnect does not extend recovery; boundary expiry closes', () => {
  const f = fixture(); f.store.admit(f.b.session, f.join, 'join');
  const ca = f.channel(), cb = f.channel(); f.store.connect(f.a.session, ca.value); f.store.connect(f.b.session, cb.value);
  f.store.disconnect(f.a.session, ca.value); f.advance(20_000); f.store.disconnect(f.b.session, cb.value);
  assert.equal(f.store.context(f.a.session).view!.timers.recoveryRemainingMs, 40_000);
  throws(() => f.store.admit(f.c.session, { ...f.join, requestId: 'reserved_1' }, 'join'), 'PAUSED');
  f.advance(40_000); f.store.sweep();
  assert.equal(f.store.context(f.a.session).view, null); assert.match(f.store.context(f.b.session).ended!.reason, /expired/);
  throws(() => f.store.connect(f.a.session, f.channel().value), 'ROOM_CLOSED');
});
test('authorized recovery preserves role and restores waiting only when all occupied seats return', () => {
  const f = fixture(); f.store.admit(f.b.session, f.join, 'join'); const a = f.channel(), b = f.channel();
  f.store.connect(f.a.session, a.value); f.store.connect(f.b.session, b.value);
  f.store.disconnect(f.a.session, a.value); f.advance(59_999);
  f.store.connect(f.store.require(f.a.token), f.channel().value);
  assert.equal(f.store.context(f.a.session).view!.room.phase, 'waiting');
  assert.equal(f.store.context(f.a.session).view!.self.role, 'A');
});
test('waiting leave transfers setup ownership; replacement cannot be controlled by the old channel', () => {
  const f = fixture(); f.store.admit(f.b.session, f.join, 'join'); const a = f.channel(), b = f.channel();
  const epoch = f.store.connect(f.a.session, a.value); f.store.connect(f.b.session, b.value);
  f.store.receive(f.a.session, a.value, { type: 'command', action: 'leave', requestId: 'leave_001', sequence: 1, roomId: f.room.room.id, controllerEpoch: epoch });
  assert.equal(f.store.context(f.a.session).view, null); assert.equal(f.store.context(f.b.session).view!.room.owner, 'B');
  assert.equal(f.store.admit(f.c.session, { ...f.join, requestId: 'replace_1' }, 'join').view!.self.role, 'A');
  throws(() => f.store.receive(f.a.session, a.value, { type: 'command', action: 'leave', requestId: 'leave_002', sequence: 2, roomId: f.room.room.id, controllerEpoch: epoch }), 'ROOM_CLOSED');
});
test('leaving a paused room ends it for both rather than permitting reserved-seat replacement', () => {
  const f = fixture(); f.store.admit(f.b.session, f.join, 'join'); const a = f.channel(), b = f.channel();
  const epoch = f.store.connect(f.a.session, a.value); f.store.connect(f.b.session, b.value); f.store.disconnect(f.b.session, b.value);
  f.store.receive(f.a.session, a.value, { type: 'command', action: 'leave', requestId: 'leave_001', sequence: 1, roomId: f.room.room.id, controllerEpoch: epoch });
  assert.equal(f.store.context(f.a.session).view, null); assert.equal(f.store.context(f.b.session).view, null);
});
test('cross-room, sequence gap, role injection and unknown command reject without applying', () => {
  const f = fixture(); const a = f.channel(); const epoch = f.store.connect(f.a.session, a.value);
  const cmd = { type: 'command', action: 'leave', requestId: 'leave_001', sequence: 1, roomId: f.room.room.id, controllerEpoch: epoch };
  throws(() => f.store.receive(f.a.session, a.value, { ...cmd, roomId: 'different' }), 'NOT_AUTHORIZED');
  throws(() => f.store.receive(f.a.session, a.value, { ...cmd, sequence: 2 }), 'OUT_OF_ORDER');
  throws(() => f.store.receive(f.a.session, a.value, { ...cmd, role: 'B' }), 'INVALID_INPUT');
  throws(() => f.store.receive(f.a.session, a.value, { ...cmd, action: 'startAgreement' }), 'INVALID_INPUT');
  assert.equal(f.store.context(f.a.session).view!.self.nextCommandSequence, 1);
});
test('room/session limits, admission rate limits and closed cache prevent unbounded admission', () => {
  const f = fixture({ rooms: 1 });
  throws(() => f.store.admit(f.b.session, { requestId: 'create_002', expectedContextVersion: 0 }, 'create'), 'SERVER_BUSY');
  const bounded = new Store(() => 0, { sessions: 1 }); bounded.bootstrap(); throws(() => bounded.bootstrap(), 'SERVER_BUSY');
  for (let i = 0; i < 4; i++) throws(() => f.store.admit(f.c.session, { requestId: `missing_${i}`, expectedContextVersion: 0, code: 'AAAAAA' }, 'join'), 'ROOM_UNAVAILABLE');
  throws(() => f.store.admit(f.c.session, { requestId: 'missing_4', expectedContextVersion: 0, code: 'AAAAAA' }, 'join'), 'ROOM_UNAVAILABLE');
  throws(() => f.store.admit(f.c.session, { requestId: 'missing_5', expectedContextVersion: 0, code: 'AAAAAA' }, 'join'), 'RATE_LIMITED');
  assert.throws(() => f.store.admit(f.c.session, { requestId: 'missing_0', expectedContextVersion: 0, code: 'AAAAAA' }, 'join'), error => error instanceof Fault && error.code === 'ROOM_UNAVAILABLE' && error.status === 404);
});
test('idle and hard expiry apply on request; restart cannot restore a lost session', () => {
  const f = fixture({ idleMs: 100, lifetimeMs: 1000 }); f.advance(100);
  f.store.require(f.a.token); assert.equal(f.store.context(f.a.session).view, null);
  const fresh = new Store(); const next = fresh.bootstrap(f.a.token);
  assert.notEqual(fresh.bootId, f.store.bootId); assert.equal(fresh.context(next.session).view, null);
  assert.match(fresh.context(next.session).ended!.reason, /restarted/);
  const hard = fixture({ idleMs: 10_000, lifetimeMs: 10 }); hard.advance(10); hard.store.sweep();
  assert.equal(hard.store.context(hard.a.session).view, null);
});
test('strict admission schema rejects extra fields and malformed codes', () => {
  throws(() => admission({ requestId: 'request01', expectedContextVersion: 0, role: 'B' }), 'INVALID_INPUT');
  throws(() => admission({ requestId: 'request01', expectedContextVersion: 0, code: '../etc' }, true), 'INVALID_INPUT');
});
