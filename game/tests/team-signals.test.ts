import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, type Channel } from '../src/server/store.js';
import { foundryAdventure } from '../src/content/missions.js';
import type { Role, ServerMessage } from '../src/contracts/lobby.js';

function fixture() {
  let now=10000, serial=0;
  const store=new Store(()=>now,{},foundryAdventure);
  const sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const created=store.admit(sessions.A,{requestId:'team_create',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'team_join',expectedContextVersion:0,code:created.view!.room.code},'join');
  const messages:Record<Role,ServerMessage[]>={A:[],B:[]};
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};
  store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);
  const view=(r:Role='A')=>store.context(sessions[r]).view!;
  const send=(r:Role,fields:Record<string,unknown>)=>{
    const v=view(r); const command={type:'command',requestId:`team_cmd_${++serial}`,sequence:v.self.nextCommandSequence,roomId:v.room.id,controllerEpoch:v.self.controllerEpoch,missionId:v.mission!.id,...fields};
    store.receive(sessions[r],channels[r],command);return command;
  };
  const ack=(r:Role)=>messages[r].filter(m=>m.type==='ack').at(-1) as Extract<ServerMessage,{type:'ack'}>;
  return {store,sessions,channels,view,send,ack,advance:(ms:number)=>{now+=ms;}};
}
test('team requests are room-bound, expire, deduplicate and do not alter gameplay or stop movement',()=>{
  const f=fixture(), mission=structuredClone(f.view().mission);
  const cmd=f.send('A',{action:'communicate',kind:'needPower',cell:1}); assert.equal(f.ack('A').ok,true);
  assert.deepEqual(f.view().mission,mission);assert.deepEqual(f.view('A').communication!.signals,f.view('B').communication!.signals);
  const id=f.view().communication!.signals.A!.id;
  f.store.receive(f.sessions.A,f.channels.A,cmd);assert.equal(f.view().communication!.signals.A!.id,id);
  f.send('A',{action:'communicate',kind:'ack',cell:0});assert.equal(f.ack('A').error,'SIGNAL_COOLDOWN');
  f.send('B',{action:'communicate',kind:'hold',cell:8});assert.equal(f.ack('B').ok,true);
  assert.equal(f.view().communication!.signals.B!.cell,0); // Server captures the requested partner position.
  f.send('A',{action:'move',from:0,destination:1});assert.equal(f.ack('A').ok,true);assert.equal(f.view().mission!.positions.A,1);
  const outsider=f.store.bootstrap();assert.equal(f.store.context(outsider.session).view,null);
  const second=f.store.admit(outsider.session,{requestId:'second_room',expectedContextVersion:0},'create');
  assert.deepEqual(second.view!.communication!.signals,{A:null,B:null});
  f.advance(2000); f.send('A',{action:'communicate',kind:'point',cell:2});assert.equal(f.ack('A').ok,true);
  assert.equal(f.view().communication!.signals.A!.cell,2);
  f.advance(6000);assert.deepEqual(f.view().communication!.signals,{A:null,B:null});
});
test('signals reject invalid targets, spoofed fields, paused and stale missions; reset clears signals and cooldown',()=>{
  const f=fixture();
  for(const fields of [{kind:'needPower',cell:2},{kind:'point',cell:4},{kind:'point',cell:999}]) {
    f.send('A',{action:'communicate',...fields});assert.equal(f.ack('A').error,'INVALID_INPUT');
  }
  assert.throws(()=>f.send('A',{action:'communicate',kind:'unknown',cell:0}),/INVALID_INPUT/);
  assert.throws(()=>f.send('A',{action:'communicate',kind:'ack',cell:0,role:'B'}),/INVALID_INPUT/);
  assert.deepEqual(f.view().communication!.signals,{A:null,B:null});
  f.send('A',{action:'communicate',kind:'point',cell:3});assert.equal(f.ack('A').ok,true);
  const old=f.view().mission!.id;
  f.store.disconnect(f.sessions.B,f.channels.B);
  f.send('A',{action:'communicate',kind:'ack',cell:0});assert.equal(f.ack('A').error,'PAUSED');
  f.store.connect(f.sessions.B,f.channels.B);
  f.send('A',{action:'restartAgreement',restartRevision:f.view().restart.revision});
  f.send('B',{action:'restartAgreement',restartRevision:f.view().restart.revision});
  assert.deepEqual(f.view().communication!.signals,{A:null,B:null});assert.equal(f.view().communication!.cooldownMs,0);
  f.send('A',{action:'communicate',kind:'point',cell:3,missionId:old});assert.equal(f.ack('A').error,'STALE_MISSION');
  f.send('A',{action:'communicate',kind:'ack',cell:0});assert.equal(f.ack('A').ok,true);
});
