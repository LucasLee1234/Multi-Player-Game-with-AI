import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conveyorHandoff } from '../src/content/missions.js';
import { newMission, moveFoundry, project } from '../src/rules/joint-exit.js';
import { conveyorRoute } from './conveyor-route.js';

const fresh=()=>newMission('conveyor-test',conveyorHandoff);
test('conveyor witness requires both roles, switch activation and joint exit',()=>{
  let m=fresh();
  for(const [r,c,k] of conveyorRoute) {m=moveFoundry(m,r,c,k);assert.equal(m.positions[r],c);}
  assert.equal(m.result,'success');assert.equal(m.crate,18);assert.equal(m.turnsResolved,20);
  assert.equal(project(m,'A').ruleVersion,'SF-M4-v1');
  assert.equal(project(m,'A').foundry!.gates.some(g=>g.cell===13||g.relay===16),false);
  for(const role of ['A','B'] as const) {
    let held=fresh();for(const [r,c,k] of conveyorRoute)if(r===role)try{held=moveFoundry(held,r,c,k);}catch{/* Other robot must participate. */}
    assert.notEqual(held.result,'success');assert.equal(held.crate,12);
  }
});
test('belt pauses before an occupied tile, then resumes when the receiver clears it',()=>{
  let m=fresh();m.positions={A:11,B:13};
  m=moveFoundry(m,'A',16);assert.equal(m.crate,12);assert.match(m.explanations.join(' '),/clear Tile 13/);
  m=moveFoundry(m,'B',14);assert.equal(m.crate,18);assert.deepEqual(m.positions,{A:16,B:14});
  assert.match(m.explanations.join(' '),/Conveyor carried.*12 to 18/);
  let bay=fresh();bay.positions={A:11,B:18};bay=moveFoundry(bay,'A',16);
  assert.equal(bay.crate,12);assert.match(bay.explanations.join(' '),/clear Tile 18/);
  bay=moveFoundry(bay,'B',13);assert.equal(bay.crate,12);
  bay=moveFoundry(bay,'B',8);assert.equal(bay.crate,18);assert.equal(bay.positions.B,8);
});
test('belt pauses at a closed gate and never runs on idle or failed moves',()=>{
  const custom=structuredClone(conveyorHandoff);custom.factory!.gates=[...custom.factory!.gates,{cell:13,relay:8,kind:'pressure'}];
  let m=newMission('different-power',custom);m.positions={A:11,B:14};
  m=moveFoundry(m,'A',16);assert.equal(m.crate,12);assert.match(m.explanations.join(' '),/power Relay 8/);
  const idle=moveFoundry(m,'A',16);assert.equal(idle,m);
  const failed=moveFoundry(m,'B',13);assert.equal(failed.crate,12);assert.equal(failed.turnsResolved,m.turnsResolved);
  m=moveFoundry(m,'B',9);m=moveFoundry(m,'B',8);assert.equal(m.crate,18);
});
test('the conveyor handles intermediate cargo and the delivery dock prevents removal',()=>{
  let m=fresh();m.positions={A:11,B:8};
  const push=moveFoundry(m,'A',12);assert.equal(push.crate,12);assert.equal(push.positions.A,11);assert.match(push.explanations[0]!,/belt carries/);
  m.positions={A:13,B:16};m.crate=18;
  m=moveFoundry(m,'A',8,'pull');assert.equal(m.crate,18);assert.equal(m.positions.A,13);assert.match(m.explanations[0]!,/dock locks/);
  m=moveFoundry(m,'A',8);m=moveFoundry(m,'B',11);assert.equal(project(m,'A').foundry!.conveyor!.powered,false);
  m=moveFoundry(m,'A',13);
  m=moveFoundry(m,'A',18);assert.equal(m.crate,18);assert.equal(m.positions.A,13);
  m=moveFoundry(m,'A',8);assert.equal(m.positions.A,8);assert.equal(m.crate,18);
});
test('authored conveyor paths reject walls, repeated cells, row wraps and self-power',()=>{
  for(const path of [[12,14],[12,13,12],[12,17],[9,10]]) {
    const d=structuredClone(conveyorHandoff);d.factory!.conveyor!.path=path;assert.throws(()=>newMission('bad',d));
  }
  const d=structuredClone(conveyorHandoff);d.factory!.conveyor!.relay=12;assert.throws(()=>newMission('bad-switch',d));
});
