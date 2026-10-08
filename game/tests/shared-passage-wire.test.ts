import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';
import { createApplication } from '../src/server/app.js';
import { Store } from '../src/server/store.js';
import { foundryAdventure } from '../src/content/missions.js';
import type { LobbyView, ServerMessage, Role } from '../src/contracts/lobby.js';

test('two wire seats agree on progression, share the pressure gate, complete and retry the current room', async t => {
  const app=await createApplication({store:new Store(undefined,{},foundryAdventure)});t.after(()=>app.close());
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
  async function move(r:Role,c:number){await seats[r].send({action:'move',from:seats[r].view().mission!.positions[r],destination:c});await sync();}
  for(const [r,c] of [['A',1],['A',2],['B',9],['B',10],['B',11],['A',3]] as [Role,number][])await move(r,c);
  const first=seats.A.view().mission!.id;
  await seats.A.send({action:'nextAgreement'});await sync();await seats.B.send({action:'retryAgreement'});await sync();
  assert.equal(seats.A.view().mission!.id,first);assert.deepEqual(seats.B.view().mission!.foundry!.choices,{A:'next',B:'retry'});
  const next=await seats.B.send({action:'nextAgreement'});await sync();const second=seats.A.view().mission!.id;
  assert.notEqual(second,first);assert.equal(seats.B.view().mission!.foundry!.width,5);
  seats.B.ws.send(JSON.stringify(next));await seats.A.send({action:'ping',cell:8});await sync();assert.equal(seats.B.view().mission!.id,second);
  const route:[Role,number][]=[['A',1],['B',13],['A',6],['B',8],['A',11],['A',12],['B',13],['B',14],['A',13],['A',8],['B',13],['B',12],['B',11],['A',3],['A',4],['B',10]];
  for(const [r,c] of route){await move(r,c);assert.equal(seats.A.view().mission!.positions[r],c);}
  assert.deepEqual(seats.A.view().mission,seats.B.view().mission);assert.equal(seats.A.view().mission!.turnsResolved,16);
  assert.equal(seats.A.view().mission!.result,'success');assert.equal(seats.A.view().mission!.foundry!.nextTitle,null);
  await seats.A.send({action:'retryAgreement'});await sync();await seats.B.send({action:'retryAgreement'});await sync();
  assert.equal(seats.A.view().mission!.title,'Trade Places');assert.equal(seats.B.view().mission!.turnsResolved,0);
  assert.deepEqual(seats.A.view().mission!.positions,{A:0,B:14});assert.deepEqual(seats.A.view().mission!.signals,{A:null,B:null});
});
