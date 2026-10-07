import { test } from 'node:test';
import assert from 'node:assert/strict';
import { differentDangers } from '../src/content/missions.js';
import { newMission, project, propose, ready, resolve, RuleFault, signal, type Mission } from '../src/rules/joint-exit.js';
const fresh = () => newMission('mission-test', differentDangers);
function step(m: Mission, a: number, b: number) { return ready(ready(propose(propose(m, 'A', a), 'B', b), 'A'), 'B'); }
function disclosure(m: Mission) {
  m = step(signal(signal(m, 'A', 0), 'B', 1), 3, 5);
  return step(signal(signal(m, 'A', 7), 'B', 7), 3, 5);
}
test('asymmetric seven-turn informed witness and both hazards permit safe deduction', () => {
  let m = disclosure(fresh());
  assert.equal(m.knowledge.A.filter(k => k?.safety === 'Danger').length, 2);
  assert.ok(m.knowledge.A.every(k => k !== null)); assert.equal(m.knowledge.A[0]!.source, 'deduction');
  for (const [a, b] of [[0,4],[0,3],[3,6],[4,3],[5,3]]) m = step(m, a!, b!);
  assert.equal(m.result, 'success'); assert.equal(m.turnsResolved, 7); assert.equal(m.strikes, 0);
  assert.deepEqual(m.positions, { A: 5, B: 3 });
});
test('asymmetric alternate six-turn route is valid without requiring exit departure', () => {
  let m = disclosure(fresh()); for (const [a,b] of [[4,2],[5,1],[5,4],[5,3]]) m = step(m, a!, b!);
  assert.equal(m.result, 'success'); assert.equal(m.turnsResolved, 6);
});
test('one collision or hazard-plus-collision can recover at the eighth-turn boundary', () => {
  for (const bMistake of [3,0]) {
    let m = step(step(disclosure(fresh()), 0, 4), 0, 3);
    m = step(m, 3, bMistake); assert.deepEqual(m.positions, { A: 0, B: 3 });
    assert.equal(m.strikes, bMistake === 0 ? 1 : 0);
    for (const [a,b] of [[3,6],[4,3],[5,3]]) m = step(m, a!, b!);
    assert.equal(m.result, 'success'); assert.equal(m.turnsResolved, 8);
  }
});
test('signals are truthful, immutable in turn, persistent, and do not reveal unsignaled own danger', () => {
  const before = fresh(); const m = signal(before, 'A', 0);
  assert.deepEqual(m.signals.A, { cell: 0, safety: 'Danger' }); assert.equal(m.knowledge.B[0]!.safety, 'Danger');
  assert.equal(m.knowledge.A[1], null); assert.equal(before.knowledge.B[0], null);
  assert.throws(() => signal(m, 'A', 1), e => e instanceof RuleFault && e.code === 'SIGNAL_UNAVAILABLE');
  const after = step(m, 3, 5); assert.equal(after.signals.A, null); assert.equal(after.knowledge.B[0]!.safety, 'Danger');
  const repeated = signal(after, 'A', 0); assert.deepEqual(repeated.signals.A, m.signals.A);
});
test('changed proposals or signals clear both readiness; unchanged proposal preserves it', () => {
  const m = ready(fresh(), 'A'); assert.equal(m.ready.A, true);
  assert.equal(propose(m, 'A', 3), m); assert.equal(m.planningRevision, 0);
  const edit = propose(m, 'B', 4); assert.deepEqual(edit.ready, { A: false, B: false });
  assert.equal(edit.planningRevision, 1); assert.deepEqual(signal(m, 'B', 1).ready, { A: false, B: false });
});
test('hazard stop happens before collision and both hazardous attempts add strikes', () => {
  let m = fresh(); m.positions = { A: 0, B: 3 }; m.proposals = { A: 3, B: 0 };
  const stopped = resolve(m); assert.deepEqual(stopped.positions, m.positions); assert.equal(stopped.strikes, 1);
  assert.ok(stopped.explanations.some(s => s.includes('overlapped')));
  m.proposals = { A: 1, B: 0 }; const two = resolve(m); assert.equal(two.strikes, 2);
});
test('same-cell and direct swaps block; following into a successfully vacated cell works', () => {
  const same = step(fresh(), 4, 4); assert.deepEqual(same.positions, { A: 3, B: 5 }); assert.equal(same.strikes, 0);
  let m = fresh(); m.positions = { A: 3, B: 4 }; m.proposals = { A: 4, B: 3 };
  assert.deepEqual(resolve(m).positions, m.positions);
  m.positions = { A: 0, B: 3 }; m.proposals = { A: 3, B: 6 };
  assert.deepEqual(resolve(m).positions, { A: 3, B: 6 });
});
test('third strike precedes joint exit; turn-eight joint arrival precedes turn-limit failure', () => {
  const m = fresh(); m.positions = { A: 4, B: 3 }; m.proposals = { A: 5, B: 0 }; m.strikes = 2;
  const failed = resolve(m); assert.deepEqual(failed.positions, { A: 5, B: 3 }); assert.equal(failed.result, 'strikes');
  m.strikes = 0; m.turn = 8; m.turnsResolved = 7; m.proposals.B = 3;
  assert.equal(resolve(m).result, 'success');
  const limit = fresh(); limit.turn = 8; limit.turnsResolved = 7; assert.equal(resolve(limit).result, 'turns');
});
test('early arrival is movable and does not extract; all actions reject after termination', () => {
  let m = step(step(disclosure(fresh()), 0, 4), 0, 3);
  assert.equal(m.result, null); assert.equal(m.positions.B, 3);
  m = step(m, 3, 6); assert.equal(m.positions.B, 6);
  const ended = fresh(); ended.result = 'turns';
  for (const action of [() => signal(ended, 'A', 0), () => propose(ended, 'A', 4), () => ready(ended, 'A'), () => resolve(ended)]) {
    assert.throws(action, e => e instanceof RuleFault && e.code === 'NOT_PLANNING');
  }
});
test('projection supplies only own learned cells and partner hazards; returned data cannot mutate truth', () => {
  const m = fresh(), a = project(m, 'A'), b = project(m, 'B');
  assert.deepEqual(a.partnerHazards, [0,7]); assert.deepEqual(b.partnerHazards, [1,7]);
  assert.equal(a.ownKnownCells[1], null); assert.equal(b.ownKnownCells[0], null);
  assert.ok(!Object.hasOwn(a, 'definition') && !Object.hasOwn(a, 'knowledge'));
  a.partnerHazards.push(8); a.positions.A = 8;
  assert.deepEqual(m.definition.hazards.B, [0,7]); assert.equal(m.positions.A, 3);
});
test('nonadjacent, wraparound and malformed destinations reject without mutation', () => {
  for (const cell of [-1,9,5,2,3.5,NaN]) assert.throws(() => propose(fresh(), 'A', cell), RuleFault);
  const m = fresh(); m.positions.A = 2; assert.throws(() => propose(m, 'A', 3), RuleFault);
  assert.throws(() => newMission('bad', { title: 'bad', hazards: { A: [1,1], B: [0,7] } }));
});
