import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freightExchange } from '../src/content/missions.js';
import { newMission, moveFoundry, project } from '../src/rules/joint-exit.js';
import { freightRoute } from './freight-route.js';

test('freight passes between both robots, exits an unpowered doorway and requires final extraction', () => {
  let m = newMission('freight', freightExchange);
  const carriers = new Set<string>();
  for (const [i, [role, destination, kind]] of freightRoute.entries()) {
    const previous = m.crate;
    m = moveFoundry(m, role, destination, kind);
    assert.equal(m.positions[role], destination);
    if (m.crate !== previous) carriers.add(role);
    if (i === 17) { assert.equal(m.crate,13); assert.equal(m.positions.B,16); }
    if (i === 21) { assert.equal(m.crate,11); assert.equal(m.positions.B,10); }
    if (i === 25) {
      assert.equal(m.crate,11); assert.equal(project(m,'A').foundry!.gates.find(g=>g.cell===11)!.open,false);
    }
    if (i === 26) {
      assert.equal(m.crate,6); assert.equal(m.result,null);
      assert.equal(project(m,'B').foundry!.gates.find(g=>g.cell===2)!.powered,true);
    }
  }
  assert.deepEqual([...carriers].sort(),['A','B']);
  assert.equal(m.result,'success'); assert.equal(m.turnsResolved,30);
  assert.deepEqual(m.positions,{A:4,B:10}); assert.equal(m.crate,6);
  assert.throws(()=>moveFoundry(m,'B',11));
});
