import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepPowerOn, handoffWorkshop } from '../src/content/missions.js';
import { newMission, moveFoundry, project, type Mission } from '../src/rules/joint-exit.js';
import { crateAction, crateFailure, pullDirection } from '../src/client/crate-help.js';

for (const definition of [keepPowerOn, handoffWorkshop]) test(`crate direction previews match the server in every reachable state: ${definition.title}`, () => {
  const first = newMission('preview', definition), queue = [first];
  const key = (m: Mission) => `${m.positions.A},${m.positions.B},${m.crate},${m.latchedGates.join(',')}`;
  const seen = new Set([key(first)]);
  for (let i = 0; i < queue.length; i++) {
    const m = queue[i]!;
    for (const role of ['A', 'B'] as const) {
      const view = project(m, role), b = view.foundry!;
      for (let destination = 0; destination < b.width * b.height; destination++) for (const kind of ['move', 'pull'] as const) {
        const hint = crateAction(view, role, destination, kind === 'pull');
        let next: Mission | undefined;
        try { next = moveFoundry(m, role, destination, kind); } catch { /* Geometry or completed mission. */ }
        assert.equal(hint !== null, !!next && next.crate !== m.crate, `${key(m)} ${role} ${destination} ${kind}`);
        if (next && !seen.has(key(next))) { seen.add(key(next)); queue.push(next); }
      }
    }
  }
  assert.ok(seen.size > 1000);
});

test('crate failures explain the corrective action', () => {
  assert.match(crateFailure('A: Pull needs the crate directly behind you.'), /Stand next.*Turn Pull OFF/);
  assert.match(crateFailure('A: The crate cannot be pushed into a wall or off the map.'), /another side.*Pull/);
  assert.match(crateFailure('B: Your partner is blocking the crate.'), /make room/);
  assert.match(crateFailure('B: The crate cannot enter a closed gate.'), /power its relay/);
});

test('pull corrections explain all four straight-away directions and reject row wrapping', () => {
  const m = project(newMission('pull_help', keepPowerOn), 'A');
  m.foundry!.crate!.cell = 7;
  for (const [cell, name] of [[8, 'right'], [6, 'left'], [12, 'down'], [2, 'up']] as const) {
    m.positions.A = cell;
    assert.equal(pullDirection(m, 'A')?.name, name);
    assert.match(crateFailure('Pull needs the crate directly behind you.', m, 'A'), new RegExp(`Pull ${name}.*Turn Pull OFF`));
  }
  m.foundry!.crate!.cell = 4; m.positions.A = 5;
  assert.equal(pullDirection(m, 'A'), null);
});
