import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';
import { createApplication } from '../src/server/app.js';
import { Store } from '../src/server/store.js';
import { keepPowerOn } from '../src/content/missions.js';
import type { LobbyView, ServerMessage, Role } from '../src/contracts/lobby.js';

test('two wire seats share atomic crate moves and complete sustained extraction', async t => {
  const app=await createApplication({store:new Store(undefined,{},keepPowerOn)});t.after(()=>app.close());
  async function post(path:string,body:unknown,cookie?:string) {
    const r=await fetch(app.origin+path,{method:'POST',headers:{Origin:app.origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
    assert.equal(r.status,200);return {data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
  }
  const a=await post('/api/session',{}),b=await post('/api/session',{});
  const room=await post('/api/rooms',{requestId:'passage_create',expectedContextVersion:0},a.cookie);
  await post('/api/rooms/join',{requestId:'passage_join',expectedContextVersion:0,code:room.data.context.view.room.code},b.cookie);
  function client(cookie:string) {
    const ws=new WebSocket(app.origin.replace('http','ws')+'/ws',{headers:{Origin:app.origin,Cookie:cookie}});
    let view:LobbyView|undefined;const acks=new Map<string,Extract<ServerMessage,{type:'ack'}>>(),listeners=new Set<()=>void>();
    ws.on('message',data=>{const m=JSON.parse(data.toString()) as ServerMessage;if(m.type==='snapshot'&&m.context.view)view=m.context.view;if(m.type==='ack')acks.set(m.requestId,m);for(const f of listeners)f();});
    ws.on('error',()=>{});t.after(()=>ws.terminate());
    function until(predicate:()=>boolean) {return new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>{listeners.delete(check);reject(new Error('Passage wire timeout'));},2_000);
      function check(){if(predicate()){clearTimeout(timer);listeners.delete(check);resolve();}}
      listeners.add(check);check();
    });}
    async function send(action:Record<string,unknown>) {
      const requestId=randomUUID(),version=view!.room.roomVersion;
      const cmd={type:'command',requestId,sequence:view!.self.nextCommandSequence,roomId:view!.room.id,controllerEpoch:view!.self.controllerEpoch,missionId:view!.mission!.id,...action};
      ws.send(JSON.stringify(cmd));await until(()=>acks.has(requestId)&&view!.room.roomVersion>version);
      assert.equal(acks.get(requestId)!.ok,true);return cmd;
    }
    return {ws,until,send,view:()=>view!};
  }
  const seats={A:client(a.cookie!),B:client(b.cookie!)};
  await Promise.all(Object.values(seats).map(c=>c.until(()=>!!c.view()?.mission)));
  async function sync(){const v=Math.max(...Object.values(seats).map(c=>c.view().room.roomVersion));await Promise.all(Object.values(seats).map(c=>c.until(()=>c.view().room.roomVersion===v)));}
  async function move(r:Role,c:number,kind:'move'|'pull'='move'){
    const m=seats[r].view().mission!;
    await seats[r].send({action:'crateMove',from:m.positions[r],crateFrom:m.foundry!.crate!.cell,destination:c,kind});await sync();
    assert.deepEqual(seats.A.view().mission,seats.B.view().mission);
  }
  const original=seats.A.view().mission!.id;
  await move('A',1);
  await seats.A.send({action:'restartAgreement',restartRevision:seats.A.view().restart.revision});await sync();
  assert.equal(seats.B.view().restart.requestedBy,'A');assert.equal(seats.B.view().mission!.id,original);
  await seats.B.send({action:'cancelRestart',restartRevision:seats.B.view().restart.revision});await sync();
  assert.equal(seats.A.view().restart.requestedBy,null);
  await seats.B.send({action:'restartAgreement',restartRevision:seats.B.view().restart.revision});await sync();
  const restarted=await seats.A.send({action:'restartAgreement',restartRevision:seats.A.view().restart.revision});await sync();
  const newId=seats.A.view().mission!.id;assert.notEqual(newId,original);
  assert.equal(seats.B.view().mission!.turnsResolved,0);assert.equal(seats.B.view().mission!.foundry!.crate!.cell,12);
  seats.A.ws.send(JSON.stringify(restarted));await seats.B.send({action:'ping',cell:8});await sync();
  assert.equal(seats.A.view().mission!.id,newId);
  await seats.A.send({action:'selectLevel',stage:3,levelRevision:seats.A.view().campaign.revision});await sync();
  await seats.B.send({action:'selectLevel',stage:3,levelRevision:seats.B.view().campaign.revision});await sync();
  assert.equal(seats.A.view().mission!.foundry!.stage,3);assert.deepEqual(seats.A.view().campaign,seats.B.view().campaign);
  const route:[Role,number,'move'|'pull'][]=[['A',1,'move'],['A',6,'move'],['B',13,'move'],['B',14,'pull'],['B',9,'move'],['B',8,'move'],['B',3,'pull'],['B',2,'move'],['A',1,'move'],['A',0,'move'],['B',1,'move'],['B',6,'move'],['A',1,'move'],['A',2,'move'],['A',3,'move'],['A',4,'move'],['B',11,'move'],['B',10,'move']];
  for(const [r,c,k] of route)await move(r,c,k);
  assert.equal(seats.A.view().mission!.turnsResolved,18);
  assert.equal(seats.A.view().mission!.result,'success');
  assert.equal(seats.A.view().mission!.foundry!.crate!.cell,8);
  assert.equal(seats.B.view().mission!.foundry!.gates[1]!.powered,true);
  assert.equal(seats.A.view().mission!.foundry!.nextTitle,null);
  await seats.A.send({action:'retryAgreement'});await sync();await seats.B.send({action:'retryAgreement'});await sync();
  assert.equal(seats.A.view().mission!.title,'Keep the Power On');
  assert.equal(seats.B.view().mission!.turnsResolved,0);
  assert.deepEqual(seats.A.view().mission!.positions,{A:0,B:14});
  assert.equal(seats.A.view().mission!.foundry!.crate!.cell,12);
});
