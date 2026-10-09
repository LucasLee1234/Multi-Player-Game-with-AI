import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { conveyorHandoff } from '../dist/src/content/missions.js';
import { newMission, moveFoundry } from '../dist/src/rules/joint-exit.js';
const first=newMission('belt-audit',conveyorHandoff), f=conveyorHandoff.factory;
const key=m=>`${m.positions.A}/${m.positions.B}/${m.crate}/${m.latchedGates.slice().sort().join('.')}`;
const states=[first], ids=new Map([[key(first),0]]), reverse=[[]], parents=[null], goals=[];
let edges=0;
for(let i=0;i<states.length;i++) {
  const m=states[i];if(m.result){goals.push(i);continue;}
  for(const role of ['A','B'])for(const destination of [m.positions[role]-1,m.positions[role]+1,m.positions[role]-f.width,m.positions[role]+f.width])for(const kind of ['move','pull']) {
    let n;try{n=moveFoundry(m,role,destination,kind);}catch{continue;}
    if(n.turnsResolved===m.turnsResolved)continue;
    const k=key(n);let target=ids.get(k);
    if(target===undefined){target=states.length;ids.set(k,target);states.push(n);reverse.push([]);parents.push({id:i,action:[role,destination,kind]});}
    reverse[target].push(i);edges++;
  }
}
const recovered=new Set(goals), queue=[...goals], recovery=new Map(goals.map(id=>[id,0]));
for(let i=0;i<queue.length;i++)for(const id of reverse[queue[i]])if(!recovered.has(id)){recovered.add(id);queue.push(id);recovery.set(id,recovery.get(queue[i])+1);}
const route=id=>{const result=[];while(parents[id]){result.push(parents[id].action);id=parents[id].id;}return result.reverse();};
const report={definition:conveyorHandoff,evidence:'Exhaustive spatial search using the compiled production engine, not human playtesting.',reachable:states.length,edges,goals:goals.length,recoverable:recovered.size,unrecoverable:states.length-recovered.size,maximumRecovery:Math.max(...recovery.values()),shortest:goals.length?route(goals[0]):null,firstUnrecoverable:states.findIndex((_,id)=>!recovered.has(id))};
writeFileSync(new URL('../../docs/conveyor-validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));assert.ok(goals.length);assert.equal(recovered.size,states.length);
