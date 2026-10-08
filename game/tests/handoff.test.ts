import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handoffWorkshop } from '../src/content/missions.js';
import { newMission, moveFoundry, project } from '../src/rules/joint-exit.js';
import { handoffRoute } from './handoff-route.js';

test('handoff pressure gates require their own relay, delivery requires partner rescue and both exits',()=>{
  let m=newMission('handoff',handoffWorkshop);
  for(const [r,c,k] of handoffRoute.slice(0,14))m=moveFoundry(m,r,c,k);
  assert.equal(project(m,'A').foundry!.gates.find(g=>g.cell===11)!.open,true);
  assert.equal(project(m,'A').foundry!.gates.find(g=>g.cell===13)!.open,false);
  const blocked=moveFoundry(m,'A',13);assert.equal(blocked.positions.A,8);assert.equal(blocked.turnsResolved,14);
  for(const [r,c,k] of handoffRoute.slice(14,18))m=moveFoundry(m,r,c,k);
  assert.equal(m.crate,13);assert.equal(m.positions.B,16);
  assert.equal(project(m,'A').foundry!.gates.find(g=>g.cell===11)!.open,false);
  const trapped=moveFoundry(m,'B',11);assert.equal(trapped.positions.B,16);
  for(const [r,c,k] of handoffRoute.slice(18,21))m=moveFoundry(m,r,c,k);
  assert.equal(m.crate,18);assert.equal(m.result,null);
  assert.match(m.explanations.join(' '),/parked on Dock 18/);
  assert.doesNotMatch(m.explanations.join(' '),/powers Relay 18/);
  for(const [r,c,k] of handoffRoute.slice(21))m=moveFoundry(m,r,c,k);
  assert.equal(m.result,'success');assert.equal(m.turnsResolved,26);
  assert.deepEqual(m.positions,{A:4,B:10});assert.equal(m.crate,18);
});
