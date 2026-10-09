// Run inside the built runtime via stdin: docker exec -i <container> node --input-type=module.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';
const base='http://127.0.0.1:3000', origin='https://container.example.test';
assert.notEqual(process.getuid(),0,'Runtime must not run as root.');
for(const path of ['/app/tests','/app/src','/app/research','/app/.git','/docs'])assert.equal(existsSync(path),false,`Unexpected runtime file: ${path}`);
let healthy=false;
for(let attempt=0;attempt<50&&!healthy;attempt++) {
  try { healthy=(await fetch(base+'/health/ready')).status===200; } catch { /* Container may still be starting. */ }
  if(!healthy)await new Promise(r=>setTimeout(r,100));
}
assert.equal(healthy,true,'Container readiness deadline exceeded.');
assert.match(await (await fetch(base+'/')).text(),/6 rooms/);
for(const path of ['/styles.css','/client.js','/crate-help.js','/audio.js'])assert.equal((await fetch(base+path)).status,200);
for(const path of ['/src/server/store.ts','/tests/manual-partner.mjs','/docs/competition-plan.md'])assert.equal((await fetch(base+path)).status,404);
async function post(path,body,cookie) {
  const r=await fetch(base+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
  const data=await r.json();assert.equal(data.ok,true,`HTTP command failed: ${data.error}`);
  return {data,cookie:r.headers.get('set-cookie')?.split(';')[0],setCookie:r.headers.get('set-cookie')};
}
const sessions={A:await post('/api/session',{}),B:await post('/api/session',{})};
for(const s of Object.values(sessions))assert.match(s.setCookie,/__Host-sr_session=.*HttpOnly.*SameSite=Strict.*Secure/);
const created=await post('/api/rooms',{requestId:randomUUID(),expectedContextVersion:0},sessions.A.cookie);
await post('/api/rooms/join',{requestId:randomUUID(),expectedContextVersion:0,code:created.data.context.view.room.code},sessions.B.cookie);
const seats={};
async function waitFor(predicate) {
  const until=Date.now()+5000;
  while(!predicate()){if(Date.now()>until)throw new Error('Container snapshot deadline exceeded.');await new Promise(r=>setTimeout(r,10));}
}
for(const role of ['A','B']) {
  const ws=new WebSocket(base.replace('http','ws')+'/ws',{headers:{Origin:origin,Cookie:sessions[role].cookie}});
  const seat=seats[role]={ws,view:null,acks:new Map()};
  ws.on('message',raw=>{const m=JSON.parse(raw.toString());if(m.type==='snapshot')seat.view=m.context.view;if(m.type==='ack')seat.acks.set(m.requestId,m);});
  await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
}
try {
  await waitFor(()=>seats.A.view?.mission&&seats.B.view?.mission);
  assert.deepEqual(seats.A.view.campaign.levels.map(l=>l.stage),[1,2,3,4,5,6]);
  async function send(role,fields) {
    const s=seats[role],v=s.view,id=randomUUID();
    s.ws.send(JSON.stringify({type:'command',requestId:id,sequence:v.self.nextCommandSequence,roomId:v.room.id,controllerEpoch:v.self.controllerEpoch,...fields}));
    await waitFor(()=>s.acks.has(id));assert.equal(s.acks.get(id).ok,true,`Wire command failed: ${s.acks.get(id).error}`);
    if(fields.action!=='leave')await waitFor(()=>s.view?.self.nextCommandSequence>v.self.nextCommandSequence);
    // Stay below the production connection's token-bucket rate.
    await new Promise(r=>setTimeout(r,110));
  }
  for(const role of ['A','B'])await send(role,{action:'selectLevel',missionId:seats[role].view.mission.id,levelRevision:seats[role].view.campaign.revision,stage:4});
  await waitFor(()=>Object.values(seats).every(s=>s.view?.mission?.foundry?.stage===4));
  const route=[['A',1],['A',6],['B',9],['B',8],['B',3],['B',2],['A',1],['A',0],['B',1],['B',6],['A',1],['A',2],['A',3],['A',8],['B',11],['B',16],['A',13],['A',14,'pull'],['A',9],['A',8],['A',13],['A',8],['B',11],['A',9],['A',4],['B',10]];
  for(const [role,destination,kind='move'] of route){const m=seats[role].view.mission;await send(role,{action:'crateMove',missionId:m.id,from:m.positions[role],crateFrom:m.foundry.crate.cell,destination,kind});}
  await waitFor(()=>Object.values(seats).every(s=>s.view?.mission?.result==='success'));
  assert.equal(seats.A.view.mission.turnsResolved,26);assert.deepEqual(seats.A.view.campaign.completed,[4]);
  assert.deepEqual(seats.A.view.mission,seats.B.view.mission);
  for(const role of ['A','B'])await send(role,{action:'retryAgreement',missionId:seats[role].view.mission.id});
  await waitFor(()=>Object.values(seats).every(s=>s.view?.mission?.turnsResolved===0));
  assert.equal(seats.A.view.mission.foundry.crate.cell,12);
  for(const role of ['A','B'])await send(role,{action:'selectLevel',missionId:seats[role].view.mission.id,levelRevision:seats[role].view.campaign.revision,stage:6});
  await waitFor(()=>Object.values(seats).every(s=>s.view?.mission?.foundry?.stage===6));
  assert.deepEqual(seats.A.view.mission.foundry.conveyor.path,[12,13,18]);
  assert.equal(seats.A.view.mission.foundry.gates.some(g=>g.cell===13),false);
  const beltRoute=[['A',1],['A',6],['B',9],['B',8],['B',3],['B',2],['A',1],['A',0],['B',1],['B',6],['A',1],['A',2],['A',3],['A',8],['B',11],['B',16],['B',11],['A',9],['A',4],['B',10]];
  for(const [role,destination] of beltRoute){const m=seats[role].view.mission;await send(role,{action:'crateMove',missionId:m.id,from:m.positions[role],crateFrom:m.foundry.crate.cell,destination,kind:'move'});}
  await waitFor(()=>Object.values(seats).every(s=>s.view?.mission?.result==='success'));
  assert.equal(seats.A.view.mission.foundry.crate.cell,18);assert.equal(seats.A.view.mission.turnsResolved,20);
  assert.deepEqual(seats.A.view.campaign.completed,[4,6]);assert.deepEqual(seats.A.view.mission,seats.B.view.mission);
  for(const role of ['A','B'])await send(role,{action:'retryAgreement',missionId:seats[role].view.mission.id});
  await waitFor(()=>Object.values(seats).every(s=>s.view?.mission?.turnsResolved===0));
  assert.equal(seats.A.view.mission.foundry.crate.cell,12);
  await send('A',{action:'leave'});await waitFor(()=>seats.A.view===null&&seats.B.view===null);
  console.log('Container smoke passed: non-root runtime, minimal files, health/assets, secure cookie, six levels, two-wire fourth/sixth-room completion, replay and exit.');
} finally {for(const s of Object.values(seats))s.ws.close();}
