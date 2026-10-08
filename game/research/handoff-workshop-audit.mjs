import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { newMission, moveFoundry } from '../dist/src/rules/joint-exit.js';

// Design-only search against production rules; never registers a campaign room.
const definition = JSON.parse(readFileSync(new URL('./handoff-workshop.json', import.meta.url), 'utf8'));
const initial = newMission('design-audit', definition);
const key = m => `${m.positions.A},${m.positions.B},${m.crate},${m.latchedGates.slice().sort((a,b)=>a-b).join('.')}`;
const states = [initial], ids = new Map([[key(initial), 0]]), edges = [], parents = [null], goals = [];
const neighbors = cell => {
  const {width,height,walls} = definition.factory;
  return [cell-1,cell+1,cell-width,cell+width].filter(n => n>=0 && n<width*height && !walls.includes(n)
    && Math.abs(n%width-cell%width)+Math.abs(Math.floor(n/width)-Math.floor(cell/width))===1);
};
let transitions = 0;
for (let id=0; id<states.length; id++) {
  const m = states[id]; edges[id] = [];
  if (m.result==='success') { goals.push(id); continue; }
  for (const role of ['A','B']) for (const destination of neighbors(m.positions[role])) for (const kind of ['move','pull']) {
    const n=moveFoundry(m,role,destination,kind);
    if (n.turnsResolved===m.turnsResolved) continue;
    const k=key(n); let target=ids.get(k);
    const action={role,destination,kind,crateBefore:m.crate,crateAfter:n.crate};
    if (target===undefined) { target=states.length;ids.set(k,target);states.push(n);parents.push({id,action}); }
    edges[id].push({target,action}); transitions++;
  }
}
const reverse=states.map(()=>[]);
edges.forEach((out,id)=>out.forEach(e=>reverse[e.target].push(id)));
const recoverable=new Set(goals), frontier=[...goals], recoveryDistance=new Map(goals.map(id=>[id,0]));
for(let i=0;i<frontier.length;i++)for(const origin of reverse[frontier[i]])if(!recoverable.has(origin)){recoverable.add(origin);frontier.push(origin);recoveryDistance.set(origin,recoveryDistance.get(frontier[i])+1);}
const routeTo = id => {
  const route=[];
  while(parents[id]) { const p=parents[id];route.push({...p.action,positions:states[id].positions,latchedGates:states[id].latchedGates});id=p.id; }
  return route.reverse();
};
// Augment the graph with the set of roles that have transported the crate.
const aug=[{id:0,mask:0,parent:null,action:null}], seen=new Set(['0/0']);let handoff=null;
for(let i=0;i<aug.length;i++) {
  const a=aug[i];
  if(states[a.id].result==='success'&&a.mask===3){handoff=i;break;}
  for(const e of edges[a.id]) {
    const mask=a.mask|(e.action.crateAfter!==e.action.crateBefore?(e.action.role==='A'?1:2):0),k=`${e.target}/${mask}`;
    if(!seen.has(k)){seen.add(k);aug.push({id:e.target,mask,parent:i,action:e.action});}
  }
}
const handoffRoute=[];
if(handoff!==null)for(let i=handoff;aug[i].parent!==null;i=aug[i].parent)handoffRoute.push({...aug[i].action,positions:states[aug[i].id].positions,latchedGates:states[aug[i].id].latchedGates});
handoffRoute.reverse();
const restricted = (allowed, movementRoles=['A','B']) => {
  const q=[0], seen=new Set(q);
  for(let i=0;i<q.length;i++) {
    const id=q[i];if(states[id].result==='success')return {solvable:true,visited:seen.size};
    for(const e of edges[id])if(movementRoles.includes(e.action.role)&&(e.action.crateBefore===e.action.crateAfter||allowed.includes(e.action.role))&&!seen.has(e.target)){seen.add(e.target);q.push(e.target);}
  }
  return {solvable:false,visited:seen.size};
};
const report={
  evidence:'Exhaustive ordered-action search using the compiled production moveFoundry engine; no human or UI test.',
  definition, reachableStates:states.length, successfulTransitions:transitions, successStates:goals.length,
  recoverableStates:recoverable.size, unrecoverableStates:states.length-recoverable.size,
  maximumShortestRecoverySteps:Math.max(...recoveryDistance.values()),
  compiledEngineSha256:createHash('sha256').update(readFileSync(new URL('../dist/src/rules/joint-exit.js',import.meta.url))).digest('hex'),
  shortestCompletion:goals.length?routeTo(goals[0]):null,
  shortestBothTransportCompletion:handoff===null?null:handoffRoute,
  onlyACanTransport:restricted(['A']),onlyBCanTransport:restricted(['B']),
  onlyACanMove:restricted(['A'],['A']),onlyBCanMove:restricted(['B'],['B']),
  firstUnrecoverable:states.findIndex((_,id)=>!recoverable.has(id))<0?null:routeTo(states.findIndex((_,id)=>!recoverable.has(id)))
};
const output = new URL('../../docs/handoff-workshop-validation.json',import.meta.url);
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output:fileURLToPath(output),reachable:report.reachableStates,recoverable:report.recoverableStates,success:report.successStates,shortest:report.shortestCompletion?.length,handoff:report.shortestBothTransportCompletion?.length,onlyA:report.onlyACanTransport,onlyB:report.onlyBCanTransport}));
if(!goals.length||recoverable.size!==states.length||handoff===null||report.onlyACanMove.solvable||report.onlyBCanMove.solvable)process.exitCode=1;
