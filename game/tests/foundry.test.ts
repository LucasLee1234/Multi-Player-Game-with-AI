import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { firstConnection } from '../src/content/missions.js';
import { newMission, propose, ready, resolve, signal, project, clearAgreement, type Mission } from '../src/rules/joint-exit.js';

const fresh = () => newMission('foundry_001', firstConnection);
function move(m: Mission, a: number, b: number) { return ready(ready(propose(propose(m, 'A', a), 'B', b), 'A'), 'B'); }

test('foundry teaches partner-powered gates, joint exit and immutable completion', () => {
  let m = fresh(); assert.deepEqual(project(m, 'A').foundry!.gates.map(g => g.open), [true, false]);
  for (const [a, b] of [[1, 8], [2, 8], [2, 9], [2, 10], [3, 11]]) m = move(m, a!, b!);
  assert.equal(m.result, 'success'); assert.equal(m.turnsResolved, 5); assert.deepEqual(m.latchedGates, [1, 9]);
  assert.equal(m.strikes, 0);
  assert.throws(() => propose(m, 'A', 2)); assert.throws(() => ready(m, 'B')); assert.throws(() => signal(m, 'A', 2));
});

test('relay activation uses turn-start state; gate entry can coincide with relay departure', () => {
  let m = move(fresh(), 1, 8); m = move(m, 2, 9);
  assert.deepEqual(m.positions, { A: 2, B: 8 }); assert.deepEqual(m.latchedGates, [1]);
  assert.match(m.explanations.join(' '), /not powered at turn start/);
  assert.match(m.explanations.join(' '), /now powers Gate 9/);
  m = move(m, 3, 9); assert.deepEqual(m.positions, { A: 3, B: 9 });
  assert.equal(project(m, 'A').foundry!.gates[1]!.powered, false);
  assert.equal(project(m, 'A').foundry!.gates[1]!.latched, true);
});

test('latching recovers the original momentary-gate softlock and exploration has no eight-turn limit', () => {
  let m = fresh(); for (const [a,b] of [[1,8],[2,8],[1,9],[0,10]]) m = move(m,a!,b!);
  assert.deepEqual(m.positions, { A: 0, B: 10 }); assert.deepEqual(m.latchedGates, [1,9]);
  for (let i=0;i<10;i++) m=move(m,0,10);
  assert.equal(m.result,null); assert.equal(m.strikes,0);
  for (const [a,b] of [[1,10],[2,10],[3,11]]) m=move(m,a!,b!);
  assert.equal(m.result,'success');
});

test('foundry geometry rejects walls, row wrapping and nonadjacent actions without mutation', () => {
  const m=fresh();
  for (const cell of [4,2,-1,12,0.5]) assert.throws(()=>propose(m,'A',cell));
  const atExit=move(move(move(fresh(),1,8),2,8),3,9);
  assert.throws(()=>propose(atExit,'A',4));
  assert.deepEqual(m,fresh());
});

test('public tile pings are bounded, invalidate ready and cannot target walls; projections are isolated', () => {
  const m=ready(fresh(),'A'), ping=signal(m,'B',2);
  assert.deepEqual(ping.ready,{A:false,B:false}); assert.deepEqual(ping.signals.B,{cell:2,safety:'Safe'});
  assert.throws(()=>signal(ping,'B',3)); assert.throws(()=>signal(m,'B',4));
  const a=project(ping,'A'),b=project(ping,'B'); assert.deepEqual(a,b);
  assert.deepEqual(a.partnerHazards,[]); assert.deepEqual(a.ownKnownCells,[]);
  a.foundry!.gates[0]!.latched=true; assert.equal(project(ping,'A').foundry!.gates[0]!.latched,false);
  const moved=move(move(fresh(),1,8),2,8), cleared=clearAgreement(ready(moved,'A'));
  assert.deepEqual(cleared.latchedGates,[1]); assert.deepEqual(cleared.ready,{A:false,B:false});
  assert.ok(cleared.planningRevision>moved.planningRevision);
});

function key(m: Mission) { return `${m.positions.A},${m.positions.B},${[...m.latchedGates].sort().join(':')}`; }
function explore(initial: Mission) {
  const states=new Map([[key(initial),initial]]),queue=[initial];let transitions=0;
  for(let i=0;i<queue.length;i++) {
    const m=queue[i]!; if(m.result)continue;
    for(const a of [0,1,2,3,8,9,10,11])for(const b of [0,1,2,3,8,9,10,11]) {
      let planned:Mission; try {planned=propose(propose(m,'A',a),'B',b);}catch{continue;}
      const next=resolve(planned);transitions++;
      if(!states.has(key(next))){states.set(key(next),next);queue.push(next);}
    }
  }
  return {states,transitions};
}
test('actual TypeScript foundry transitions match research state counts and all reachable states can complete', () => {
  const evidence=JSON.parse(readFileSync(new URL('../../../docs/signal-foundry-validation.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
  const {states,transitions}=explore(fresh());
  assert.equal(states.size,evidence.reachable_states_including_terminal);
  assert.equal(transitions,evidence.enumerated_transitions_excluding_terminal);
  for(const m of states.values())assert.ok([...explore(m).states.values()].some(s=>s.result==='success'),`Recovery from ${key(m)}`);
});
