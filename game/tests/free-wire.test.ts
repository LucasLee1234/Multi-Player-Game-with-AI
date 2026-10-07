import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';
import { createApplication } from '../src/server/app.js';
import { Store } from '../src/server/store.js';
import { firstConnectionFree } from '../src/content/missions.js';
import type { LobbyView, ServerMessage } from '../src/contracts/lobby.js';

test('two wire clients start automatically, move concurrently without revision conflicts, finish and retry',async t=>{
  const app=await createApplication({store:new Store(undefined,{},firstConnectionFree)});t.after(()=>app.close());
  async function post(path:string,body:unknown,cookie?:string) {
    const r=await fetch(app.origin+path,{method:'POST',headers:{Origin:app.origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
    assert.equal(r.status,200);return {data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
  }
  const a=await post('/api/session',{}),b=await post('/api/session',{});
  const room=await post('/api/rooms',{requestId:'free_create',expectedContextVersion:0},a.cookie);
  await post('/api/rooms/join',{requestId:'free_join01',expectedContextVersion:0,code:room.data.context.view.room.code},b.cookie);
  function client(cookie:string) {
    const ws=new WebSocket(app.origin.replace('http','ws')+'/ws',{headers:{Origin:app.origin,Cookie:cookie}});
    let view:LobbyView|undefined;const acks=new Map<string,Extract<ServerMessage,{type:'ack'}>>(),listeners=new Set<()=>void>();
    ws.on('message',data=>{const m=JSON.parse(data.toString()) as ServerMessage;if(m.type==='snapshot'&&m.context.view)view=m.context.view;if(m.type==='ack')acks.set(m.requestId,m);for(const f of listeners)f();});
    ws.on('error',()=>{});t.after(()=>ws.terminate());
    function until(predicate:()=>boolean) {return new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>{listeners.delete(check);reject(new Error('Free-movement wire timeout'));},2_000);
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
  const ca=client(a.cookie!),cb=client(b.cookie!);
  await Promise.all([ca.until(()=>!!ca.view()?.mission),cb.until(()=>!!cb.view()?.mission)]);
  const sync=async()=>{const v=Math.max(ca.view().room.roomVersion,cb.view().room.roomVersion);await Promise.all([ca.until(()=>ca.view().room.roomVersion===v),cb.until(()=>cb.view().room.roomVersion===v)]);};
  assert.deepEqual(ca.view().mission!.ready,{A:false,B:false});
  const first=await ca.send({action:'move',from:0,destination:1});await sync();
  await Promise.all([ca.send({action:'move',from:1,destination:2}),cb.send({action:'ping',cell:2})]);await sync();
  assert.deepEqual(ca.view().mission!.positions,{A:2,B:8});
  ca.ws.send(JSON.stringify(first)); // same uncertain request cannot move a second time
  await cb.send({action:'move',from:8,destination:9});await sync();
  await Promise.all([ca.send({action:'move',from:2,destination:3}),cb.send({action:'move',from:9,destination:10})]);await sync();
  await cb.send({action:'move',from:10,destination:11});await sync();
  assert.equal(ca.view().mission!.result,'success');assert.equal(ca.view().mission!.turnsResolved,6);
  assert.deepEqual(ca.view().mission,cb.view().mission);
  await ca.send({action:'retryAgreement'});await sync();await cb.send({action:'retryAgreement'});await sync();
  assert.equal(ca.view().mission!.turnsResolved,0);assert.deepEqual(ca.view().mission!.signals,{A:null,B:null});
});
