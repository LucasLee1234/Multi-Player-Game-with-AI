import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepPowerOn, foundryAdventure } from '../src/content/missions.js';
import { newMission, moveFoundry, project, type Mission } from '../src/rules/joint-exit.js';
import { Store, type Channel } from '../src/server/store.js';
import type { Command, Role, ServerMessage } from '../src/contracts/lobby.js';
import { handoffRoute } from './handoff-route.js';
import { freightRoute } from './freight-route.js';
import { conveyorRoute } from './conveyor-route.js';
const fresh=()=>newMission('crate_mission',keepPowerOn);
const route:[Role,number,'move'|'pull'][]=[['A',1,'move'],['A',6,'move'],['B',13,'move'],['B',14,'pull'],['B',9,'move'],['B',8,'move'],['B',3,'pull'],['B',2,'move'],['A',1,'move'],['A',0,'move'],['B',1,'move'],['B',6,'move'],['A',1,'move'],['A',2,'move'],['A',3,'move'],['A',4,'move'],['B',11,'move'],['B',10,'move']];
test('production adventure advances through six rooms and resets the final conveyor room',()=>{
  const store=new Store(undefined,{},foundryAdventure),sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const room=store.admit(sessions.A,{requestId:'campaign_create',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'campaign_join',expectedContextVersion:0,code:room.view!.room.code},'join');
  const channels:Record<Role,Channel>={A:{send:m=>{if(m.type==='ack')assert.equal(m.ok,true);},close(){}},B:{send:m=>{if(m.type==='ack')assert.equal(m.ok,true);},close(){}}};
  store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);let n=0;
  const mission=()=>store.context(sessions.A).view!.mission!;
  const send=(r:Role,fields:Record<string,unknown>)=>{
    const v=store.context(sessions[r]).view!;
    store.receive(sessions[r],channels[r],{type:'command',requestId:`campaign_cmd_${++n}`,sequence:v.self.nextCommandSequence,controllerEpoch:v.self.controllerEpoch,roomId:v.room.id,missionId:v.mission!.id,...fields});
  };
  const move=(r:Role,c:number,k:'move'|'pull'='move')=>{
    const m=mission(),crate=m.foundry!.crate;
    send(r,{action:crate?'crateMove':'move',from:m.positions[r],destination:c,...(crate?{crateFrom:crate.cell,kind:k}:{})});
  };
  for(const [r,c] of [['A',1],['A',2],['B',9],['B',10],['B',11],['A',3]] as [Role,number][])move(r,c);
  assert.equal(mission().result,'success');send('A',{action:'nextAgreement'});send('B',{action:'nextAgreement'});
  assert.equal(mission().title,'Trade Places');
  for(const [r,c] of [['A',1],['B',13],['A',6],['B',8],['A',11],['A',12],['B',13],['B',14],['A',13],['A',8],['B',13],['B',12],['B',11],['A',3],['A',4],['B',10]] as [Role,number][])move(r,c);
  assert.equal(mission().result,'success');send('A',{action:'nextAgreement'});send('B',{action:'nextAgreement'});
  assert.equal(mission().title,'Keep the Power On');assert.equal(mission().ruleVersion,'SF-M3-v1');
  for(const [r,c,k] of route)move(r,c,k);
  assert.equal(mission().result,'success');assert.equal(mission().foundry!.nextTitle,'Handoff Workshop');
  send('A',{action:'nextAgreement'});send('B',{action:'nextAgreement'});
  assert.equal(mission().title,'Handoff Workshop');assert.equal(mission().foundry!.stage,4);
  for(const [r,c,k] of handoffRoute)move(r,c,k);
  assert.equal(mission().result,'success');assert.equal(mission().foundry!.nextTitle,'Freight Exchange');
  send('A',{action:'nextAgreement'});assert.equal(mission().title,'Handoff Workshop');
  send('B',{action:'nextAgreement'});
  assert.equal(mission().title,'Freight Exchange');assert.equal(mission().foundry!.stage,5);
  for(const [r,c,k] of freightRoute)move(r,c,k);
  assert.equal(mission().result,'success');assert.equal(mission().foundry!.nextTitle,'Conveyor Handoff');
  send('A',{action:'nextAgreement'});send('B',{action:'nextAgreement'});
  assert.equal(mission().title,'Conveyor Handoff');assert.equal(mission().foundry!.stage,6);
  for(const [r,c,k] of conveyorRoute)move(r,c,k);
  assert.equal(mission().result,'success');assert.equal(mission().foundry!.nextTitle,null);
  assert.deepEqual(store.context(sessions.A).view!.campaign.completed,[1,2,3,4,5,6]);
  send('A',{action:'retryAgreement'});send('B',{action:'retryAgreement'});
  assert.equal(mission().title,'Conveyor Handoff');assert.equal(mission().foundry!.crate!.cell,12);assert.equal(mission().turnsResolved,0);
});
test('crate witness establishes sustained power and completes in 18 steps',()=>{
  let m=fresh();for(const [r,c,k] of route){m=moveFoundry(m,r,c,k);assert.equal(m.positions[r],c);}
  assert.equal(m.result,'success');assert.equal(m.crate,8);assert.equal(m.turnsResolved,18);
  assert.equal(project(m,'A').foundry!.gates[1]!.powered,true);assert.throws(()=>moveFoundry(m,'A',3));
  const notPowered=fresh();notPowered.positions={A:3,B:10};assert.equal(moveFoundry(notPowered,'A',4).result,null);
});
test('push/pull commits atomically; wrong direction, wall, partner and unpowered entry block',()=>{
  let m=fresh();m.positions={A:11,B:8};m=moveFoundry(m,'A',12);assert.equal(m.crate,13);assert.equal(m.positions.A,12);
  const blocked=moveFoundry(m,'A',11,'pull');assert.equal(blocked.crate,12);assert.equal(blocked.positions.A,11); // Pull is powered by B.
  const wall=fresh();wall.positions={A:3,B:14};wall.crate=4;const stop=moveFoundry(wall,'A',4);assert.equal(stop.crate,4);assert.equal(stop.positions.A,3);
  const partner=fresh();partner.positions={A:11,B:13};const hold=moveFoundry(partner,'A',12);assert.equal(hold.crate,12);assert.equal(hold.positions.A,11);
  const wrong=moveFoundry(fresh(),'B',9,'pull');assert.equal(wrong.turnsResolved,0);assert.equal(wrong.crate,12);
  const closed=fresh();closed.positions={A:11,B:3};closed.crate=6;
  const cannotPull=moveFoundry(closed,'A',12,'pull');assert.equal(cannotPull.crate,6);assert.equal(cannotPull.positions.A,11);
  const leaving=moveFoundry(closed,'A',12);assert.equal(leaving.positions.A,12); // Existing gate occupant may leave.
});
test('actual cargo engine has 2496 states, shortest 18 steps and no unrecoverable states',()=>{
  const key=(m:Mission)=>`${m.positions.A},${m.positions.B},${m.crate},${m.latchedGates.includes(2)}`;
  const initial=fresh(),states=new Map([[key(initial),initial]]),queue=[initial],distance=new Map([[key(initial),0]]),reverse=new Map<string,Set<string>>();let requests=0;
  for(let i=0;i<queue.length;i++){
    const m=queue[i]!,origin=key(m);if(m.result)continue;
    for(const r of ['A','B'] as const)for(let c=0;c<15;c++)for(const k of ['move','pull'] as const){
      if(c===m.positions[r])continue;let n:Mission;try{n=moveFoundry(m,r,c,k);}catch{continue;}requests++;
      const target=key(n);if(!reverse.has(target))reverse.set(target,new Set());reverse.get(target)!.add(origin);
      if(!states.has(target)){states.set(target,n);queue.push(n);distance.set(target,distance.get(origin)!+1);}
    }
  }
  const goals=[...states].filter(([,m])=>m.result==='success').map(([k])=>k), recovered=new Set(goals),pending=[...goals];
  for(let i=0;i<pending.length;i++)for(const parent of reverse.get(pending[i]!)??[])if(!recovered.has(parent)){recovered.add(parent);pending.push(parent);}
  assert.equal(states.size,2496);assert.equal(recovered.size,2496);assert.equal(Math.min(...goals.map(k=>distance.get(k)!)),18);
  console.log(`Cargo audit: ${states.size} states, ${requests} directional requests; all recoverable; shortest 18 steps.`);
});
test('crate command stale checks, deduplication, pause/reconnect and retry preserve atomic authority',()=>{
  const store=new Store(undefined,{},keepPowerOn),sessions={A:store.bootstrap().session,B:store.bootstrap().session},messages={A:[] as ServerMessage[],B:[] as ServerMessage[]};
  const created=store.admit(sessions.A,{requestId:'cargo_create',expectedContextVersion:0},'create');store.admit(sessions.B,{requestId:'cargo_join',expectedContextVersion:0,code:created.view!.room.code},'join');
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);let n=0;
  const view=(r:Role='A')=>store.context(sessions[r]).view!;
  const send=(r:Role,fields:Record<string,unknown>)=>{const v=view(r),m=v.mission!,cmd={type:'command',requestId:`cargo_cmd_${++n}`,sequence:v.self.nextCommandSequence,roomId:v.room.id,controllerEpoch:v.self.controllerEpoch,missionId:m.id,...fields} as Command;store.receive(sessions[r],channels[r],cmd);return cmd;};
  const move=(r:Role,c:number,k:'move'|'pull')=>send(r,{action:'crateMove',from:view(r).mission!.positions[r],crateFrom:view(r).mission!.foundry!.crate!.cell,destination:c,kind:k});
  const ack=(r:Role)=>messages[r].filter(m=>m.type==='ack').at(-1) as Extract<ServerMessage,{type:'ack'}>;
  for(const [r,c,k] of route.slice(0,3))move(r,c,k);
  const pull=move('B',14,'pull');assert.equal(view().mission!.foundry!.crate!.cell,13);
  store.receive(sessions.B,channels.B,pull);assert.equal(view().mission!.turnsResolved,4);assert.equal(view().mission!.foundry!.crate!.cell,13);
  const stale=send('A',{action:'crateMove',from:6,crateFrom:12,destination:1,kind:'move'});assert.equal(ack('A').error,'STALE_POSITION');
  const before=view().mission!.turnsResolved;
  store.receive(sessions.A,channels.A,stale);assert.equal(view().mission!.turnsResolved,before);
  const accepted=move('B',9,'move');store.disconnect(sessions.B,channels.B);move('A',1,'move');assert.equal(ack('A').error,'PAUSED');
  store.connect(sessions.B,channels.B);store.receive(sessions.B,channels.B,{...accepted,controllerEpoch:view('B').self.controllerEpoch});
  assert.equal(view().mission!.foundry!.crate!.cell,13);assert.equal(view().mission!.positions.B,9);
  for(const [r,c,k] of route.slice(5))move(r,c,k);assert.equal(view().mission!.result,'success');
  send('A',{action:'retryAgreement'});send('B',{action:'retryAgreement'});
  assert.equal(view().mission!.foundry!.crate!.cell,12);assert.deepEqual(view().mission!.positions,{A:0,B:14});assert.equal(view().mission!.turnsResolved,0);
  assert.equal(foundryAdventure.nextMission!.nextMission!.title,'Keep the Power On');
});
