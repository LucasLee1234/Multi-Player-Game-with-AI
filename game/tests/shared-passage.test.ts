import { test } from 'node:test';
import assert from 'node:assert/strict';
import { twoRoomAdventure, tradePlaces } from '../src/content/missions.js';
import { newMission, moveFoundry, project, type Mission } from '../src/rules/joint-exit.js';
import { Store, type Channel } from '../src/server/store.js';
import type { Command, Role, ServerMessage } from '../src/contracts/lobby.js';

const fresh = () => newMission('shared_mission', tradePlaces);
const southern: [Role, number][] = [['A',1],['B',13],['A',6],['B',8],['A',11],['A',12],['B',13],['B',14],['A',13],['A',8],['B',13],['B',12],['B',11],['A',3],['A',4],['B',10]];
const northern: [Role, number][] = [['A',1],['B',13],['A',6],['B',8],['B',3],['B',2],['B',1],['B',0],['A',1],['A',2],['B',1],['A',3],['B',6],['A',8],['B',11],['B',10],['A',3],['A',4]];
const teaching: [Role, number][] = [['A',1],['A',2],['B',9],['B',10],['B',11],['A',3]];
function follow(route: [Role, number][]) {
  let m = fresh();
  for (const [role, cell] of route) { m = moveFoundry(m, role, cell); assert.equal(m.positions[role], cell); }
  assert.equal(m.result, 'success'); return m;
}
test('southern and northern shared-passage routes complete; only northern route latches Gate 2', () => {
  const south=follow(southern), north=follow(northern);
  assert.equal(south.turnsResolved,16); assert.deepEqual(south.latchedGates,[]);
  assert.equal(north.turnsResolved,18); assert.deepEqual(north.latchedGates,[2]);
  assert.throws(()=>moveFoundry(south,'A',3));
});
test('pressure gate never latches and closing permits occupant escape but blocks re-entry', () => {
  let m=fresh();for(const [r,c] of southern.slice(0,5))m=moveFoundry(m,r,c);
  assert.deepEqual(m.positions,{A:11,B:8});assert.equal(project(m,'A').foundry!.gates[1]!.latched,false);
  m=moveFoundry(m,'B',3);assert.equal(project(m,'A').foundry!.gates[1]!.open,false);
  assert.equal(m.positions.A,11); // Losing power does not displace or harm the occupant.
  const otherExit=moveFoundry(m,'A',6);assert.equal(otherExit.positions.A,6);
  const noReturn=moveFoundry(otherExit,'A',11);assert.equal(noReturn.positions.A,6);
  m=moveFoundry(m,'A',12);const count=m.turnsResolved;
  m=moveFoundry(m,'A',11);assert.equal(m.positions.A,12);assert.equal(m.turnsResolved,count);
  m=moveFoundry(m,'B',8);m=moveFoundry(m,'A',11);assert.equal(m.positions.A,11);
  assert.deepEqual(m.latchedGates,[]);
});
test('shared occupancy blocks; parking clears passage; geometry and projection follow authored dimensions', () => {
  let m=fresh();for(const [r,c] of southern.slice(0,7))m=moveFoundry(m,r,c);
  const before=m.turnsResolved;m=moveFoundry(m,'A',13);assert.deepEqual(m.positions,{A:12,B:13});assert.equal(m.turnsResolved,before);
  m=moveFoundry(m,'B',14);m=moveFoundry(m,'A',13);assert.deepEqual(m.positions,{A:13,B:14});
  assert.throws(()=>moveFoundry(fresh(),'A',5));assert.throws(()=>moveFoundry(fresh(),'B',15));assert.throws(()=>moveFoundry(fresh(),'B',10));
  const v=project(m,'A');assert.equal(v.foundry!.width,5);assert.equal(v.foundry!.height,3);assert.deepEqual(v.exits,{A:4,B:10});
  v.foundry!.walls.push(0);assert.equal(project(m,'B').foundry!.walls.includes(0),false);
  assert.throws(()=>newMission('bad',{...tradePlaces,factory:{...tradePlaces.factory!,starts:{A:0,B:0}}}));
});
test('actual shared-passage rules: 220 reachable states, shortest 16 steps, all recoverable', () => {
  const key=(m:Mission)=>`${m.positions.A},${m.positions.B},${m.latchedGates.includes(2)}`;
  const initial=fresh(), states=new Map([[key(initial),initial]]), queue=[initial], distances=new Map([[key(initial),0]]);
  const reverse=new Map<string,Set<string>>();let requests=0;
  for(let i=0;i<queue.length;i++) {
    const m=queue[i]!, origin=key(m);if(m.result)continue;
    for(const role of ['A','B'] as const)for(let cell=0;cell<15;cell++) {
      if(cell===m.positions[role])continue;
      let next:Mission;try{next=moveFoundry(m,role,cell);}catch{continue;}requests++;
      const target=key(next);if(!reverse.has(target))reverse.set(target,new Set());reverse.get(target)!.add(origin);
      if(!states.has(target)){states.set(target,next);queue.push(next);distances.set(target,distances.get(origin)!+1);}
    }
  }
  const goals=[...states].filter(([,m])=>m.result==='success').map(([k])=>k), recovered=new Set(goals), pending=[...goals];
  for(let i=0;i<pending.length;i++)for(const parent of reverse.get(pending[i]!)??[])if(!recovered.has(parent)){recovered.add(parent);pending.push(parent);}
  assert.equal(states.size,220);assert.equal(recovered.size,220);assert.equal(Math.min(...goals.map(k=>distances.get(k)!)),16);
  console.log(`Shared-passage rule audit: ${states.size} states, ${requests} directional requests, all recoverable; shortest 16 steps.`);
});
function setup() {
  const store=new Store(undefined,{},twoRoomAdventure), sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const created=store.admit(sessions.A,{requestId:'shared_create',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'shared_join',expectedContextVersion:0,code:created.view!.room.code},'join');
  const messages={A:[] as ServerMessage[],B:[] as ServerMessage[]};
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};
  store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);let n=0;
  const view=(role:Role='A')=>store.context(sessions[role]).view!;
  const send=(role:Role,action:Record<string,unknown>)=>{
    const v=view(role),cmd={type:'command',requestId:`shared_cmd_${++n}`,sequence:v.self.nextCommandSequence,roomId:v.room.id,controllerEpoch:v.self.controllerEpoch,missionId:v.mission!.id,...action} as Command;
    store.receive(sessions[role],channels[role],cmd);return cmd;
  };
  const ack=(role:Role)=>messages[role].filter(m=>m.type==='ack').at(-1) as Extract<ServerMessage,{type:'ack'}>;
  const move=(r:Role,c:number)=>send(r,{action:'move',from:view(r).mission!.positions[r],destination:c});
  for(const [r,c] of teaching)move(r,c);
  return {store,sessions,channels,view,send,ack,move};
}
test('mismatched choices wait; revised match advances once; stale next cannot skip rooms; retry keeps current level', () => {
  const f=setup(), first=f.view().mission!.id;
  f.send('A',{action:'nextAgreement'});f.send('B',{action:'retryAgreement'});
  assert.equal(f.view().mission!.id,first);assert.deepEqual(f.view().mission!.foundry!.choices,{A:'next',B:'retry'});
  const accepted=f.send('B',{action:'nextAgreement'}), second=f.view().mission!.id;
  assert.notEqual(second,first);assert.equal(f.view().mission!.title,'Trade Places');assert.deepEqual(f.view().mission!.foundry!.choices,{A:null,B:null});
  f.store.receive(f.sessions.B,f.channels.B,accepted);assert.equal(f.ack('B').ok,true);assert.equal(f.view().mission!.id,second);
  f.send('A',{action:'nextAgreement',missionId:first});assert.equal(f.ack('A').error,'STALE_MISSION');
  for(const [r,c] of northern)f.move(r,c);assert.equal(f.view().mission!.result,'success');
  f.send('A',{action:'nextAgreement'});assert.equal(f.ack('A').error,'INVALID_INPUT');
  f.send('A',{action:'retryAgreement'});f.send('B',{action:'retryAgreement'});
  assert.equal(f.view().mission!.title,'Trade Places');assert.deepEqual(f.view().mission!.positions,{A:0,B:14});
  assert.equal(f.view().mission!.turnsResolved,0);assert.deepEqual(f.view().mission!.foundry!.gates.map(g=>g.latched),[false,false]);
});
test('disconnect clears transition choices; replayed prior consent does not restore it', () => {
  const f=setup(), prior=f.send('A',{action:'nextAgreement'});
  f.store.disconnect(f.sessions.B,f.channels.B);assert.deepEqual(f.view().mission!.foundry!.choices,{A:null,B:null});
  f.store.connect(f.sessions.B,f.channels.B);f.store.receive(f.sessions.A,f.channels.A,prior);
  f.send('B',{action:'nextAgreement'});assert.equal(f.view().mission!.title,'First Connection');
  f.send('A',{action:'nextAgreement'});assert.equal(f.view().mission!.title,'Trade Places');
});
