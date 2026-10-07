import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
import { createApplication } from '../src/server/app.js';
import type { Command, LobbyView, ServerMessage } from '../src/contracts/lobby.js';
import { Store } from '../src/server/store.js';
import { firstConnection } from '../src/content/missions.js';
for (const foundry of [false,true]) test(`real wire ${foundry ? 'foundry gates' : 'J1 private layers'}: synchronized turn and duplicate confirmation`, async t => {
  const app = await createApplication(foundry ? {store:new Store(undefined,{},firstConnection)} : {}); t.after(() => app.close());
  async function post(path: string, payload: unknown, cookie?: string) {
    const r = await fetch(app.origin + path, { method:'POST',headers:{Origin:app.origin,'Content-Type':'application/json',...(cookie ? { Cookie:cookie } : {})},body:JSON.stringify(payload) });
    assert.equal(r.status,200); return { body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0] };
  }
  const a = await post('/api/session',{}),b = await post('/api/session',{});
  const created = await post('/api/rooms',{requestId:'create_001',expectedContextVersion:0},a.cookie);
  await post('/api/rooms/join',{requestId:'join_0001',expectedContextVersion:0,code:created.body.context.view.room.code},b.cookie);
  function client(cookie: string) {
    const ws = new WebSocket(app.origin.replace('http','ws')+'/ws',{headers:{Origin:app.origin,Cookie:cookie}});
    let current: LobbyView | undefined; let lastAck: Extract<ServerMessage,{type:'ack'}> | undefined;
    const observers = new Set<() => void>();
    ws.on('message',data => {
      const message = JSON.parse(data.toString()) as ServerMessage;
      if(message.type==='snapshot' && message.context.view) current=message.context.view;
      if(message.type==='ack') lastAck=message;
      for(const check of observers) check();
    });
    ws.on('error',()=>{}); t.after(()=>ws.terminate());
    const until = (predicate:()=>boolean) => new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>{observers.delete(check);reject(new Error('Wire-state timeout'));},2000);
      function check(){ if(predicate()){clearTimeout(timer);observers.delete(check);resolve();} }
      observers.add(check);check();
    });
    const make = (action: Record<string,unknown>):Command => ({type:'command',requestId:randomUUID(),sequence:current!.self.nextCommandSequence,roomId:current!.room.id,controllerEpoch:current!.self.controllerEpoch,...action} as Command);
    async function send(action:Record<string,unknown>){
      const cmd=make(action),version=current!.room.roomVersion;ws.send(JSON.stringify(cmd));
      await until(()=>lastAck?.requestId===cmd.requestId && !!current && current.room.roomVersion>version);
      assert.equal(lastAck!.ok,true); return cmd;
    }
    return {ws,until,send,make,view:()=>current!};
  }
  const ca=client(a.cookie!),cb=client(b.cookie!);
  await ca.until(()=>ca.view()?.room.players.every(p=>p.connected) && ca.view().room.players.length===2);
  await cb.until(()=>!!cb.view());
  await ca.send({action:'startAgreement',lobbyRevision:ca.view().room.lobbyRevision});
  await cb.until(()=>cb.view().room.startAgreements.A);
  await cb.send({action:'startAgreement',lobbyRevision:cb.view().room.lobbyRevision});
  await ca.until(()=>!!ca.view().mission);
  const ma=ca.view().mission!,mb=cb.view().mission!;
  if(foundry) {
    assert.deepEqual(ma,mb);assert.deepEqual(ma.partnerHazards,[]);
    assert.equal(ma.ruleVersion,'SF-T1-v2');assert.deepEqual(ma.foundry!.gates.map(g=>g.open),[true,false]);
  } else {
  assert.deepEqual(ma.partnerHazards,[0,7]); assert.deepEqual(mb.partnerHazards,[1,7]);
  assert.equal(ma.ownKnownCells[1],null); assert.equal(mb.ownKnownCells[0],null);
  assert.deepEqual(Object.keys(ma).sort(),['id','ruleVersion','title','turn','turnsResolved','strikes','positions','exits','proposals','planningRevision','ready','signals','ownKnownCells','partnerHazards','result','explanations','retryAgreements'].sort());
  }
  assert.equal((await fetch(app.origin+'/content/missions.js')).status,404);
  assert.equal((await fetch(app.origin+'/rules/joint-exit.js')).status,404);
  function action(client:typeof ca,name:string,extra={}){ const m=client.view().mission!; return {action:name,missionId:m.id,turn:m.turn,planningRevision:m.planningRevision,...extra}; }
  await cb.send(action(cb,'signal',{cell:1}));
  await ca.until(()=>foundry ? !!ca.view().mission!.signals.B : ca.view().mission!.ownKnownCells[1]?.safety==='Danger');
  const readyA=ca.make(action(ca,'ready')),readyB=cb.make(action(cb,'ready'));
  ca.ws.send(JSON.stringify(readyA));cb.ws.send(JSON.stringify(readyB));
  await Promise.all([ca.until(()=>ca.view().mission!.turnsResolved===1),cb.until(()=>cb.view().mission!.turnsResolved===1)]);
  assert.deepEqual(ca.view().mission!.positions,cb.view().mission!.positions);
  assert.equal(ca.view().mission!.turn,2); assert.equal(ca.view().mission!.strikes,0);
  const version=cb.view().room.roomVersion; cb.ws.send(JSON.stringify(readyB));
  // A replay sends a fresh snapshot without a mutation/version increment.
  await cb.send(action(cb,'propose',{destination:foundry ? 8 : 5}));
  assert.equal(cb.view().mission!.turnsResolved,1);assert.equal(cb.view().room.roomVersion,version+1);
  if(foundry) {
    const sync=async()=>{
      const version=Math.max(ca.view().room.roomVersion,cb.view().room.roomVersion);
      await Promise.all([ca.until(()=>ca.view().room.roomVersion===version),cb.until(()=>cb.view().room.roomVersion===version)]);
    };
    for(const [a,b] of [[1,8],[2,8],[2,9],[2,10],[3,11]]) {
      await sync();await ca.send(action(ca,'propose',{destination:a}));await sync();
      await cb.send(action(cb,'propose',{destination:b}));await sync();
      await ca.send(action(ca,'ready'));await sync();await cb.send(action(cb,'ready'));await sync();
      assert.deepEqual(ca.view().mission,cb.view().mission);
    }
    assert.equal(ca.view().mission!.result,'success');assert.equal(ca.view().mission!.turnsResolved,6);
    await ca.send({action:'retryAgreement',missionId:ca.view().mission!.id});await sync();
    await cb.send({action:'retryAgreement',missionId:cb.view().mission!.id});await sync();
    assert.deepEqual(ca.view().mission!.foundry!.gates.map(g=>g.latched),[false,false]);
  }
});
