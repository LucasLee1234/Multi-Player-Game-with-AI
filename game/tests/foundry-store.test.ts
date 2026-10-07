import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store, type Channel } from '../src/server/store.js';
import { firstConnection } from '../src/content/missions.js';
import type { Command, Role, ServerMessage } from '../src/contracts/lobby.js';

function setup() {
  const store=new Store(undefined,{},firstConnection);
  const sessions={A:store.bootstrap().session,B:store.bootstrap().session};
  const created=store.admit(sessions.A,{requestId:'create_sf01',expectedContextVersion:0},'create');
  store.admit(sessions.B,{requestId:'join_sf001',expectedContextVersion:0,code:created.view!.room.code},'join');
  const messages={A:[] as ServerMessage[],B:[] as ServerMessage[]};
  const channels:Record<Role,Channel>={A:{send:m=>messages.A.push(m),close(){}},B:{send:m=>messages.B.push(m),close(){}}};
  store.connect(sessions.A,channels.A);store.connect(sessions.B,channels.B);
  const view=(r:Role='A')=>store.context(sessions[r]).view!;let id=0;
  const send=(r:Role,action:Record<string,unknown>)=>{
    const v=view(r),m=v.mission;
    const cmd={type:'command',requestId:`request_sf_${++id}`,sequence:v.self.nextCommandSequence,roomId:v.room.id,
      controllerEpoch:v.self.controllerEpoch,...(m?{missionId:m.id,turn:m.turn,planningRevision:m.planningRevision}:{}),...action} as Command;
    // The terminal retry command has a deliberately minimal schema.
    if(cmd.action==='retryAgreement') {delete (cmd as unknown as Record<string,unknown>).turn;delete (cmd as unknown as Record<string,unknown>).planningRevision;}
    store.receive(sessions[r],channels[r],cmd);return cmd;
  };
  send('A',{action:'startAgreement',lobbyRevision:view().room.lobbyRevision});
  send('B',{action:'startAgreement',lobbyRevision:view().room.lobbyRevision});
  const move=(a:number,b:number)=>{send('A',{action:'propose',destination:a});send('B',{action:'propose',destination:b});send('A',{action:'ready'});return send('B',{action:'ready'});};
  return {store,sessions,channels,messages,view,send,move};
}
test('foundry store resolves each confirmation once and both clients see the same powered/latched state',()=>{
  const f=setup();const second=f.move(1,8);
  f.store.receive(f.sessions.B,f.channels.B,second);
  assert.equal(f.view().mission!.turnsResolved,1);
  assert.deepEqual(f.view().mission,f.view('B').mission);
  assert.equal(f.view().mission!.foundry!.gates[0]!.latched,true);
});
test('foundry reconnect preserves latches and clears agreements; stale plans cannot resume automatically',()=>{
  const f=setup();f.move(1,8);f.send('A',{action:'ready'});
  const before=f.view().mission!;f.store.disconnect(f.sessions.B,f.channels.B);
  f.send('A',{action:'ready'});assert.equal(f.view().room.phase,'paused');
  f.store.connect(f.sessions.B,f.channels.B);const after=f.view().mission!;
  assert.deepEqual(after.positions,before.positions);assert.deepEqual(after.foundry,before.foundry);
  assert.deepEqual(after.ready,{A:false,B:false});assert.ok(after.planningRevision>before.planningRevision);
  f.move(2,8);assert.equal(f.view().mission!.turnsResolved,2);
});
test('foundry terminal requires mutual retry and resets both latches without resetting seat sequences',()=>{
  const f=setup();for(const [a,b] of [[1,8],[2,8],[2,9],[2,10],[3,11]])f.move(a!,b!);
  assert.equal(f.view().room.phase,'terminal');const id=f.view().mission!.id,seq=f.view().self.nextCommandSequence;
  f.send('A',{action:'retryAgreement'});assert.equal(f.view().mission!.id,id);
  f.send('B',{action:'retryAgreement'});const m=f.view().mission!;
  assert.notEqual(m.id,id);assert.deepEqual(m.positions,{A:0,B:8});assert.equal(m.turnsResolved,0);
  assert.deepEqual(m.foundry!.gates.map(g=>g.latched),[false,false]);
  assert.deepEqual(m.foundry!.gates.map(g=>g.open),[true,false]);assert.equal(m.result,null);
  assert.ok(f.view().self.nextCommandSequence>seq);
});
