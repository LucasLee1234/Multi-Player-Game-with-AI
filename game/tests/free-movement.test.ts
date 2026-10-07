import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstConnectionFree } from '../src/content/missions.js';
import { newMission, moveFoundry, signal, ready, project, type Mission } from '../src/rules/joint-exit.js';
import { Store, type Channel } from '../src/server/store.js';
import type { Command, ServerMessage, Role } from '../src/contracts/lobby.js';

const fresh=()=>newMission('free_mission_001',firstConnectionFree);
test('independent movement changes one robot immediately without ready; complete in six individual steps',()=>{
  let m=fresh();m=moveFoundry(m,'A',1);assert.deepEqual(m.positions,{A:1,B:8});
  m=moveFoundry(m,'A',2);m=moveFoundry(m,'B',9);m=moveFoundry(m,'A',3);
  m=moveFoundry(m,'B',10);m=moveFoundry(m,'B',11);
  assert.equal(m.result,'success');assert.equal(m.turnsResolved,6);assert.deepEqual(m.ready,{A:false,B:false});
  assert.throws(()=>ready(fresh(),'A'));assert.throws(()=>moveFoundry(m,'A',2));
});
test('movement uses current relay occupancy; leaving before gate entry blocks until partner returns',()=>{
  let m=moveFoundry(moveFoundry(moveFoundry(fresh(),'A',1),'A',2),'A',3);
  m=moveFoundry(m,'B',9);assert.deepEqual(m.positions,{A:3,B:8});assert.equal(m.turnsResolved,3);
  assert.match(m.explanations.join(' '),/is closed/);
  m=moveFoundry(m,'A',2);m=moveFoundry(m,'B',9);m=moveFoundry(m,'A',3);
  assert.equal(project(m,'B').foundry!.gates[1]!.latched,true);
  assert.equal(project(m,'B').foundry!.gates[1]!.powered,false);
  m=moveFoundry(m,'B',8);assert.deepEqual(m.positions,{A:3,B:8}); // Latched return passage.
});
test('implicit waiting and repeatable location pings do not count as movement or clear pings on partner movement',()=>{
  const m=fresh();assert.equal(moveFoundry(m,'A',0),m);
  const ping=signal(signal(m,'B',2),'B',1),moved=moveFoundry(ping,'A',1);
  assert.deepEqual(moved.signals.B,{cell:1,safety:'Safe'});assert.equal(ping.turnsResolved,0);
  assert.throws(()=>signal(ping,'B',4));assert.throws(()=>moveFoundry(m,'A',4));
});
function explore(initial:Mission) {
  const key=(m:Mission)=>`${m.positions.A},${m.positions.B},${[...m.latchedGates].sort().join(':')}`;
  const states=new Map([[key(initial),initial]]),queue=[initial];let transitions=0;
  for(let i=0;i<queue.length;i++) {
    const m=queue[i]!;if(m.result)continue;
    for(const role of ['A','B'] as const)for(const cell of [0,1,2,3,8,9,10,11]) {
      if(cell===m.positions[role])continue;
      let next:Mission;try{next=moveFoundry(m,role,cell);}catch{continue;}
      transitions++;
      if(!states.has(key(next))){states.set(key(next),next);queue.push(next);}
    }
  }
  return {states,transitions};
}
test('every reachable independent-movement state can recover without a ready barrier',()=>{
  const audit=explore(fresh());assert.equal(audit.states.size,21);
  for(const m of audit.states.values())assert.ok([...explore(m).states.values()].some(s=>s.result==='success'));
  console.log(`Independent rule audit: ${audit.states.size} states, ${audit.transitions} legal directional requests; all recoverable.`);
});
function setup() {
  let now=0;const store=new Store(()=>now,{},firstConnectionFree);
  const sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const created=store.admit(sessions.A,{requestId:'create_free',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'join_free01',expectedContextVersion:0,code:created.view!.room.code},'join');
  const messages={A:[] as ServerMessage[],B:[] as ServerMessage[]};
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};
  const view=(role:Role='A')=>store.context(sessions[role]).view!;
  store.connect(sessions.A,channels.A);assert.equal(view().mission,null);
  store.connect(sessions.B,channels.B);let id=0;
  const command=(role:Role,action:Record<string,unknown>):Command=>{
    const v=view(role);return {type:'command',requestId:`free_cmd_${++id}`,sequence:v.self.nextCommandSequence,
      roomId:v.room.id,controllerEpoch:v.self.controllerEpoch,missionId:v.mission!.id,...action} as Command;
  };
  const send=(role:Role,action:Record<string,unknown>)=>{const cmd=command(role,action);store.receive(sessions[role],channels[role],cmd);return cmd;};
  const move=(role:Role,destination:number)=>send(role,{action:'move',from:view(role).mission!.positions[role],destination});
  const ack=(role:Role)=>messages[role].filter(m=>m.type==='ack').at(-1) as Extract<ServerMessage,{type:'ack'}>;
  return {store,sessions,channels,view,command,send,move,ack,advance:(ms:number)=>{now+=ms;store.sweep();}};
}
test('automatic two-client start, independent commands ignore partner revisions and idle remains stationary',()=>{
  const f=setup();assert.equal(f.view().room.phase,'planning');assert.equal(f.view().mission!.ruleVersion,'SF-T1-v3');
  const b=f.command('B',{action:'move',from:8,destination:9});
  f.move('A',1);f.move('A',2);f.store.receive(f.sessions.B,f.channels.B,b);
  assert.equal(f.ack('B').ok,true);assert.deepEqual(f.view().mission!.positions,{A:2,B:9});
  const before=structuredClone(f.view().mission);f.advance(5_000);assert.deepEqual(f.view().mission,before);
  const version=f.view().mission!.turnsResolved;f.store.receive(f.sessions.B,f.channels.B,b);
  assert.equal(f.view().mission!.turnsResolved,version);
});
test('stale own positions reject; pause/reconnect preserves positions and replays uncertain movement once',()=>{
  const f=setup();const old=f.command('A',{action:'move',from:0,destination:1});
  f.store.receive(f.sessions.A,f.channels.A,old);
  f.send('A',{action:'move',from:0,destination:1});assert.equal(f.ack('A').error,'STALE_POSITION');
  f.store.disconnect(f.sessions.A,f.channels.A);assert.equal(f.view('B').room.phase,'paused');
  f.move('B',9);assert.equal(f.ack('B').error,'PAUSED');
  f.store.connect(f.sessions.A,f.channels.A);
  f.store.receive(f.sessions.A,f.channels.A,{...old,controllerEpoch:f.view().self.controllerEpoch});
  assert.equal(f.ack('A').ok,true);assert.deepEqual(f.view().mission!.positions,{A:1,B:8});
  assert.equal(f.view().mission!.turnsResolved,1);
});
test('independent terminal retry resets move counter, positions, pings and latches',()=>{
  const f=setup();f.send('A',{action:'ping',cell:2});f.move('A',1);f.move('A',2);f.move('B',9);f.move('B',10);f.move('B',11);f.move('A',3);
  const id=f.view().mission!.id;assert.equal(f.view().mission!.turnsResolved,6);
  f.send('A',{action:'retryAgreement'});assert.equal(f.view().mission!.id,id);
  f.send('B',{action:'retryAgreement'});const m=f.view().mission!;
  assert.notEqual(m.id,id);assert.deepEqual(m.positions,{A:0,B:8});assert.equal(m.turnsResolved,0);
  assert.deepEqual(m.signals,{A:null,B:null});assert.deepEqual(m.foundry!.gates.map(g=>g.latched),[false,false]);
});
