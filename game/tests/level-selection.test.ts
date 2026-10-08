import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, type Channel } from '../src/server/store.js';
import { foundryAdventure } from '../src/content/missions.js';
import type { Command, Role, ServerMessage } from '../src/contracts/lobby.js';
function fixture(){
  const store=new Store(undefined,{},foundryAdventure),sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const created=store.admit(sessions.A,{requestId:'level_create',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'level_join',expectedContextVersion:0,code:created.view!.room.code},'join');
  const messages={A:[] as ServerMessage[],B:[] as ServerMessage[]};
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};
  store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);let serial=0;
  const view=(r:Role='A')=>store.context(sessions[r]).view!;
  const send=(r:Role,fields:Record<string,unknown>)=>{
    const v=view(r),cmd={type:'command',requestId:`level_cmd_${++serial}`,sequence:v.self.nextCommandSequence,controllerEpoch:v.self.controllerEpoch,roomId:v.room.id,missionId:v.mission!.id,levelRevision:v.campaign.revision,...fields} as Command;
    if(!['selectLevel','cancelLevel'].includes(cmd.action)) delete (cmd as unknown as Record<string,unknown>).levelRevision;
    store.receive(sessions[r],channels[r],cmd);return cmd;
  };
  const ack=(r:Role)=>messages[r].filter(m=>m.type==='ack').at(-1) as Extract<ServerMessage,{type:'ack'}>;
  return {store,sessions,channels,view,send,ack};
}
test('level selection requires distinct matching consent, resets chosen room and fences replay',()=>{
  const f=fixture(),code=f.view().room.code,id=f.view().mission!.id;
  assert.deepEqual(f.view().campaign.levels.map(l=>l.stage),[1,2,3,4]);
  f.send('A',{action:'selectLevel',stage:3});f.send('A',{action:'selectLevel',stage:3});assert.equal(f.view().mission!.id,id);
  const accepted=f.send('B',{action:'selectLevel',stage:3});assert.equal(f.ack('B').ok,true);
  const newId=f.view().mission!.id;assert.notEqual(newId,id);assert.equal(f.view().room.code,code);
  assert.equal(f.view().mission!.foundry!.stage,3);assert.equal(f.view().mission!.foundry!.crate!.cell,12);assert.equal(f.view().mission!.turnsResolved,0);
  f.store.receive(f.sessions.B,f.channels.B,accepted);assert.equal(f.view().mission!.id,newId);
  f.send('A',{action:'selectLevel',stage:1,missionId:id});assert.equal(f.ack('A').error,'STALE_MISSION');
  f.send('A',{action:'selectLevel',stage:2});f.send('B',{action:'selectLevel',stage:2});assert.equal(f.view().mission!.foundry!.stage,2);
  assert.equal(f.view().mission!.foundry!.nextTitle,'Keep the Power On');
  f.send('A',{action:'selectLevel',stage:1});f.send('B',{action:'selectLevel',stage:1});assert.equal(f.view().mission!.foundry!.stage,1);
  f.send('A',{action:'selectLevel',stage:4});assert.equal(f.view().mission!.foundry!.stage,1);
  f.send('B',{action:'selectLevel',stage:4});assert.equal(f.view().mission!.foundry!.stage,4);
  assert.equal(f.view().mission!.foundry!.crate!.target,18);assert.deepEqual(f.view().campaign.completed,[]);
  const oldMission=f.view().mission!.id;
  f.send('A',{action:'crateMove',from:0,crateFrom:12,destination:1,kind:'move'});
  f.send('A',{action:'restartAgreement',restartRevision:f.view().restart.revision});
  f.send('B',{action:'restartAgreement',restartRevision:f.view().restart.revision});
  assert.notEqual(f.view().mission!.id,oldMission);assert.deepEqual(f.view().mission!.positions,{A:0,B:14});
  assert.equal(f.view().mission!.foundry!.crate!.cell,12);assert.equal(f.view().mission!.turnsResolved,0);
});
test('decline, replacement, pause and restart invalidate previous level consent',()=>{
  const f=fixture(),id=f.view().mission!.id;
  f.send('A',{action:'selectLevel',stage:3});const old=f.view().campaign.revision;
  f.send('B',{action:'cancelLevel'});f.send('B',{action:'selectLevel',stage:3,levelRevision:old});assert.equal(f.ack('B').error,'STALE_LEVEL');
  f.send('A',{action:'selectLevel',stage:3});const prior=f.view().campaign.revision;
  f.send('B',{action:'selectLevel',stage:2});f.send('A',{action:'selectLevel',stage:3,levelRevision:prior});assert.equal(f.ack('A').error,'STALE_LEVEL');
  f.store.disconnect(f.sessions.B,f.channels.B);assert.equal(f.view().campaign.requestedBy,null);
  f.store.connect(f.sessions.B,f.channels.B);f.send('A',{action:'selectLevel',stage:2});
  f.send('B',{action:'restartAgreement',restartRevision:f.view().restart.revision});assert.equal(f.view().campaign.requestedBy,null);
  f.send('A',{action:'selectLevel',stage:3});assert.equal(f.view().restart.requestedBy,null);assert.equal(f.view().mission!.id,id);
  f.send('A',{action:'selectLevel',stage:99});assert.equal(f.ack('A').error,'INVALID_INPUT');assert.equal(f.view().campaign.target,3);
});
test('real completion persists across level switches, projection cannot forge progress and leave works mid-selection',()=>{
  const f=fixture();f.send('A',{action:'selectLevel',stage:3});
  for(const [r,c] of [['A',1],['A',2],['B',9],['B',10],['B',11],['A',3]] as [Role,number][]){const m=f.view(r).mission!;f.send(r,{action:'move',from:m.positions[r],destination:c});}
  assert.deepEqual(f.view('B').campaign.completed,[1]);assert.equal(f.view().campaign.requestedBy,null);
  f.view().campaign.completed.push(3);assert.deepEqual(f.view().campaign.completed,[1]);
  f.send('A',{action:'selectLevel',stage:3});f.send('B',{action:'selectLevel',stage:3});assert.deepEqual(f.view().campaign.completed,[1]);
  assert.equal(f.view().mission!.foundry!.stage,3);
  f.send('A',{action:'selectLevel',stage:1});
  const v=f.view();f.store.receive(f.sessions.A,f.channels.A,{type:'command',requestId:'level_exit_now',sequence:v.self.nextCommandSequence,controllerEpoch:v.self.controllerEpoch,roomId:v.room.id,action:'leave'});
  assert.equal(f.store.context(f.sessions.A).view,null);assert.equal(f.store.context(f.sessions.B).view,null);
});
