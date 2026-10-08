import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, type Channel } from '../src/server/store.js';
import { firstConnectionFree, tradePlaces, keepPowerOn, type MissionDefinition } from '../src/content/missions.js';
import type { Role, ServerMessage, Command } from '../src/contracts/lobby.js';
function fixture(definition:MissionDefinition=keepPowerOn){
  const store=new Store(undefined,{},definition),sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const created=store.admit(sessions.A,{requestId:'restart_create',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'restart_join',expectedContextVersion:0,code:created.view!.room.code},'join');
  const messages={A:[] as ServerMessage[],B:[] as ServerMessage[]};
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};
  store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);let serial=0;
  const view=(r:Role='A')=>store.context(sessions[r]).view!;
  const send=(r:Role,fields:Record<string,unknown>)=>{
    const v=view(r);const command={type:'command',requestId:`restart_cmd_${++serial}`,sequence:v.self.nextCommandSequence,controllerEpoch:v.self.controllerEpoch,roomId:v.room.id,missionId:v.mission!.id,...(fields.action==='restartAgreement'||fields.action==='cancelRestart'?{restartRevision:v.restart.revision}:{}),...fields} as Command;
    store.receive(sessions[r],channels[r],command);return command;
  };
  const ack=(r:Role)=>messages[r].filter(m=>m.type==='ack').at(-1) as Extract<ServerMessage,{type:'ack'}>;
  const move=(r:Role,c:number,kind:'move'|'pull'='move')=>{const m=view(r).mission!,crate=m.foundry!.crate;return send(r,{action:crate?'crateMove':'move',from:m.positions[r],destination:c,...(crate?{crateFrom:crate.cell,kind}:{})});};
  return {store,sessions,channels,view,send,ack,move};
}
test('restart needs distinct seats and resets the current authored room, crate, pings, gates and counter',()=>{
  for(const definition of [firstConnectionFree,tradePlaces,keepPowerOn]){
    const f=fixture(definition),id=f.view().mission!.id,code=f.view().room.code;
    f.move('A',1);
    if(definition===keepPowerOn){f.move('A',6);f.move('B',13);f.move('B',14,'pull');f.move('B',9);f.move('B',8);f.move('B',3,'pull');f.move('B',2);}
    f.send('A',{action:'ping',cell:1});const before=structuredClone(f.view().mission);
    f.send('A',{action:'restartAgreement'});assert.deepEqual(f.view().mission,before);
    f.send('A',{action:'restartAgreement'});assert.equal(f.view().mission!.id,id);
    const consent=f.send('B',{action:'restartAgreement'}),newId=f.view().mission!.id;
    assert.equal(f.ack('B').ok,true);assert.notEqual(newId,id);assert.equal(f.view().room.code,code);
    assert.equal(f.view().mission!.title,definition.title);assert.equal(f.view().mission!.turnsResolved,0);
    assert.deepEqual(f.view().mission!.positions,definition.factory?.starts??{A:0,B:8});
    assert.equal(f.view().mission!.foundry!.crate?.cell??null,definition.factory?.crate?.start??null);
    assert.deepEqual(f.view().mission!.signals,{A:null,B:null});assert.ok(f.view().mission!.foundry!.gates.every(g=>!g.latched));
    assert.equal(f.view().restart.requestedBy,null);
    f.store.receive(f.sessions.B,f.channels.B,consent);assert.equal(f.view().mission!.id,newId);
    f.send('A',{action:'restartAgreement',missionId:id});assert.equal(f.ack('A').error,'STALE_MISSION');
  }
});
test('cancel or decline fences stale agreement and stale request; new request needs fresh consent',()=>{
  const f=fixture(),id=f.view().mission!.id;
  const request=f.send('A',{action:'restartAgreement'}),revision=f.view().restart.revision;
  f.move('A',1);assert.equal(f.view().mission!.positions.A,1); // Pending request does not freeze play.
  f.send('B',{action:'cancelRestart'});assert.equal(f.view().restart.requestedBy,null);
  f.send('B',{action:'restartAgreement',restartRevision:revision});assert.equal(f.ack('B').error,'STALE_RESTART');
  f.send('A',{action:'restartAgreement',restartRevision:0});assert.equal(f.ack('A').error,'STALE_RESTART');
  f.store.receive(f.sessions.A,f.channels.A,request);assert.equal(f.view().restart.requestedBy,null);
  f.send('B',{action:'restartAgreement'});f.send('B',{action:'cancelRestart'});assert.equal(f.view().mission!.id,id);
  f.send('B',{action:'restartAgreement'});f.send('A',{action:'restartAgreement'});assert.notEqual(f.view().mission!.id,id);
});
test('pause clears restart consent and cached reconnect replay cannot restore it',()=>{
  const f=fixture(),id=f.view().mission!.id,request=f.send('A',{action:'restartAgreement'}),revision=f.view().restart.revision;
  f.store.disconnect(f.sessions.B,f.channels.B);assert.equal(f.view().restart.requestedBy,null);
  f.send('A',{action:'restartAgreement'});assert.equal(f.ack('A').error,'PAUSED');
  f.store.connect(f.sessions.B,f.channels.B);f.store.receive(f.sessions.A,f.channels.A,request);
  assert.equal(f.view().restart.requestedBy,null);
  f.send('B',{action:'restartAgreement',restartRevision:revision});assert.equal(f.ack('B').error,'STALE_RESTART');
  f.send('B',{action:'restartAgreement'});assert.equal(f.view().mission!.id,id);
  f.send('A',{action:'restartAgreement'});assert.notEqual(f.view().mission!.id,id);
});
test('completion clears a pending restart and terminal practice remains a separate agreement',()=>{
  const f=fixture(firstConnectionFree);f.send('A',{action:'restartAgreement'});
  for(const [r,c] of [['A',1],['A',2],['B',9],['B',10],['B',11],['A',3]] as [Role,number][])f.move(r,c);
  const id=f.view().mission!.id;assert.equal(f.view().room.phase,'terminal');assert.equal(f.view().restart.requestedBy,null);
  f.send('B',{action:'restartAgreement'});assert.equal(f.ack('B').error,'NOT_PLANNING');
  f.send('A',{action:'retryAgreement'});assert.equal(f.view().mission!.id,id);
  f.send('B',{action:'retryAgreement'});assert.notEqual(f.view().mission!.id,id);
});

